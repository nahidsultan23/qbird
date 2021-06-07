
const smsCredentials = require('../constants/smsCredentials');

const usernameOTP = smsCredentials.username;
const passwordOTP = smsCredentials.password;
const otpUrl = smsCredentials.url;
const request = require('request');

const sendOtp = (res,resData,otp,phoneNumber,cb) => {
    let data = {
        username: usernameOTP,
        password: passwordOTP,
        number: phoneNumber,
        message: 'Your Qbird verification code is ' + otp + '. Do not share this verification code with anyone.'
    };

    request.post({url:otpUrl, formData: data}, function(err, httpResponse, body) {
        if(err) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        let responseCode = body.split('|');

        if(responseCode[0] === '1101') {
            cb();
        }
        else {
            resData.errorMessage.otp = "Verification code was not sent";
            return res.json(resData);
        }
    });
}

module.exports = sendOtp;