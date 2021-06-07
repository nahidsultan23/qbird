const mongoose = require('mongoose');
const schema = mongoose.Schema;

const stoppageDataSchema = new schema({
    stoppageID: schema.Types.ObjectId,
    initialization: String,
    stoppageStatus: {
        type: String,
        default: "Pending"
    },
    coordinate: {
        lat: Number,
        long: Number
    },
    type: String,
    name: String,
    ownerID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    address: String,
    version: Number,
    distance: Number,
    userDistance: Number,
    photo: String,
    numberOfItems: Number,
    items: [{
        cartItemID: schema.Types.ObjectId,
        adID: schema.Types.ObjectId,
        name: String,
        adVersion: Number,
        photo: String,
        available: {
            type: Boolean,
            default: true
        },
        options: [{
            optionName: String,
            option: String,
            extraPrice: Number,
            extraWeight: Number
        }],
        quantity: Number,
        numberOfUnavailableQuantity: {
            type: Number,
            default: 0
        },
        optionPrice: Number,
        optionWeight: Number,
        basePrice: Number,
        unitPrice: Number,
        totalPrice: Number,
        governmentCharge: Number,
        extraCharge: Number,
        netPrice: Number,
        netWeight: Number,
        checkoutErrorMessage: String,
        errorCode: {
            type: Number,
            default: 0
        }
    }],
    subtotal: Number,
    governmentCharge: Number,
    extraCharge: Number,
    total: Number,
    totalWeight: Number,
    stoppageWaitingTime: Number,
    stoppageShippingCharge: {
        type: Number,
        default: 0
    },
    itemDiscount: {
        type: Number,
        default: 0
    },
    shippingDiscount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    stoppageTotal: {
        type: Number,
        default: 0
    }
});

module.exports = stoppageDataSchema;