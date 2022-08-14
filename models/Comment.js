const mongoose = require('mongoose');

const commentReplySchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    commentText: { type: String, trim: true, required: true },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
})

const commentSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    commentText: { type: String, trim: true, required: true },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    replies: [commentReplySchema],
}, { timestamps: true })


module.exports = {
    commentSchema: commentSchema,
    Comment: mongoose.model('comment', commentSchema),
    commentReplySchema: commentReplySchema,
    CommentReply: mongoose.model('commentReply', commentReplySchema)
};