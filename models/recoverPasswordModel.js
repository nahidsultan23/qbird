const mongoose = require('mongoose');

const schema = mongoose.Schema;

const recoverPasswordSchema = new schema({

    countryCode: {
        type: String
    },
    phoneNumber: {
        type: String,
        unique : true
    },
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    tempSessionID: {
        type: String
    },
    otp: {
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
    otpVerified: {
        type: Boolean,
        default: false
    },
    lastOTPSendTime: {
        type: Date,
        default: Date.now
    }
});

const recoverPasswordModel = mongoose.model('recoverPassword',recoverPasswordSchema,'recoverPassword');

module.exports = recoverPasswordModel;