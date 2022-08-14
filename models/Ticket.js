const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const config = require('../config/keys');
const globalUtils = require('../utility/globalUtils')
const mongoosePaginate = require('mongoose-paginate-v2');
const Site = require('../enum/site');
const Settings = require('../config/settings');
const { GlobalNotification, GlobalNotificationType } = require('./GlobalNotification');
const { log } = require('../models/Logger');

const ticketReplySchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    replyText: { type: String, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
})

const ticketSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    subject: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    closed: { type: Boolean, required: true, default: false },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    replies: [ticketReplySchema],
}, { timestamps: true })

ticketSchema.plugin(AutoIncrement, { inc_field: 'ticketId' });

ticketSchema.plugin(mongoosePaginate);

ticketSchema.methods.Create = async function (callback) {
    this.save().then((result => {
        return callback(config.website.mainURL + 'ticket/' + result.ticketId);
    })).catch(err => {
        log.info(err);
        return callback(false);
    })
}

ticketSchema.statics.CloseTicket = async function (ticketId, user, callback) {
    let query = {}
    if (user.role === Site.ROLES.Admin || user.role === Site.ROLES.Moderator) {
        query = { 'ticketId': ticketId };
    } else {
        query = { ticketId: ticketId, owner: user._id };
    }
    await Ticket.updateOne(query, { closed: true }).exec((err, docs) => {
        if (err) {
            log.info(err)
            return callback(false)
        }
        return callback(true);
    });
}

ticketSchema.statics.getTicket = function (ticketId, user) {

    return new Promise((resolve, reject) => {
        let query = {}
        if (user.role === Site.ROLES.Admin || user.role === Site.ROLES.Moderator) {
            query = { 'ticketId': ticketId };
        } else {
            query = { 'ticketId': ticketId, 'owner': user._id };
        }

        Ticket.findOne(query)
            .populate('owner', 'name profilePic profileUrl userId')
            .populate('replies.owner', 'name profilePic profileUrl userId')
            .lean()
            .then(result => {
                if (result) {
                    return resolve(result);
                } else {
                    return reject()
                }
            }).catch(err => {
                log.info(err);
                return reject()
            })
    })

}

ticketSchema.statics.AddReply = async function (ownerId, ticketId, replyText, user_Id, callback) {
    let ticketReply = new TicketReply({
        _id: new mongoose.Types.ObjectId(),
        owner: user_Id,
        replyText: replyText
    });


    await Ticket.updateOne({ ticketId: ticketId }, { $push: { replies: ticketReply } }).exec((err, docs) => {
        if (err) {
            log.info(err)
            return callback(false)
        }

        if (ownerId != user_Id) {
            let notification = new GlobalNotification({
                parentId: ticketId,
                type: GlobalNotificationType.ticket,
                redirectId: '/ticket/' + ticketId,
                id: ticketId,
            });
            GlobalNotification.AddCounterNotification(ownerId, notification);
        }

        return callback(true);
    });

}

ticketSchema.statics.getMySupportTickets = async function (user_Id, page, isClosed) {

    const query = { owner: user_Id, closed: isClosed };
    const options = {
        sort: { createdAt: -1 },
        select: '-replies -description',
        lean: true,
        page: page,
        limit: Settings.postPerPageLimit,
    };

    return new Promise((resolve, reject) => {
        Ticket.paginate(query, options).then(result => {

            return resolve(globalUtils.getSeperatedPaginatedResult(result))
        }).catch(err => {
            return reject(err)
        })
    })
}

ticketSchema.statics.getAllTickets = async function (isClosed, page) {
    const query = { closed: isClosed };
    const options = {
        sort: { createdAt: -1 },
        select: '-replies -description',
        lean: true,
        page: page,
        limit: Settings.postPerPageLimit,
    };

    return new Promise((resolve, reject) => {
        Ticket.paginate(query, options).then(result => {

            return resolve(globalUtils.getSeperatedPaginatedResult(result))
        }).catch(err => {
            return reject(err)
        })
    })
}

const Ticket = mongoose.model('ticket', ticketSchema, 'tickets');
const TicketReply = mongoose.model('ticketReply', ticketReplySchema, 'ticketReplys');

module.exports = Ticket;