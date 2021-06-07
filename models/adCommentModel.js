const mongoose = require('mongoose');
const ReplySchema = require('./ReplySchema');
const schema = mongoose.Schema;

const adCommentSchema = new schema({

    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    isOwner: Boolean,
    adID: {
        type: schema.Types.ObjectId,
        ref: 'ads'
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

const adCommentModel = mongoose.model('adComments',adCommentSchema,'adComments');
module.exports = adCommentModel;