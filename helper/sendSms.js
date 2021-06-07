
const smsCredentials = require('../constants/smsCredentials');

const usernameText = smsCredentials.username;
const passwordText = smsCredentials.password;
const textUrl = smsCredentials.url;
const request = require('request');

const sendText = (res,resData,message,phoneNumber,cb) => {
    let data = {
        username: usernameText,
        password: passwordText,
        number: phoneNumber,
        message: message
    };

    request.post({url:textUrl, formData: data}, function(err, httpResponse, body) {
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
            resData.errorMessage.fatalError = "SMS was not sent";
            return res.json(resData);
        }
    });
}

module.exports = sendText;