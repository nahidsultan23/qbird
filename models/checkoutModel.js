const mongoose = require('mongoose');

const schema = mongoose.Schema;
const adModel = require('./adModel');
const stoppageDataSchema = require('./stoppageDataSchema');

const CheckoutSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    itemsArrangedByStoppages: [stoppageDataSchema],
    userCoordinate: {
        lat: Number,
        long: Number
    },
    location: String,
    distance: {
        type: Number,
        default: 0
    },
    address: String,
    addressID: schema.Types.ObjectId,
    totalWeight: Number,
    subtotal: Number,
    totalGovernmentCharge: Number,
    totalExtraCharge: Number,
    total: Number,
    shippingCharge: {
        type: Number,
        default: 0
    },
    totalWaitingTime: {
        type: Number,
        default: 0
    },
    extraStoppageCharge: {
        type: Number,
        default: 0
    },
    extraDistanceCharge: {
        type: Number,
        default: 0
    },
    extraWeightCharge: {
        type: Number,
        default: 0
    },
    deliveryTime: {
        type: Number,
        default: 1800
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    from: {
        type: String
    },
    calculationsForUser: {
        discount: Number
    },
    calculationsForDeliveryPerson: {
        qbirdCharge: Number,
        shippingCharge: Number,
        waiver: {
            type: Number,
            default: 0
        }
    }
});

const CheckoutModel = mongoose.model('checkout',CheckoutSchema,'checkout');
module.exports = CheckoutModel;