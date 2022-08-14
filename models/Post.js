const mongoose = require('mongoose');
const User = require('./User');
const { Comment, commentSchema, CommentReply } = require('./Comment');
const SearchQuery = require('./SearchQuery');
const globalUtils = require('../utility/globalUtils')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoosePaginate = require('mongoose-paginate-v2');
const Site = require('../enum/site');
const Settings = require('../config/settings');
const { GlobalNotification, GlobalNotificationType } = require('./GlobalNotification');
const { log } = require('./Logger');


const postSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    userId: { type: Number, required: true },
    offering: { type: Array, required: true },
    requesting: { type: Array, required: true },
    notes: { type: String, trim: true, default: '' },
    comments: [commentSchema],
    views: { type: Number, required: true, default: 0 },
    bookmarks: { type: Number, required: true, default: 0 },
    bump: { type: Date, required: true, default: Date.now },
    active: { type: Boolean, required: true, default: true }
}, { timestamps: true });

postSchema.plugin(AutoIncrement, { inc_field: 'postId' });

postSchema.plugin(mongoosePaginate);

postSchema.methods.createPost = async function (userId, callback) {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        let post = await this.save({ session })

        let userUpdatedResult = await User.updateOne({ _id: userId }, { $inc: { 'trades': 1, 'activeSlots': 1 } }, { session });

        await session.commitTransaction();
        session.endSession();
        return callback(post.postId);

    } catch (e) {
        await session.abortTransaction();
        log.info("The post creation transaction was aborted due to an unexpected error: " + e);
        return callback(false);
    } finally {
        await session.endSession();
    }
}

postSchema.statics.getPost = function (postId, SteamUser) {

    return new Promise((resolve, reject) => {
        this.findOneAndUpdate({ postId: postId }, { $inc: { views: 1 } }, { new: true })
            .populate('owner', 'name profilePic profileUrl userId roleColor tradeUrl')
            .populate('comments.owner', 'name profilePic profileUrl userId roleColor')
            .populate({
                path: 'comments', populate: {
                    path: 'replies.owner',
                    model: 'user',
                    select: 'name profilePic profileUrl userId roleColor '
                }
            }).exec(async (err, post) => {
                if (err) {
                    log.info(err)
                    return reject(err)
                }

                let isBookmarked = false;

                if (SteamUser) {
                    let user = await User.findOne({ _id: SteamUser._id }).lean();
                    isBookmarked = (user.bookmarks.indexOf(postId) !== -1);

                }


                log.info('post data received for ' + postId);

                return resolve({ post: post, isBookmarked: isBookmarked });
            });

    })
}

postSchema.statics.closePost = async function (user_Id, post_Id, callback) {

    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        await this.updateOne({ _id: post_Id }, { active: false }, { session });
        await User.updateOne({ _id: user_Id, "activeSlots": { $gt: 0 } }, { $inc: { 'activeSlots': -1 } }, { session });

        await session.commitTransaction();
        session.endSession();
        return callback(true);
    } catch (e) {
        await session.abortTransaction();
        log.info("The post creation transaction was aborted due to an unexpected error: " + e);
        return callback(false);
    } finally {
        await session.endSession();
    }
}

postSchema.statics.updateBookmarkCount = async function (postId, increase = null) {
    if (increase) {
        return await this.updateOne({ postId: postId }, { $inc: { 'bookmarks': 1 } }).exec();
    } else if (!increase) {
        return await this.updateOne({ postId: postId, bookmarks: { $gt: 0 } }, { $inc: { 'bookmarks': -1 } }).exec();
    }
}

postSchema.statics.addComment = function (user_Id, postOwner_Id, post_Id, postId, commentText) {
    let comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        owner: user_Id,
        commentText: commentText,
        replies: []
    })
    return new Promise((resolve, reject) => {
        this.updateOne({ _id: post_Id }, { $push: { comments: comment } }).exec((err, docs) => {
            if (err) {
                log.info(err)
                return reject(false)
            }
            if (user_Id !== postOwner_Id) {

                User.addToOffers(user_Id, post_Id);
                let notification = new GlobalNotification({
                    parentId: postId,
                    type: GlobalNotificationType.offerComment,
                    redirectId: comment._id,
                    id: postId,
                });

                GlobalNotification.AddCounterNotification(postOwner_Id, notification);
            }
            return resolve(true);
        });
    })
}

