const mongoose = require('mongoose');

const schema = mongoose.Schema;

const categorySchema = new schema({
    categoryName: {
        type: String
    },
    subcategories: {
        type: [String]
    }
},{ _id : false });

const storedInDatabaseSchema = new schema({
    categories: [categorySchema],
    customCategories: [categorySchema],
    shopCategories: [categorySchema],
    weightUnits: {
        type: [String]
    },
    weightFactorForKg: {
        type: [Number]
    },
    volumeUnits: {
        type: [String]
    },
    dimensionUnits: {
        type: [String]
    },
    areaUnits: {
        type: [String]
    },
    priceUnits: {
        type: [String]
    },
    pricePer: {
        type: [String]
    }
});

const storedInDatabaseModel = mongoose.model('storedInDatabase',storedInDatabaseSchema,'storedInDatabase');

module.exports = storedInDatabaseModel;