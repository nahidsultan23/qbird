const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');
const encryption = require('../helper/Encryption');

module.exports = function validateRecoverPasswordInput(data,errorMessage) {
       
    data.countryCode = checkEmpty(data.countryCode);
    data.phoneNumber = checkEmpty(data.phoneNumber);

    let error = false;

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