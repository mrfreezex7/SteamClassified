const mongoose = require('mongoose');
const globalUtils = require('../utility/globalUtils')
const Settings = require('../config/settings');
const Site = require('../enum/site');
const { globalNotificationSchema } = require('./GlobalNotification');
const { log } = require('../models/Logger');

const userSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    profilePic: { type: String, required: true },
    profilePicFull: { type: String, required: true },
    steamID: { type: String, required: true },
    profileUrl: { type: String, required: true },
    bookmarks: { type: Array, required: true, default: [] },
    offers: { type: Array, required: true, default: [] },
    trades: { type: Number, required: true, default: 0 },
    views: { type: Number, required: true, default: 0 },
    activeSlots: { type: Number, required: true, default: 0 },
    tradeUrl: { type: String, default: '' },
    role: { type: Number, required: true, default: Site.ROLES.Member },
    roleColor: { type: String, required: true, default: Settings.roleColor[Site.ROLES.Member] },
    roleName: { type: String, required: true, default: Site.ROLES[Site.ROLES.Member] },
    notifications: [globalNotificationSchema]
}, { timestamps: true })

userSchema.statics.getMinimalData = (currentUser) => {
    return {
        _id: currentUser._id,
        name: currentUser.name,
        profilePic: currentUser.profilePic,
        steamID: currentUser.steamID,
        profileUrl: currentUser.profileUrl,
        userId: currentUser.userId,
    }
}

userSchema.statics.getProfileData = function (userId, isOwner, getTrades = false, page) {
    let query = { userId: userId };
    log.info(userId);


    return new Promise((resolve, reject) => {
        if (!isOwner) {
            this.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true }).exec(async (err, user) => {
                if (err) {
                    log.info(err)
                    return reject([])
                }
                let posts = [];

                if (getTrades) {
                    posts = await mongoose.model('post').getUserTradePosts(userId, page);
                }



                resolve({ user: user, posts: posts });
            });
        } else {
            this.findOne(query).exec(async (err, user) => {
                if (err) {
                    log.info(err)
                    return reject([])
                }

                let posts = [];

                if (getTrades) {
                    posts = await mongoose.model('post').getUserTradePosts(userId, page);
                }

                resolve({ user: user, posts: posts });
            });
        }
    })
}


userSchema.statics.addToOffers = async function (user_Id, post_Id) {
    return new Promise(async (resolve, reject) => {

        this.updateOne({ _id: user_Id }, { $addToSet: { 'offers': post_Id } }).exec(async (err, user) => {
            if (err) {
                log.info(err)
                return reject(err)
            }
            resolve(true);
        });

    })
}

userSchema.statics.getOffers = async function (user_Id, page) {
    return new Promise(async (resolve, reject) => {

        let user = await this.findOne({ _id: user_Id }, { offers: true }, { lean: true });
        if (user) {

            const query = { _id: { $in: user.offers } };
            const options = {
                sort: { active: -1, bump: -1 },
                populate: {
                    path: 'owner',
                    model: 'user',
                    select: 'name profilePic profileUrl userId roleColor'
                },
                lean: true,
                page: page,
                limit: Settings.postPerPageLimit,
            };

            mongoose.model('post').paginate(query, options).then(result => {
                return resolve(globalUtils.getSeperatedPaginatedResult(result))
            }).catch(err => {
                return reject(err)
            })

        } else {
            return reject();
        }

    })
}

userSchema.statics.setBookmark = async function (userId, postId, isBookmarked) {
    return new Promise(async (resolve, reject) => {
        if (!isBookmarked) {
            this.updateOne({ userId: userId }, { $addToSet: { 'bookmarks': postId } }).exec(async (err, user) => {
                if (err) {
                    log.info(err)
                    return reject(err)
                }
                await mongoose.model('post').updateBookmarkCount(postId, true);

                resolve(true);
            });


        } else {
            this.updateOne({ userId: userId }, { $pull: { 'bookmarks': postId } }).exec(async (err, user) => {
                if (err) {
                    log.info(err)
                    return reject(err)
                }
                await mongoose.model('post').updateBookmarkCount(postId, false);

                resolve(false);
            });
        }
    })
}

userSchema.statics.getBookmarks = async function (userId, page) {

    return new Promise(async (resolve, reject) => {

        let user = await this.findOne({ userId: userId }, { bookmarks: true }, { lean: true });
        if (user) {

            const query = { postId: { $in: user.bookmarks } };
            const options = {
                sort: { active: -1, bump: -1 },
                populate: {
                    path: 'owner',
                    model: 'user',
                    select: 'name profilePic profileUrl userId roleColor'
                },
                lean: true,
                page: page,
                limit: Settings.postPerPageLimit,
            };

            mongoose.model('post').paginate(query, options).then(result => {
                return resolve(globalUtils.getSeperatedPaginatedResult(result))
            }).catch(err => {
                return reject(err)
            })

        } else {
            return reject();
        }
    })
}

userSchema.statics.getUpdatedUserData = async function (user_Id) {
    return await User.findById(user_Id, 'role activeSlots notifications tradeUrl').exec();
}

userSchema.statics.UpdateTradeUrl = async function (user_Id, tradeUrl) {
    return await User.updateOne({ _id: user_Id }, { tradeUrl: tradeUrl });
}

userSchema.statics.getTradeUrl = async function (user_Id) {
    return new Promise(async (resolve, reject) => {
        User.findById(user_Id, 'tradeUrl').then(result => {
            return resolve(result)
        }).catch(err => {
            return reject(err)
        })
    })

}

userSchema.statics.clearAllNotifications = async function (user_Id) {
    return new Promise(async (resolve, reject) => {
        User.updateOne({ _id: user_Id }, { $set: { "notifications": [] } }).then(result => {
            return resolve(true);
        }).catch(err => {
            log.info(err);
            return reject(false);
        })
    })

}




const User = mongoose.model('user', userSchema, 'users');

module.exports = User;