const mongoose = require('mongoose');

const schema = mongoose.Schema;
const adModel = require('./adModel');

const WishListSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    adID: {
        type: schema.Types.ObjectId,
        ref: 'ads'
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const WishListModel = mongoose.model('wishList',WishListSchema,'wishList');
module.exports = WishListModel;