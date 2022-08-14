const mongoose = require('mongoose');
const globalUtils = require('../utility/globalUtils')
const Ticket = require('./Ticket');
const Report = require('../models/Report');
const User = require('../models/User');
const Site = require('../enum/site');
const Settings = require('../config/settings');
const { GlobalNotification, GlobalNotificationType } = require('./GlobalNotification');


class Admin {

    static async getDashBoardData() {
        let result = {
            totalUsers: 0,
            totalPosts: 0,
            openTickets: 0,
            closedTickets: 0,
            openReports: 0,
            closedReports: 0,
        }

        result.totalUsers = await mongoose.model('user').estimatedDocumentCount();
        result.totalPosts = await mongoose.model('post').estimatedDocumentCount();
        result.openTickets = await mongoose.model('ticket').countDocuments({ closed: false });
        result.closedTickets = await mongoose.model('ticket').countDocuments({ closed: true });
        result.openReports = await mongoose.model('report').countDocuments({ result: 2 });
        result.closedReports = await mongoose.model('report').countDocuments({ result: { $lt: 2 } });
        return result;
    }

    static async searchUser(steam64ID) {
        return await User.findOne({ steamID: steam64ID });
    }

    static async updateUserRole(user_id, user, upgradeToRole) {


        if ((user.role === Site.ROLES.Admin || user.role === Site.ROLES.Moderator) && Site.ROLES[upgradeToRole] && Site.ROLES[upgradeToRole] != Site.ROLES.Admin) {
            const session = await mongoose.startSession();

            session.startTransaction();
            try {

                let result = await User.findByIdAndUpdate({ _id: user_id }, { 'role': upgradeToRole, 'roleColor': Settings.roleColor[upgradeToRole], 'roleName': Site.ROLES[upgradeToRole] }, { new: true, session: session }).lean();

                let notification = new GlobalNotification({
                    type: GlobalNotificationType.roleChange,
                    redirectId: '/profile',
                    role: Site.ROLES[upgradeToRole]
                });

                await GlobalNotification.AddNotification(user_id, notification, session);

                if (Site.ROLES[upgradeToRole] === Site.ROLES[Site.ROLES.Banned]) {
                    log.info('banning user');
                    await mongoose.model('post').updateMany({ userId: result.userId }, { $set: { "active": false } }, { multi: true, session: session });
                }


                await session.commitTransaction();
                session.endSession();
                return result;

            } catch (e) {
                await session.abortTransaction();
                log.info("The role notification creation transaction was aborted due to an unexpected error: " + e);
                return null;
            } finally {
                await session.endSession();
            }

        } else {
            return null;
        }
    }

    static async assginTicket(ticket_Id, assignedUser_Id, name) {
        let userAssigned = await Ticket.findOneAndUpdate({ _id: ticket_Id }, { 'assignedTo': assignedUser_Id });
        if (userAssigned) {
            let notification = new GlobalNotification({
                type: GlobalNotificationType.ticketAssigned,
                redirectId: '/ticket/' + userAssigned.ticketId,
                id: userAssigned.ticketId,
            });
            GlobalNotification.AddNotification(userAssigned.owner, notification);

            return true;
        }

    }

    static async assignReport(report_Id, user_Id) {
        return await Report.updateOne({ _id: report_Id }, { 'assignedTo': user_Id });
    }

    static async SetReportResult(reportResult, report_id, user_id) {
        if (reportResult == 'resolved') {
            return await Report.findOneAndUpdate({ _id: report_id, assignedTo: user_id }, { 'result': 1 }).exec();
        } else if (reportResult == 'invalid') {
            return await Report.findOneAndUpdate({ _id: report_id, assignedTo: user_id }, { 'result': 0 }).exec();
        } else {
            return null;
        }
    }

    static getTickets(isClosed, page, assigned_user_id = null) {
        let query = {};
        if (assigned_user_id) {
            query = { assignedTo: assigned_user_id, closed: false }
        } else {
            query = { closed: isClosed };
        }

        const options = {
            sort: { updatedAt: -1 },
            select: '-replies -description',
            populate: {
                path: 'assignedTo',
                model: 'user',
                select: 'name'
            },
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

    static getReports(isClosed, page, assigned_user_id = null) {
        let query = {};
        if (assigned_user_id) {
            query = { assignedTo: assigned_user_id, result: 2 }
        } else if (isClosed) {
            query = { result: { $lt: 2 } };
        } else {
            query = { result: 2, assignedTo: null };
        }

        const options = {
            sort: { updatedAt: -1 },
            populate: [{
                path: 'owner',
                model: 'user',
                select: 'name userId'
            }, {
                path: 'assignedTo',
                model: 'user',
                select: 'name'
            }],
            lean: true,
            page: page,
            limit: Settings.postPerPageLimit,
        };

        return new Promise((resolve, reject) => {
            Report.paginate(query, options).then(result => {
                return resolve(globalUtils.getSeperatedPaginatedResult(result))
            }).catch(err => {
                return reject(err)
            })
        })
    }
}

module.exports = Admin;