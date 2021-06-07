const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');


module.exports = function validateRegisterInput(data,errorMessage,tempAccessToken) {

    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.otp = checkEmpty(data.otp);

    if(!tempAccessToken || !validator.isValidCountryCode(data.countryCode) || !validator.isValidPhoneNumber(data.phoneNumber)) {
        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    const accessTokenManager = require('../helper/accessToken');
    var decoded = accessTokenManager.verifyAccessToken(tempAccessToken);
    if(!decoded || !validator.isValidObjectID(decoded.tempUserID) || !decoded.tempSessionID) {
        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.phoneNumber = data.phoneNumber.replace(/^0/,'');
    data.tempUserID = decoded.tempUserID;
    data.tempSessionID = decoded.tempSessionID;
    return true;
}