postSchema.statics.addCommentReply = function (user_Id, postOwner_Id, post_Id, postId, commentId, commentText) {
    let commentReply = new CommentReply({
        _id: new mongoose.Types.ObjectId(),
        owner: user_Id,
        commentText: commentText
    })

    return new Promise((resolve, reject) => {
        this.findOneAndUpdate({ _id: post_Id, "comments._id": commentId }, { $push: { "comments.$.replies": commentReply } }).exec((err, docs) => {
            if (err) {
                log.info(err)
                return reject(false)
            }

            if (user_Id !== postOwner_Id) {
                User.addToOffers(user_Id, post_Id);
            }

            let commentReplies = docs.comments.find(comment => comment._id == commentId).replies;

            UsersToNotify = [];

            commentReplies.forEach(reply => {
                if (UsersToNotify.indexOf(reply.owner) == -1 && reply.owner != user_Id) {
                    UsersToNotify.push(reply.owner);
                }
            })


            let notification = new GlobalNotification({
                parentId: commentId,
                type: GlobalNotificationType.offerReply,
                redirectId: commentReply._id,
                id: postId,
            });



            if (UsersToNotify.length > 0) {

                GlobalNotification.AddCounterNotification(UsersToNotify, notification);
            } else if (user_Id !== postOwner_Id) {

                GlobalNotification.AddCounterNotification(postOwner_Id, notification);
            }

            return resolve(true)
        });
    })
}

postSchema.statics.hideComment = async function (user, post_Id, comment_Id, reply_Id) {
    let query = { _id: post_Id, "comments._id": comment_Id };
    let queryOptions = {
        '$set': {
            'comments.$.hiddenBy': user._id,
        }
    };

    let filterOptions = {}

    if (reply_Id) {
        let query = {
            _id: post_Id,
            "comments": {
                "$elemMatch": {
                    "_id": comment_Id, "replies._id": reply_Id
                }
            }
        };
        queryOptions = {
            '$set': {
                "comments.$[outer].replies.$[inner].hiddenBy": user._id,
            }
        };

        filterOptions = {
            "arrayFilters": [{ "outer._id": comment_Id }, { "inner._id": reply_Id }]
        };

    }

    return new Promise((resolve, reject) => {
        this.updateOne(query, queryOptions, filterOptions).exec((err, docs) => {
            if (err) {
                log.info(err)
                return reject(null)
            }
            return resolve(true)
        });
    })

}

postSchema.statics.getPosts = function (page) {

    const query = { active: true };
    const options = {
        sort: { bump: -1 },
        populate: {
            path: 'owner',
            model: 'user',
            select: 'name profilePic profileUrl userId roleColor'
        },
        lean: true,
        page: page,
        limit: Settings.postPerPageLimit,
    };

    return new Promise((resolve, reject) => {
        Post.paginate(query, options).then(result => {
            return resolve(globalUtils.getSeperatedPaginatedResult(result))
        }).catch(err => {
            return reject(err)
        })
    })
}

postSchema.statics.getUserTradePosts = function (userId, page) {

    const query = { userId: userId };
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

    return new Promise((resolve, reject) => {
        Post.paginate(query, options).then(result => {
            return resolve(globalUtils.getSeperatedPaginatedResult(result))
        }).catch(err => {
            return reject(err)
        })
    })
}

postSchema.statics.getSearchedPosts = function (userId, page) {


    return new Promise((resolve, reject) => {

        const searchQuery = SearchQuery.getSearchQuery(userId);

        // searchQuery['offering.market_hash_name'] = new RegExp(searchQuery['offering.market_hash_name'], "i");
        // searchQuery['requesting.market_hash_name'] = new RegExp(searchQuery['requesting.market_hash_name'], "i");

        const options = {
            sort: { bump: -1 },
            populate: {
                path: 'owner',
                model: 'user',
                select: 'name profilePic profileUrl userId roleColor'
            },
            lean: true,
            page: page,
            limit: Settings.postPerPageLimit,
        };


        searchQuery['active'] = true;


        if (searchQuery) {
            Post.paginate(searchQuery, options).then(result => {
                return resolve(globalUtils.getSeperatedPaginatedResult(result))
            }).catch(err => {
                return reject(err)
            });

        } else {
            return reject();
        }
    })

}

postSchema.statics.HideUnhideItem = async function ({ postId, itemId, slotType, hidden }) {

    if (slotType == 0) { //offering side
        return await this.updateOne({ _id: postId, "offering.id": itemId }, {
            '$set': {
                'offering.$.hidden': hidden,
            }
        });
    } else {
        return await this.updateOne({ _id: postId, "requesting.id": itemId }, {
            '$set': {
                'requesting.$.hidden': hidden,
            }
        });
    }
}

postSchema.statics.UpdatePostNotes = async function (postId, notes) {
    return await this.updateOne({ _id: postId }, { 'notes': notes });
}

postSchema.statics.BumpPost = async function (postId) {
    return await this.findByIdAndUpdate({ _id: postId }, { 'bump': Date.now() }, { "fields": { "bump": 1 }, new: true }).lean();
}


const Post = mongoose.model('post', postSchema, 'posts');

module.exports = Post;

