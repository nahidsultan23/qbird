const mongoose = require('mongoose');

const schema = mongoose.Schema;
const adModel = require('./adModel');

const CartSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    adID: {
        type: schema.Types.ObjectId,
        ref: 'ads'
    },
    adVersion: Number,
    shopID: {
            type: schema.Types.ObjectId,
            ref: 'shops'
    },
    shopVersion: Number,
    options: [{
        _id: false,
        optionName: String,
        option: String,
        extraPrice: Number,
        extraPriceUnit: String,
        extraWeight: Number,
        extraWeightUnit: String,
        available: {
            type: Boolean,
            default: true
        }
    }],
    quantity: Number,
    optionPrice: Number,
    optionWeight: Number,
    basePrice: Number,
    unitPrice: Number,
    totalPrice: Number,
    governmentCharge: Number,
    extraCharge: Number,
    netPrice: Number,
    weight: Number,
    time: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
});

const CartModel = mongoose.model('cart',CartSchema,'cart');
module.exports = CartModel;