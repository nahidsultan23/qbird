const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userTempSchema = new schema({
    countryCodeFull: {
        type: String
    },
    countryCode: {
        type: String
    },
    phoneNumber: {
        type: String,
        unique : true
    },
    password: {
        type: String
    },
    client: {
        type: String,
        default: "web-app"
    },
    otp: {
        type: String
    },
    tempSessionID: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    otpTrials: {
        type: Number,
        default: 0
    },
    lastOTPSendTime: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String
    }
});

const userTempModel = mongoose.model('userstemp',userTempSchema,'userstemp');

module.exports = userTempModel;