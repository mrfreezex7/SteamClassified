const User = require('../models/User');
const settings = require('../config/settings');
const Site = require('../enum/site');

exports.getUpdatedUserData = async (req, res, next) => {
    if (req.user) {
        let result = await User.getUpdatedUserData(req.user._id);
        if (result) {
            req.user.role = result.role;
            req.user.usedSlots = result.activeSlots;
            req.user.maxSlots = settings.postSlotAllowedLimit[result.role];
            req.user.roleColor = settings.roleColor[result.role];
            req.user.roleName = Site.ROLES[result.role];
            req.user.notifications = result.notifications;
            req.user.tradeUrl = result.tradeUrl;
        }

    }

    next();
}

