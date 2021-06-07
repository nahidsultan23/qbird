const mongoose = require('mongoose');

const schema = mongoose.Schema;

const RatingSchema = new schema({

    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    rating: {
        type: Number
    },    
    orderID: {
        type: schema.Types.ObjectId,
        ref: 'orders'
    },
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = RatingSchema;