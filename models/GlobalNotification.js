const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const globalUtils = require('../utility/globalUtils');
const User = require('./User');
const { log } = require('./Logger');

let GlobalNotificationType = {
    offerComment: 'offerComment',
    offerReply: 'offerReply',
    ticket: 'ticket',
    ticketAssigned: 'ticketAssigned',
    report: 'report',
    roleChange: 'roleChange'
}

const globalNotificationSchema = mongoose.Schema({
    type: { type: String, required: true },
    redirectId: { type: String, required: true },
    role: { type: String, default: '' },
    parentId: { type: String, default: '' },
    counter: { type: Number, default: 1 },
    id: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } })

globalNotificationSchema.plugin(mongoosePaginate);

globalNotificationSchema.statics.AddNotification = async function (user_Id, notification, session = false) {
    if (session) {
        return await mongoose.model('user').updateOne({ _id: user_Id }, { $push: { 'notifications': notification } }, { session });
    }
    return await mongoose.model('user').updateOne({ _id: user_Id }, { $push: { 'notifications': notification } });
}

globalNotificationSchema.statics.AddCounterNotification = async function (receiverIds, notification) {

    if (Array.isArray(receiverIds)) {
        return await mongoose.model('user').updateMany({ _id: { $in: receiverIds } }, { $push: { 'notifications': notification } }, { multi: true });
    } else {
        mongoose.model('user').countDocuments({ _id: receiverIds, 'notifications.parentId': notification.parentId, 'notifications.id': notification.id, 'notifications.type': notification.type }, async function (err, count) {
            if (count > 0) {
                return await mongoose.model('user').updateOne({ _id: receiverIds, 'notifications.parentId': notification.parentId, 'notifications.id': notification.id, 'notifications.type': notification.type }, { $inc: { 'notifications.$.counter': 1 } });
            } else {
                GlobalNotification.AddNotification(receiverIds, notification);
            }
        });
    }

}



globalNotificationSchema.statics.RemoveNotification = async function (user_Id, notification_Id) {
    return await mongoose.model('user').updateOne({ _id: user_Id }, { $pull: { 'notifications': { _id: notification_Id } } });
}

globalNotificationSchema.statics.ClearAllNotifications = async function (user_Id) {
    return new Promise(async (resolve, reject) => {
        mongoose.model('user').updateOne({ _id: user_Id }, { $set: { "notifications": [] } }).then(() => {
            return resolve(true);
        }).catch(err => {
            log.info(err);
            return reject(false);
        })
    })

}




const GlobalNotification = mongoose.model('globalNotification', globalNotificationSchema, 'globalNotifications');

module.exports = { GlobalNotificationType: GlobalNotificationType, globalNotificationSchema: globalNotificationSchema, GlobalNotification: GlobalNotification, };
