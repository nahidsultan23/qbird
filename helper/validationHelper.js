
const isValidObjectID = id => {
    if(!id || !/^[0-9a-fA-F]{24}$/.test(id))
        return false;

    return true;
}

const isPositiveNumber = number => {
    if(!number || number === "0" || !/^\+?\d+(\.\d+)?$/.test(number))
        return false;

    return true;
}

const isNonNegativeNumber = number => {
    if(isNumber(number) && number >= 0)
        return true;
    return false;
}

const isNumber = number => {
    if(number !== 0 && (!number || !/^[+-]?\d+(\.\d+)?$/.test(number)))
        return false;

    return true;
}

const isBoolean = val => {
    if(!val || !/^true|false$/.test(val))
        return false;

    return true;
}

const isValidLattitude = lat => {
    if(!isNumber(lat) || lat > 90 || lat < -90)
        return false;
    
    return true;
}

const isValidLongitude = long => {
    if(!isNumber(long) || long > 180 || long < -180)
        return false;
    
    return true;
}

const isValidDimension = dim => {
    if(typeof dim !== 'object' || dim.length < 3 || !isPositiveNumber(dim[0]) || !isPositiveNumber(dim[1]) || !isPositiveNumber(dim[2]))
        return false;
    
    return true;
}

const isValidString = (str,min,max) => {
    if(typeof str !== 'string')
        return false;
    if(min && str.length < min)
        return false;
    if(max && str.length > max)
        return false;

    return true;
}

const formatTimeSpan = (time) => {
    var a = time.split(':');
    for(var i=0; i < a.length; i++) {
        if(a[i].length === 1)
            a[i] = '0' + a[i];
    }

    return a.join(':');
}

const isValidPeriod = (period) => {
    if(!period || (typeof period.from) !== 'string' || (typeof period.to) !== 'string')
        return false;

    period.from = formatTimeSpan(period.from);
    period.to = formatTimeSpan(period.to);
    if(period.to <= period.from)
        return false;
    return true;
}

const isValidAvailablePeriod = (availablePeriod) => {
    if(!(availablePeriod instanceof Object))
        return false;

    var keys = Object.keys(availablePeriod);
    var everydayItem = keys.find(k => k === "everyday");

    if(everydayItem) {
        if(!isValidPeriod(availablePeriod["everyday"])) {
            return false;
        } else {
            for(var key of keys) {
                if(key !== "everyday")
                    delete availablePeriod[key];
            }
        }
    } else {
        for(var key of keys) {
            if(!isValidPeriod(availablePeriod[key]))
                return false;
        }
    }

    return true;
}

const isValidCountryCode = countryCode => {
    if(!countryCode || countryCode !== 'Bangladesh (+880)')
        return false;

    return true;
}

const isValidPhoneNumber = phoneNumber => {
    const pattern = /^0?[^0]\d{9}$/;
    if(!phoneNumber || !pattern.test(phoneNumber))
        return false;

    return true;
}

const isValidPassword = password => {
    if(!password)
        return 'Please enter a valid Password';
    if(password.length < 6)
         return 'Password must be at least 6 characters';
    if(password.length > 200)
        return  'Password must be between 6 to 200 characters';

    return 'true';
}

const isValidEmail = email => {
    if(!email)
        return false;
    
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email))
        return false;

    return true;
}

const checkExtraChargeError = (data,errorMessage) => {
    let error = false;
    if(!isPositiveNumber(data.extraCharge)) {
        error = true;
        errorMessage.extraCharge = 'Extra Charge must be a positive number';
    }
    else if(data.extraCharge > 1000000) {
        error = true;
        errorMessage.extraCharge = 'Extra Charege cannot be greater than 1000000';
    }
    if(!data.extraChargeDescription) {
        error = true;
        errorMessage.extraChargeDescription = 'Extra Charge Description is required';
    }
    else if(data.extraChargeDescription.length > 100) {
        error = true;
        errorMessage.extraChargeDescription = 'Extra Charge Description cannot have more than 100 characters';
    }
    return error;
}

const checkGovernmentChargeError = (data,errorMessage) => {
    let error = false;
    if(!isPositiveNumber(data.governmentCharge)) {
        error = true;
        errorMessage.governmentCharge = 'Government Charge must be a positive number';
    }
    else if(data.governmentCharge > 1000000) {
        error = true;
        errorMessage.governmentCharge = 'Government Charege cannot be greater than 1000000';
    }
    if(!data.governmentChargeDescription) {
        error = true;
        errorMessage.governmentChargeDescription = 'Government Charge Description is required';
    }
    else if(data.governmentChargeDescription.length > 100) {
        error = true;
        errorMessage.governmentChargeDescription = 'Government Charge Description cannot have more than 100 characters';
    }
    if(!data.governmentChargeRegNo) {
        error = true;
        errorMessage.governmentChargeRegNo = 'Government Charge Registration Number is required';
    }
    else if(data.governmentChargeRegNo.length > 100) {
        error = true;
        errorMessage.governmentChargeRegNo = 'Government Charge Registration Number cannot be bigger than 100 characters';
    }
    return error;
}

const checkNameError = (name,errorMessage) => {
    let error = false;
    if(!name) {
        error = true;
        errorMessage.name = 'Name is required';
    }
    else if(name.length < 2) {
        error = true;
        errorMessage.name = 'Name must be at least 2 characters';
    }
    else if(name.length > 200) {
        error = true;
        errorMessage.name = 'Name must be within 2 to 200 characters';
    }
    return error;
}

module.exports = {
    isPositiveNumber: isPositiveNumber,
    isNonNegativeNumber: isNonNegativeNumber,
    isNumber: isNumber,
    isBoolean: isBoolean,
    checkNameError: checkNameError,
    isValidLattitude: isValidLattitude,
    isValidLongitude: isValidLongitude,
    isValidDimension: isValidDimension,
    isValidString: isValidString,
    isValidObjectID: isValidObjectID,
    isValidAvailablePeriod: isValidAvailablePeriod,
    isValidCountryCode: isValidCountryCode,
    isValidPhoneNumber: isValidPhoneNumber,
    isValidPassword: isValidPassword,
    isValidEmail: isValidEmail,
    checkExtraChargeError: checkExtraChargeError,
    checkGovernmentChargeError: checkGovernmentChargeError
};