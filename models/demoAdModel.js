const mongoose = require('mongoose');
const userModel = require('./userModel');

const schema = mongoose.Schema;

const demoAdSchema = new schema({
    name: {
        type: String
    },
    category: {
        type: String
    },
    subcategory: {
        type: String
    },
    description: {
        type: String,
    },
    weight : {
        type: Number
    },
    weightUnit : {
        type: String
    },
    parcelWeight : {
        type: Number
    },
    parcelWeightUnit : {
        type: String
    },
    parcelWeightInKg : {
        type: Number
    },
    volume: {
        type: Number
    },
    volumeUnit: {
        type: String
    },
    dimension: {
        type: [Number]
    },
    dimensionUnit: {
        type: String
    },
    parcelDimension: {
        type: [Number]
    },
    parcelDimensionUnit: {
        type: String
    },
    price : {
        type: Number
    },
    priceUnit : {
        type: String
    },
    parcelPrice : {
        type: Number
    },
    parcelPriceUnit : {
        type: String
    },
    photos:{
        type: [String]
    },
    searchString : {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    brandName: {
        type: String
    },
    specifications: [{
        specificationName: String,
        specification: String
    }],
    options: {
        type: [{
            optionName: String,
            optionType: String,
            options: {
                type: [{
                    option: String,
                    extraPrice: Number,
                    extraPriceUnit: String,
                    extraWeight: Number,
                    extraWeightUnit: String,
                    extraWeightInKg: Number
                }]
            }
        }]
    },
    expiryTime: String,
    version: {
        type: Number,
        default: 0
    },
    versionRecords: [],
    createdBy: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    editedBy: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    deletedBy: {
        type: schema.Types.ObjectId,
        ref: 'users'
    }
});

const demoAdModel = mongoose.model('demoAds',demoAdSchema,'demoAds');

module.exports = demoAdModel;