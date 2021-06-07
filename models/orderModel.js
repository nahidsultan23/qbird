const mongoose = require('mongoose');

const schema = mongoose.Schema;
const userModel = require('./userModel');
const stoppageDataSchema = require('./stoppageDataSchema');

const orderSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    userPhoto: String,
    itemsArrangedByStoppages: [stoppageDataSchema],
    unavailableStoppages: [stoppageDataSchema],
    totalWeight: Number,
    grossTotal: Number,
    subtotal: Number,
    totalGovernmentCharge: Number,
    totalExtraCharge: Number,
    total: Number,
    distance: Number,
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
    isDeleted: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Boolean,
        default: false
    },
    comment: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    currentState: {
        type: Number,
        default: 0
    },
    reason: String,
    stateRecord: [{
        state: String,
        time: Date
    }],
    deliveryPersonID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    deliveryTime: {
        type: Number,
        default: 1800
    },
    deliveryPersonName: String,
    deliveryPersonPhoto: String,
    deliveryPersonPhoneNumber: String,
    numberOfCompletedDeliveries: {
        type: Number,
        default: 0
    },
    numberOfCompletedOrders: {
        type: Number,
        default: 0
    },
    rejectedBy: [{
        type: schema.Types.ObjectId,
        ref: 'users'
    }],
    rejectedTime: [Date],
    rateableByUser: {
        type: Boolean,
        default: false
    },
    rateableByDeliveryPerson: {
        type: Boolean,
        default: false
    },
    calculationsForUser: {
        discount: Number
    },
    calculationsForDeliveryPerson: {
        qbirdCharge: Number,
        shippingCharge: Number,
        waiver:  {
            type: Number,
            default: 0
        }
    },
    shippingLocation: {
        stoppageStatus:  {
            type: String,
            default: "Pending"
        },
        coordinate: {
            lat: Number,
            long: Number
        },
        address: String,
        distance: Number,
        location: String,
        userName: String,
        photo: String,
        contactNo: String,
        rating: Number,
        numOfRatings: Number
    }
});

const orderModel = mongoose.model('orders',orderSchema,'orders');

module.exports = orderModel;