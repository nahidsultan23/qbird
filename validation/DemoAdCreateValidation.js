const checkEmpty = require('../helper/checkEmpty');
const validator = require('../helper/validationHelper');
const constants = require('../helper/myConstants');
const adValidator = require('../helper/adValidationHelper');

module.exports = function validateDemoAdCreateInput(data,errorMessage,optionData) {
    
    if(data.name === undefined || data.category === undefined || data.subcategory === undefined || data.description === undefined || data.weight === undefined 
        || data.weightUnit === undefined || data.parcelWeight === undefined || data.parcelWeightUnit === undefined || data.volume === undefined || data.volumeUnit === undefined 
        || data.dimension === undefined || data.dimensionUnit === undefined || data.parcelDimension === undefined || data.parcelDimensionUnit === undefined
        || data.price === undefined || data.priceUnit === undefined || data.parcelPrice === undefined || data.parcelPriceUnit === undefined || data.photos === undefined) {

        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.name = checkEmpty(data.name);
    data.category = checkEmpty(data.category);
    data.subcategory = checkEmpty(data.subcategory);
    data.description = checkEmpty(data.description);
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
    data.price = checkEmpty(data.price);
    data.priceUnit = checkEmpty(data.priceUnit);
    data.parcelPrice = checkEmpty(data.parcelPrice);
    data.parcelPriceUnit = checkEmpty(data.parcelPriceUnit);

    let error = false;

    if(data.brandName && data.brandName.length > 200) {
        error = true;
        errorMessage.brandName = 'Brand Name cannot be more than 200 characters';
    }

    if(data.specifications && adValidator.checkSpecificationError(data.specifications,errorMessage)) {
        error = true;
    }

    if(!data.category || data.category === 'Job' || data.category === 'Service' || data.category === 'Property') {
        error = true;
        errorMessage.category = 'This category is not allowed for Demo Ads';
    } else {
        if(validator.checkNameError(data.name,errorMessage))
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

        var pLength = 0;
        if(data.photos)
            pLength += data.photos.length;
        if(data.oldPhotos)
            pLength += data.oldPhotos.length;

        if(pLength > 15) {
            error = true;
            errorMessage.photos = 'Maximum 15 photos can be added';
        }

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
                errorMessage.dimension = 'All the 3 Dimensions must be positive numbers';
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
                errorMessage.parcelDimensionUnit = 'A valid Dimension Unit is required';
            }
        }
        else {
            data.parcelDimension = [];
        }

        if(data.parcelPrice) {
            if(!validator.isPositiveNumber(data.parcelPrice)) {
                error = true;
                errorMessage.parcelPrice = 'Extra Price for Shippable Product must be a positive number';
            }
            else if(data.parcelPrice > constants.MAX_FRACTION_VALUE) {
                error = true;
                errorMessage.parcelPrice = 'Such a big amount is not allowed';
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

        if(data.options && adValidator.checkOptionError(data.options,errorMessage,optionData)) {
            error = true;
        }

        if(data.expiryTime !== "Less than 10 minutes" && data.expiryTime !== "10 minutes to 30 minutes" && data.expiryTime !== "30 minutes to 1 hour"
            && data.expiryTime !== "1 hour to 3 hours" && data.expiryTime !== "3 hours to 6 hours" && data.expiryTime !== "6 hours to 12 hours"
            && data.expiryTime !== "12 hours to 24 hours" && data.expiryTime !== "1 day to 3 days" && data.expiryTime !== "3 days to 7 days"
            && data.expiryTime !== "7 days to 15 days" && data.expiryTime !== "15 days to 30 days" && data.expiryTime !== "More than 30 days") {
                error = true;
                errorMessage.expiryTime = "Enter a valid Expiry Time";
        }
    }

    return !error;
}