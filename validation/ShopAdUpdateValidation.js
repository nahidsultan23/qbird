const checkEmpty = require('../helper/checkEmpty');
const validator = require('../helper/validationHelper');
const adValidator = require('../helper/adValidationHelper');
const constants = require('../helper/myConstants');

module.exports = function validateShopAdUpdateInput(data,errorMessage,optionData) {

    if(data.category === undefined || data.subcategory === undefined || data.options === undefined || data.description === undefined || data.contactNo === undefined
        || data.condition === undefined || data.for === undefined || data.parcel === undefined || data.weight === undefined || data.weightUnit === undefined 
        || data.parcelWeight === undefined || data.parcelWeightUnit === undefined || data.volume === undefined || data.volumeUnit === undefined || data.dimension === undefined 
        || data.dimensionUnit === undefined || data.parcelDimension === undefined || data.parcelDimensionUnit === undefined || data.area === undefined || data.areaUnit === undefined 
        || data.price === undefined || data.priceUnit === undefined || data.pricePer === undefined || data.parcelPrice === undefined || data.parcelPriceUnit === undefined 
        || data.availableHours === undefined || data.photos === undefined || data.oldPhotos === undefined || !validator.isValidObjectID(data.adID)) {

        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.category = checkEmpty(data.category);
    data.subcategory = checkEmpty(data.subcategory);
    data.options = checkEmpty(data.options);
    data.description = checkEmpty(data.description);
    data.contactNo = checkEmpty(data.contactNo);
    data.condition = checkEmpty(data.condition);
    data.for = checkEmpty(data.for);
    data.parcel = checkEmpty(data.parcel);
    data.weight = checkEmpty(data.weight);
    data.weightUnit = checkEmpty(data.weightUnit);
    data.parcelWeight = checkEmpty(data.parcelWeight);
    data.parcelWeightUnit = checkEmpty(data.parcelWeightUnit);
    data.volume = checkEmpty(data.volume);
    data.volumeUnit = checkEmpty(data.volumeUnit);
    data.dimension = checkEmpty(data.dimension);
    data.dimensionUnit = checkEmpty(data.dimensionUnit);
    data.parcelDimension = checkEmpty(data.parcelDimension);
    data.parcelDimensionUnit = checkEmpty(data.parcelDimensionUnit);
    data.area = checkEmpty(data.area);
    data.areaUnit = checkEmpty(data.areaUnit);
    data.price = checkEmpty(data.price);
    data.priceUnit = checkEmpty(data.priceUnit);
    data.pricePer = checkEmpty(data.pricePer);
    data.parcelPrice = checkEmpty(data.parcelPrice);
    data.parcelPriceUnit = checkEmpty(data.parcelPriceUnit);
    data.sameAsShopOpeningHours = checkEmpty(data.sameAsShopOpeningHours) ? true : false;
    data.availableHours = checkEmpty(data.availableHours);
    data.specifications = checkEmpty(data.specifications);
    data.numOfItems = checkEmpty(data.numOfItems);
    data.numOfItemsPerOrder = checkEmpty(data.numOfItemsPerOrder);
    data.leadTime = checkEmpty(data.leadTime);
    data.expiryTime = checkEmpty(data.expiryTime);

    let error = false;

    if(!validator.isBoolean(data.governmentChargeApplicable) || data.governmentChargeApplicable !== true) {
        data.governmentChargeApplicable == false;
    }

    if(!validator.isBoolean(data.extraChargeApplicable) || data.extraChargeApplicable !== true) {
        data.extraChargeApplicable == false;
    }

    if(adValidator.checkCategoryError(data,errorMessage,optionData))
        error = true;

    if(!validator.isValidString(data.description,5,5000)) {
        error = true;
        errorMessage.description = 'Description must be between 5 to 5000 characters';
    }

    if(!validator.isNonNegativeNumber(data.price)) {
        error = true;
        errorMessage.price = 'Price must be a positive number';
    }
    else if(data.price > constants.MAX_FRACTION_VALUE) {
        error = true;
        errorMessage.price = 'Such a big amount is not allowed';
    }
    else {
        data.price = Number(data.price);
    }

    if(!optionData.priceUnits.includes(data.priceUnit)) {
        error = true;
        errorMessage.priceUnit = 'A valid Price Unit is required';
    }

    if(data.sameAsShopOpeningHours) {
        data.availableHours = {};
    }
    else if(!validator.isValidAvailablePeriod(data.availableHours)) {
        error = true;
        errorMessage.availableHours = 'Valid Available Hours are required';
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

    if(/^Medicine|Job|Food and drinks|Service|Fruit and vegetable|Grocery$/.test(data.category)) {
        data.for = '';
        data.condition = '';
    }
    else {

        if(data.for !== 'Rent' && data.for !== 'Sale') {
            error = true;
            errorMessage.for = "Enter a valid value";
        }
        
        if(data.for === 'Rent' || data.category === 'Property') {
            data.condition = '';
        }
        else if(!/^New|Used|Reconditioned$/.test(data.condition)) {
            error = true;
            errorMessage.condition = 'Enter a valid value';
        }

        if(data.category === 'Property') {
            data.condition = '';
            if(data.area) {
                if(!validator.isPositiveNumber(data.area)) {
                    error = true;
                    errorMessage.area = 'Area must be a positive number';
                }
                else if(data.area > constants.MAX_FRACTION_VALUE) {
                    error = true;
                    errorMessage.area = 'Such a big value is not allowed';
                }

                if(!optionData.areaUnits.includes(data.areaUnit)) {
                    error = true;
                    errorMessage.areaUnit = 'A valid Area Unit is required';
                }
            }
        }
    }

    if(data.specifications) {
        if(adValidator.checkSpecificationError(data.specifications,errorMessage))
            error = true;
    }
    else {
        data.specifications = []
    }

    if(data.category === 'Job' || data.category === 'Service' || data.for === 'Rent') {
        if(!optionData.pricePer.includes(data.pricePer)) {
            error = true;
            errorMessage.pricePer = 'Price Per is required';
        }
        data.parcel = false;
    }
    else if(data.category != 'Property') {
        if(validator.isBoolean(data.parcel) && data.parcel === true) {
            if(!validator.isPositiveNumber(data.parcelWeight)) {
                error = true;
                errorMessage.parcelWeight = 'Shipping Weight must be a positive number';
            }
            else if(data.parcelWeight > constants.MAX_FRACTION_VALUE) {
                error = true;
                errorMessage.parcelWeight = 'Such a big value is not allowed';
            }

            var index = optionData.weightUnits.findIndex(unit => unit === data.parcelWeightUnit);
            if(index === -1) {
                error = true;
                errorMessage.parcelWeightUnit = 'A valid Shipping Weight Unit is required';
            }
            else {
                data.parcelWeightInKg = optionData.weightFactorForKg[index] * data.parcelWeight;
            }

            if(data.parcelPrice) {
                if(!validator.isPositiveNumber(data.parcelPrice)) {
                    error = true;
                    errorMessage.parcelPrice = 'Extra Price for Shippable Product must be a positive number';
                }
                else if(data.parcelPrice > constants.MAX_FRACTION_VALUE) {
                    error = true;
                    errorMessage.parcelPrice = 'Such a big value is not allowed';
                }
                else {
                    data.parcelPrice = Number(data.parcelPrice);
                }
                if(!optionData.priceUnits.includes(data.parcelPriceUnit)) {
                    error = true;
                    errorMessage.parcelPriceUnit = 'A valid Unit is required';
                }
            }
            else {
                data.parcelPrice = 0;
            }

            if(data.parcelDimension) {
                if(!validator.isValidDimension(data.parcelDimension)) {
                    error = true;
                    errorMessage.parcelDimension = 'A valid Shipping Dimension is required';
                }
                else if(data.parcelDimension > constants.MAX_FRACTION_VALUE) {
                    error = true;
                    errorMessage.parcelDimension = 'Such a big value is not allowed';
                }

                if(!optionData.dimensionUnits.includes(data.parcelDimensionUnit)) {
                    error = true;
                    errorMessage.parcelDimensionUnit = 'A valid Shipping Dimension Unit is required';
                }
            } else {
                data.parcelDimension = [];
            }

            if(data.productReturnApplicable !== 'Applicable') {
                data.productReturnApplicable = 'Not applicable';
            }

            if(!validator.isNonNegativeNumber(data.numOfItems)) {
                error = true;
                errorMessage.numOfItems = 'Number of Items in Stock must be 0 or a positive number';
            }
            else if(data.numOfItems > constants.MAX_INT_VALUE) {
                error = true;
                errorMessage.numOfItems = 'Such a big value is not allowed';
            }
            if(!validator.isPositiveNumber(data.numOfItemsPerOrder)) {
                error = true;
                errorMessage.numOfItemsPerOrder = 'Maximum Number of Items per Order must be a positive number';
            }
            else if(data.numOfItemsPerOrder > constants.MAX_INT_VALUE) {
                error = true;
                errorMessage.numOfItemsPerOrder = 'Such a big value is not allowed';
            }
            if(data.leadTime !== "Less than 10 minutes" && data.leadTime !== "10 minutes to 30 minutes" && data.leadTime !== "30 minutes to 1 hour"
                && data.leadTime !== "1 hour to 3 hours" && data.leadTime !== "3 hours to 24 hours" && data.leadTime !== "More than 1 day") {
                    error = true;
                    errorMessage.leadTime = "Enter a valid Lead Time";
            }
            if(data.expiryTime !== "Less than 10 minutes" && data.expiryTime !== "10 minutes to 30 minutes" && data.expiryTime !== "30 minutes to 1 hour"
                && data.expiryTime !== "1 hour to 3 hours" && data.expiryTime !== "3 hours to 6 hours" && data.expiryTime !== "6 hours to 12 hours"
                && data.expiryTime !== "12 hours to 24 hours" && data.expiryTime !== "1 day to 3 days" && data.expiryTime !== "3 days to 7 days"
                && data.expiryTime !== "7 days to 15 days" && data.expiryTime !== "15 days to 30 days" && data.expiryTime !== "More than 30 days") {
                    error = true;
                    errorMessage.expiryTime = "Enter a valid Expiry Time";
            }
        }
        else {
            data.parcel = false;
        }

        if(data.weight) {
            if(!validator.isPositiveNumber(data.weight)) {
                error = true;
                errorMessage.weight = 'Weight must be a positive number ';
            }
            else if(data.weight > constants.MAX_FRACTION_VALUE) {
                error = true;
                errorMessage.weight = 'Such a big value is not allowed';
            }

            if(!optionData.weightUnits.includes(data.weightUnit)) {
                error = true;
                errorMessage.weightUnit = 'A valid Weight Unit is required';
            }
        }

        if(data.volume) {
            if(!validator.isPositiveNumber(data.volume)) {
                error = true;
                errorMessage.volume = 'Volume must be a positive number';
            }
            else if(data.volume > constants.MAX_FRACTION_VALUE) {
                error = true;
                errorMessage.volume = 'Such a big value is not allowed';
            }

            if(!optionData.volumeUnits.includes(data.volumeUnit)) {
                error = true;
                errorMessage.volumeUnit = 'A valid Volume Unit is required';
            }
        }

        if(data.dimension) {
            if(!validator.isValidDimension(data.dimension)) {
                error = true;
                errorMessage.dimension = 'All the 3 dimensions must be positive numbers';
            }
            else if(data.dimension > constants.MAX_FRACTION_VALUE) {
                error = true;
                errorMessage.dimension = 'Such a big value is not allowed';
            }

            if(!optionData.dimensionUnits.includes(data.dimensionUnit)) {
                error = true;
                errorMessage.dimensionUnit = 'A valid Dimension Unit is required';
            }
        } else {
            data.dimension = [];
        }

        data.pricePer = "";
    } else {
        data.parcel = false;
    }

    if(!data.parcel) {
        data.productReturnApplicable = 'Not applicable';
        data.parcelDimension = [];
        data.specifications = [];
        data.options = [];
        data.parcelWeight = 0;
        data.parcelWeightUnit = undefined;
        data.parcelWeightInKg = 0;
        data.parcelPrice = 0;
        data.numOfItems = undefined;
        data.numOfItemsPerOrder = undefined;
        data.leadTime = undefined;
        data.expiryTime = undefined;
    }

    if(data.options) {
        if(adValidator.checkOptionError(data.options,errorMessage,optionData))
            error = true;
    }
    else {
        data.options = []
    }

    if(data.category === 'Job') {
        data.discounts = [];
        data.discountTag = '';
    }
    else if(adValidator.checkAdDiscountDataError(data,errorMessage,optionData)) {
        error = true;
    }

    return !error;
}