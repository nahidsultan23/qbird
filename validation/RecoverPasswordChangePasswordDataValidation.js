const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');
const encryption = require('../helper/Encryption');

module.exports = function validateTempRegisterInput(data,errorMessage,tempAccessToken) {
    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.newPassword = checkEmpty(data.newPassword);
    data.reEnterNewPassword = checkEmpty(data.reEnterNewPassword);
    data.newPasswordSign = checkEmpty(data.newPasswordSign);
    data.reEnterNewPasswordSign = checkEmpty(data.reEnterNewPasswordSign);

    if(!tempAccessToken || !validator.isValidCountryCode(data.countryCode) || !validator.isValidPhoneNumber(data.phoneNumber) || data.newPassword === undefined || data.newPasswordSign === undefined || data.reEnterNewPassword === undefined || data.reEnterNewPasswordSign === undefined) {
        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    const accessTokenManager = require('../helper/accessToken');
    var decoded = accessTokenManager.verifyAccessToken(tempAccessToken);
    if(!decoded || !validator.isValidObjectID(decoded.userID) || !decoded.tempSessionID) {
        errorMessage.fatalError = 'Invalid request!';
        return false;
    }

    data.phoneNumber = data.phoneNumber.replace(/^0/,'');
    data.userID = decoded.userID;
    data.tempSessionID = decoded.tempSessionID;

    return true;
}