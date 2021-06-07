const mongoose = require('mongoose');
const geoCoordinateSchema = require('./geoCoordinateSchema');

const schema = mongoose.Schema;

const activeDeliveryPersonSchema = new schema({
    deliveryPersonID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    curLocation: {
        type: geoCoordinateSchema
    },
    lastUpdatedOn: {
        type: Date,
        default: Date.now
    },
    numberOfRequestsToday: {
        type: Number,
        default: 0
    },
    ongoingDeliveryID: {
        type: schema.Types.ObjectId,
        default: null
    },
    deliveryRequestOrderID: {
        type: schema.Types.ObjectId,
        default: null
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    allowRequest: {
        type: Boolean,
        default: false
    },
    deliveryMedium: String
});

activeDeliveryPersonSchema.index({ curLocation: "2dsphere" });
const activeDeliveryPersonModel = mongoose.model('activeDeliveryPersons',activeDeliveryPersonSchema,'activeDeliveryPersons');

module.exports = activeDeliveryPersonModel;