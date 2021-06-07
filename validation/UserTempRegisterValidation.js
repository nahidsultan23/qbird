const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');
const encryption = require('../helper/Encryption');

module.exports = function validateTempRegisterInput(data,errorMessage) {

    if(data.countryCode === undefined || data.phoneNumber === undefined || data.password === undefined || data.name === undefined) {
        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.password = checkEmpty(data.password);
    data.reEnterPassword = checkEmpty(data.reEnterPassword);
    data.passwordSign = checkEmpty(data.passwordSign);
    data.reEnterPasswordSign = checkEmpty(data.reEnterPasswordSign);

    let error = false;

    if(!encryption.verifySignature(data.password, data.passwordSign)) {
        errorMessage.password = 'Enter a valid Password';
        error = true;
    }
    else {
        data.password = encryption.decrypt(data.password);
    }

    if(!encryption.verifySignature(data.reEnterPassword, data.reEnterPasswordSign)) {
        errorMessage.reEnterPassword = 'Passwords must match';
        error = true;
    }
    else {
        data.reEnterPassword = encryption.decrypt(data.reEnterPassword);
    }
    
    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);
    data.name = checkEmpty(data.name);
    
    //input fields checking
    if(!validator.isValidCountryCode(data.countryCode)) {
        error = true;
        errorMessage.countryCode = 'Enter a valid Country Code';
    }
    if(!validator.isValidPhoneNumber(data.phoneNumber)) {
        error = true;
        errorMessage.phoneNumber = 'Enter a valid Phone Number';
    }
    else {
        data.phoneNumber = data.phoneNumber.replace(/^0/,'');
    }

    let msg = validator.isValidPassword(data.password);
    if(msg !== "true") {
        error = true;
        errorMessage.password = msg;
    }

    if(!data.reEnterPassword || (data.reEnterPassword.length > 200) || (data.password !== data.reEnterPassword)) {
        error = true;
        errorMessage.reEnterPassword = 'Passwords must match';
    }

    if(validator.checkNameError(data.name,errorMessage))
        error = true;

    return !error;
}