const geoCoordinateSchema = require('./geoCoordinateSchema');
const ratingSchema = require('./RatingSchema');
const mongoose = require('mongoose');
const shopModel = require('../models/shopModel');

const schema = mongoose.Schema;

const adSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    shopID: {
        type: schema.Types.ObjectId,
        ref: 'shops'
    },
    name: {
        type: String
    },
    category: {
        type: String
    },
    subcategory: {
        type: String
    },
    contactNo: {
        type: String
    },
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
    optionVersion: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    coordinate: {
        type: geoCoordinateSchema
    },
    coordinateRad: {
        type: [Number]
    },
    location: {
        type: String
    },
    address: {
        type: String
    },
    instruction: {
        type: String
    },
    condition: {
        type: String
    }, 
    for: {
        type: String
    }, 
    parcel : {
        type: Boolean
    },
    sameAsShopOpeningHours: {
        type: Boolean,
        default: false
    },
    availableHours: {
        type: {
            sunday: {
                from: String,
                to: String
            },
            monday: {
                from: String,
                to: String
            },
            tuesday: {
                from: String,
                to: String
            },
            wednesday: {
                from: String,
                to: String
            },
            thursday: {
                from: String,
                to: String
            },
            friday: {
                from: String,
                to: String
            },
            saturday: {
                from: String,
                to: String
            },
            everyday: {
                from: String,
                to: String
            }
        }
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
    area: {
        type: Number
    },
    areaUnit: {
        type: String
    },
    price: {
        type: Number
    },
    originalPrice: {
        type: Number
    },
    priceUnit: {
        type: String
    },
    pricePer: {
        type: String
    },
    parcelPrice: {
        type: Number
    },
    originalParcelPrice: {
        type: Number
    },
    parcelPriceUnit: {
        type: String
    },
    governmentChargeApplicable: {
        type: Boolean
    },
    governmentCharge: {
        type: Number
    },
    governmentChargeDescription: {
        type: String
    },
    governmentChargeRegNo: {
        type: String
    },
    extraChargeApplicable: {
        type: Boolean
    },
    extraCharge: {
        type: Number
    },
    extraChargeDescription: {
        type: String
    },
    photos:{
        type: [String]
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
    numberOfComments: {
        type: Number,
        default: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    shoppingCount: {
        type: Number,
        default: 0
    },
    searchString : {
        type: String
    },
    activatedOn: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    shopName: {
        type: String
    },
    brandName: {
        type: String
    },
    midBreakApplicable: {
        type: Boolean,
        default: false
    },
    midBreaks: {
        type: {
            saturday: {
                from: String,
                to: String
            },
            sunday: {
                from: String,
                to: String
            },
            monday: {
                from: String,
                to: String
            },
            tuesday: {
                from: String,
                to: String
            },
            wednesday: {
                from: String,
                to: String
            },
            thursday: {
                from: String,
                to: String
            },
            friday: {
                from: String,
                to: String
            },
            everyday: {
                from: String,
                to: String
            }
        }
    },
    specifications: [{
        specificationName: String,
        specification: String
    }],
    discounts: [{
        discountOn: String,
        discountType: String,
        discount: Number,
        discountUnit: String,
        minOrder: Number,
        minOrderUnit: String,
        maxOrder: Number,
        maxOrderUnit: String
    }],
    discountTag: String,
    showableDiscountTag: String,
    numOfItems: Number,
    numOfItemsPerOrder: Number,
    leadTime: String,
    expiryTime: String,
    processingCapacity: Number,
    productReturnApplicable: String,
    productReturnPolicy: String,
    version: {
        type: Number,
        default: 0
    },
    versionRecords: [],
    ratingCount: {
        one: {
            type: Number,
            default: 0
        },
        two: {
            type: Number,
            default: 0
        },
        three: {
            type: Number,
            default: 0
        },
        four: {
            type: Number,
            default: 0
        },
        five: {
            type: Number,
            default: 0
        }
    },
    preOrder: {
        type: Boolean,
        default: false
    }
});

adSchema.index({ coordinate: "2dsphere" });

const adModel = mongoose.model('ads',adSchema,'ads');

module.exports = adModel;