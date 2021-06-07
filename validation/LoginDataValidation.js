const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');
const encryption = require('../helper/Encryption');

module.exports = function validateLoginInput(data,errorMessage) {

    data.password = checkEmpty(data.password);
    data.passwordSign = checkEmpty(data.passwordSign);

    let error = false;

    if(!encryption.verifySignature(data.password, data.passwordSign)) {
        errorMessage.password = 'Enter a valid Password';
        error = true;
    }
    else {
        data.password = encryption.decrypt(data.password);
    }

    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);

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

    return !error;
}