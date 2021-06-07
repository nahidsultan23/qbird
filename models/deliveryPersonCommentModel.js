const mongoose = require('mongoose');
const ReplySchema = require('./ReplySchema');
const schema = mongoose.Schema;

const deliveryPersonCommentSchema = new schema({

    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    deliveryPersonID: {
        type: schema.Types.ObjectId,
        ref: 'users'
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

const deliveryPersonCommentModel = mongoose.model('deliveryPersonComments',deliveryPersonCommentSchema,'deliveryPersonComments');
module.exports = deliveryPersonCommentModel;