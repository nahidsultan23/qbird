const geoCoordinateSchema = require('./geoCoordinateSchema');
const ratingSchema = require('./RatingSchema');
const userModel = require('../models/userModel');
const mongoose = require('mongoose');

const schema = mongoose.Schema;

const shopSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
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
    description: {
        type: String,
    },
    contactNo: {
        type: String
    },
    coordinate: {
        type: geoCoordinateSchema
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
    openingHours: {
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
    forceOpen: {
        type: Boolean,
        default: false
    },
    governmentCharge: {
        type: Number,
        default: 0
    },
    governmentChargeDescription: {
        type: String
    },
    governmentChargeRegNo: {
        type: String
    },
    extraCharge: {
        type: Number,
        default: 0
    },
    extraChargeDescription: {
        type: String
    },
    photos:{//Maximum 15 directories.
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
    numberOfAds: {
        type: Number,
        default: 0
    },
    numberOfComments: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    activatedOn: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    shoppingCount: {
        type: Number,
        default: 0
    },
    searchString : {
        type: String
    },
    urlName: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    discounts: [{
        discountOn: String,
        discountType: String,
        discount: Number,
        discountUnit: String,
        minOrder: Number,
        minOrderUnit: String,
        maxOrder: Number,
        maxOrderUnit: String,
        maxAmount: Number,
        maxAmountUnit: String
    }],
    discountTag: String,
    showableDiscountTag: String,
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
    balance: {
        type: Number,
        default: 0
    },
    dealWithShop: [{
        minOrder: Number,
        maxOrder: Number,
        dealType: String,
        dealQuantity: Number
    }],
    dailySale: [[Number]],
    yearlySale: [{
        year: Number,
        sale: Number,
        monthlySale: [Number]
    }],
    preOrderPermission: {
        type: Boolean,
        default: false
    },
    preOrder: {
        type: Boolean,
        default: false
    }
});
shopSchema.index({ coordinate: "2dsphere" });
shopSchema.index({ urlName: 1 });

const shopModel = mongoose.model('shops',shopSchema,'shops');

module.exports = shopModel;