const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const config = require('../config/keys');
const Settings = require('../config/settings');
const globalUtils = require('../utility/globalUtils')
const mongoosePaginate = require('mongoose-paginate-v2');

const { log } = require('../models/Logger');

const REPORT_RESULT = {
    Resolved: 1,
    Invalid: 0,
    InProgress: 2,
    1: 'Resolved',
    0: 'Invalid',
    2: 'InProgress'
}

const REPORT_TYPE = {
    'user': 'user',
    'post': 'post',
    'postComment': 'postComment'
}



const REPORT_REASON = {
    '404': 'Reason not selected',
    '0': 'Scammer (Mention proof of scamming)',
    '1': 'Scam link/ Referral/ Phishing',
    '2': 'Being intolerant of people(Sexism/Homophobia etc.)',
    '3': 'Promoting a Steam group, Youtube Channel, etc.',
    '4': 'Not typing in english',
    '5': 'Spamming',
    '6': 'Harassing/making fun of a another user/me',
    '7': 'Trade is listed more than once by the same user',
    '8': 'Other',
}


const reportSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    reportType: { type: String, trim: true, required: true },
    reportObjId: { type: String, trim: true, required: true },
    reportParentId: { type: String, trim: true, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    result: { type: Number, required: true, default: REPORT_RESULT.InProgress },

}, { timestamps: true })

reportSchema.plugin(AutoIncrement, { inc_field: 'reportId' });

reportSchema.plugin(mongoosePaginate);

reportSchema.methods.Create = async function (callback) {
    this.save().then((result => {
        log.info(result);
        return callback(true);
    })).catch(err => {
        log.info(err);
        return callback(false);
    })
}

reportSchema.statics.CloseReport = async function (reportId, reportResult, callback) {
    await Report.updateOne({ reportId: reportId }, { result: ValidateReportResult(reportResult) }).exec((err, docs) => {
        if (err) {
            log.info(err)
            return callback(false)
        }
        return callback(true);
    });
}

reportSchema.statics.ValidateReportType = function (reportType) {
    if (REPORT_TYPE.hasOwnProperty(reportType)) {
        return reportType;
    }
}

reportSchema.statics.ValidateReportResult = function (reportResult) {
    if (REPORT_RESULT.hasOwnProperty(reportResult)) {
        return reportResult;
    }
}

reportSchema.statics.getMyReports = function (user_Id, page) {
    const query = { owner: user_Id };
    const options = {
        sort: { updatedAt: -1 },
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
        Report.paginate(query, options).then(result => {
            return resolve(globalUtils.getSeperatedPaginatedResult(result))
        }).catch(err => {
            return reject(err)
        })
    })
}



reportSchema.statics.getReportReason = function (reason) {
    if (REPORT_REASON[reason]) {
        return REPORT_REASON[reason]
    } else {
        return false;
    }
}


const Report = mongoose.model('report', reportSchema, 'reports');

module.exports = Report;