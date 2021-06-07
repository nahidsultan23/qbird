const checkEmpty = require('../helper/checkEmpty');
const validator = require('../helper/validationHelper');
const shopValidator = require('../helper/shopValidationHelper');
const constants = require('../helper/myConstants');

module.exports = function validateShopUpdateInput(data,errorMessage,optionData) {

    if(data.description === undefined || data.contactNo === undefined || data.instruction === undefined || data.midBreakApplicable === undefined
        || data.openingHours === undefined || data.midBreaks === undefined || data.governmentCharge === undefined || data.extraCharge === undefined 
        || data.governmentChargeDescription === undefined || data.extraChargeDescription === undefined || data.photos === undefined
        || data.oldPhotos === undefined) {

        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.description = checkEmpty(data.description);
    data.contactNo = checkEmpty(data.contactNo);
    data.instruction = checkEmpty(data.instruction);
    data.midBreakApplicable = checkEmpty(data.midBreakApplicable);
    data.openingHours = checkEmpty(data.openingHours);
    data.midBreaks = checkEmpty(data.midBreaks);
    data.extraCharge = checkEmpty(data.extraCharge);
    data.extraChargeDescription = checkEmpty(data.extraChargeDescription);
    data.governmentCharge = checkEmpty(data.governmentCharge);
    data.governmentChargeDescription = checkEmpty(data.governmentChargeDescription);
    data.governmentChargeRegNo = checkEmpty(data.governmentChargeRegNo);

    let error = false;

    if(!validator.isValidString(data.description,5,5000)) {
        error = true;
        errorMessage.description = 'Description must be between 5 to 5000 characters';
    }

    if(shopValidator.checkCategoryError(data,errorMessage,optionData,true))
        error = true;

    if(!data.contactNo || data.contactNo.length < 10) {
        error = true;
        errorMessage.contactNo = "At least one Contact Number is required";
    }
    else if(data.contactNo.length > 200) {
        error = true;
        errorMessage.contactNo = "Contact Number cannot be more than 200 character";
    }
    else {
        data.contactNo = data.contactNo.replace(/( *, *)|( +)/g,", ");
    }

    if(data.instruction && data.instruction.length > 2000) {
        error = true;
        errorMessage.instruction = 'Instructions cannot be more than 2000 characters';
    }

    if(!validator.isValidAvailablePeriod(data.openingHours)) {
        error = true;
        errorMessage.openingHours = 'Valid Opening Hours are required';
    }

    if(data.midBreakApplicable) {
        if(!validator.isValidAvailablePeriod(data.midBreaks)) {
            error = true;
            errorMessage.midBreaks = 'Valid Mid Breaks are required';
        }
        else {
            const checkAvailablePeriodConflict = require('../helper/checkAvailablePeriodConflict');
            if(checkAvailablePeriodConflict(data.openingHours, data.midBreaks)) {
                error = true;
                errorMessage.midBreaks = "Conflicts with the Opening Hours!!";
            }
        }
    }

    if(data.extraCharge  && data.extraCharge !== "0") {
        if(validator.checkExtraChargeError(data,errorMessage))
            error = true;
    } else {
        data.extraCharge = 0;
        data.extraChargeDescription = "";
    }

    if(data.governmentCharge && data.governmentCharge !== "0") {
        if(validator.checkGovernmentChargeError(data,errorMessage))
            error = true;
    } else {
        data.governmentCharge = 0;
        data.governmentChargeDescription = "";
        data.governmentChargeRegNo = "";
    }

    var pLength = 0;
    if(data.photos)
        pLength += data.photos.length;
    if(data.oldPhotos)
        pLength += data.oldPhotos.length;

    if(pLength > 15) {
        error = true;
        errorMessage.photos = 'Maximum 15 photos can be added';
    }

    if(!validator.isPositiveNumber(data.processingCapacity)) {
        error = true;
        errorMessage.processingCapacity = "A valid Processing Capacity is required";
    }
    else if(data.processingCapacity > constants.MAX_INT_VALUE) {
        error = true;
        errorMessage.processingCapacity = 'Such a big value is not allowed';
    }

    if(data.productReturnApplicable !== 'Applicable') {
        data.productReturnApplicable = 'Not applicable';
        data.productReturnPolicy = "";
    }
    else {
        if(!data.productReturnPolicy || data.productReturnPolicy.length < 5) {
            error = true;
            errorMessage.productReturnPolicy = "Product Return Policy must be at least 5 characters";
        }
        else if(data.productReturnPolicy.length > 5000) {
            data.productReturnPolicy = data.productReturnPolicy.substring(0,5000);
        }
    }

    if(shopValidator.checkShopDiscountDataError(data,errorMessage,optionData)) {
        error = true;
    }

    return !error;
}