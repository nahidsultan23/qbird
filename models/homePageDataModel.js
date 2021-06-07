const mongoose = require('mongoose');
const adModel = require('./adModel');
const shopModel = require('./shopModel');
const schema = mongoose.Schema;

const homePageDataSchema = new schema({
    topSlider: [{
        shopID: {
            type: schema.Types.ObjectId,
            ref: 'shops'
        },
        smallLine: String,
        biggerLine: String,
        photo: String
    }],
    secondSlider: [{
        categoryName: String,
        numberOfItems: {
            type:Number,
            default: 0
        },
        photo: String
    }],
    latest: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    special: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    featured: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    spanA: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    spanB: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    spanC: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    trending: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }],
    bestseller: [{
        adID:  {
            type: schema.Types.ObjectId,
            ref: 'ads'
        },
        photo: String
    }]
    
});

const homePageDataModel = mongoose.model('homePageData',homePageDataSchema,'homePageData');

module.exports = homePageDataModel;