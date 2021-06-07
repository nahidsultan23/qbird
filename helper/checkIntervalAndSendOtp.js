const sendOtp = require('./sendOtp');

const checkIntervalAndSendOtp = (res,resData,tempDataModel,cb) => {
    let timeIntervalLastOtp = Math.abs(new Date() - tempDataModel.lastOTPSendTime);

    if(tempDataModel.otpTrials >= 5) {
        if(timeIntervalLastOtp >= 600000) {
            let otp =  Math.floor(100000 + Math.random() * 900000);
            sendOtp(res,resData,otp,tempDataModel.phoneNumber,() => {
                tempDataModel.otp = otp;
                tempDataModel.otpTrials = 0;
                tempDataModel.lastOTPSendTime = new Date();

                cb();
            })
        }
        else {
            let interval = 600000 - timeIntervalLastOtp;
            if(interval >= 60000) {
                var minuteInterval = Math.floor(interval / 60000);
                resData.errorMessage.fatalError = 'You entered wrong verification codes too many times. Please wait for ' + minuteInterval + ' more minute(s) and try again';
            }
            else {
                var secondInterval = Math.floor(interval / 1000) + 1;
                resData.errorMessage.fatalError = 'You entered wrong verification codes too many times. Please wait for ' + secondInterval + ' more second(s) and try again';
            }
            
            return res.json(resData);
        }
    }
    else {
        if(timeIntervalLastOtp >= 30000) {
            sendOtp(res,resData,tempDataModel.otp,tempDataModel.phoneNumber,() => {
                tempDataModel.lastOTPSendTime = new Date();

                cb();
            });
        }
        else {
            let interval = Math.floor((30000 - timeIntervalLastOtp) / 1000);
            resData.errorMessage.fatalError = 'A verification code was sent to your phone number a few seconds ago. Please wait for that one to arrive or, try again after ' + interval + ' second(s)';
            return res.json(resData);
        }
    }
}

module.exports = checkIntervalAndSendOtp;