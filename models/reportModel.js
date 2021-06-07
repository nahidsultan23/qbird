const mongoose = require('mongoose');
const userModel = require('./userModel');
const schema = mongoose.Schema;

const reportSchema = new schema({
    type: String,
    itemID: schema.Types.ObjectId,
    reports: [{
        userID: {
            type: schema.Types.ObjectId,
            ref: 'users'
        },
        reports: [{
            subject: String,
            comment: String,
            time: {
                type: Date,
                default: Date.now
            },
        }]
    }]
});

const reportModel = mongoose.model('reports',reportSchema,'reports');
module.exports = reportModel;