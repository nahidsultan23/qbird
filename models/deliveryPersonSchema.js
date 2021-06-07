
const mongoose = require('mongoose');
const orderModel = require('./orderModel');
const ratingSchema = require('./RatingSchema');
const schema = mongoose.Schema;

const deliveryReordCountSchema = new schema({
    earning: {
        type: Number,
        default: 0
    },
    numberOfRequest: {
        type: Number,
        default: 0
    },
    numberOfCompletion: {
        type: Number,
        default: 0
    },
    numberOfRejection: {
        type: Number,
        default: 0
    },
    numberOfCancellation: {
        type: Number,
        default: 0
    },
})

const deliveryPersonSchema = new schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    accountStatus: {
        status: {
            type: String,
            default: "Pending"
        },
        message: {
            type: String,
            default: "Waiting for approval"
        }
    },
    avgRating: {
        type: Number,
        default: 0
    },
    ratings: {
        type: [ratingSchema]
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    dailyRecord: {
        type: deliveryReordCountSchema,
        default: {earning:0,numberOfRequest:0,numberOfCompletion:0,numberOfRejection:0,numberOfCancellation:0}
    },
    weeklyRecord: {
        type: deliveryReordCountSchema,
        default: {earning:0,numberOfRequest:0,numberOfCompletion:0,numberOfRejection:0,numberOfCancellation:0}
    },
    monthlyRecord: {
        type: deliveryReordCountSchema,
        default: {earning:0,numberOfRequest:0,numberOfCompletion:0,numberOfRejection:0,numberOfCancellation:0}
    },
    allMonthRecords: [deliveryReordCountSchema],
    completedDeliveries: [{
        type:schema.Types.ObjectId,
        ref: 'orders'
    }],
    rejectedDeliveries: [{
        type:schema.Types.ObjectId,
        ref: 'orders'
    }],
    cancelledDeliveries: [{
        type:schema.Types.ObjectId,
        ref: 'orders'
    }],
    cancelledByUserDeliveries: [{
        type:schema.Types.ObjectId,
        ref: 'orders'
    }],
    confirmationPendingDeliveries: [{
        type:schema.Types.ObjectId,
        ref: 'orders'
    }],
    deliveryMedium: {
        type: String,
        default: "Bicycle"
    },
});

module.exports = deliveryPersonSchema;