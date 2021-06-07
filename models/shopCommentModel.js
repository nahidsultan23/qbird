const mongoose = require('mongoose');
const ReplySchema = require('./ReplySchema');
const schema = mongoose.Schema;

const shopCommentSchema = new schema({

    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    isOwner: Boolean,
    shopID: {
        type: schema.Types.ObjectId,
        ref: 'shops'
    },
    rating: {
        type: Number,
        default: 0
    },
    comment: {
        type: String
    },
    orderID: {
        type: schema.Types.ObjectId,
        ref: 'orders'
    },
    time: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },    
    replies: {
        type: [ReplySchema]
    },
});

const shopCommentModel = mongoose.model('shopComments',shopCommentSchema,'shopComments');
module.exports = shopCommentModel;