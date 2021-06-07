const validator = require('../helper/validationHelper');
const checkEmpty = require('../helper/checkEmpty');

module.exports = function validateAddressInfo(data,addresses,errorMessage) {
    data.coordinate = checkEmpty(data.coordinate);
    data.address = checkEmpty(data.address);
    const names = ["Home", "Office", "Address 1", "Address 2", "Address 3", "Address 4", "Address 5", "Address 6",
        "Address 7", "Address 8", "Address 9", "Address 10", "Address 11", "Address 12", "Address 13", "Address 14",
        "Address 15", "Address 16", "Address 17", "Address 18"];

    let error = false;

    if(!data.coordinate || !validator.isValidLattitude(data.coordinate.lat) || !validator.isValidLongitude(data.coordinate.long)) {
        error = true;
        errorMessage.location = 'A valid Shipping Location is needed';
    }

    if(!data.address) {
        error = true;
        errorMessage.address = 'Address is required';
    }
    else if(data.address.length < 5) {
        error = true;
        errorMessage.address = 'Address must be at least 5 characters';
    }
    else if(data.address.length > 500) {
        error = true;
        errorMessage.address = 'Address can have maximum 500 characters';
    }

    if(!data.save)
        return !error;

    if(addresses.length >= 20) {
        errorMessage.fatalError = "Maximum 20 addresses can be saved";
        return true;
    }
    
    data.addressName = checkEmpty(data.addressName);
    if(!data.addressName) {
        for(var i=0; i < names.length; i++) {
            if(!addresses.find(a => a.addressName === names[i])) {
                data.addressName = names[i];
                break;
            }
        }
    }
    else if(data.addressName.length > 100) {
        errorMessage.addressName = 'Address name can have maximum 100 characters';
        error = true;
    }
    else if(addresses.find(a => a.addressName === data.addressName)) {
        errorMessage.addressName =  `${data.addressName} has already been used. Try something different.`;
        error = true;
    }

    return !error;
}