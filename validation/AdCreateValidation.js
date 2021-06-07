const checkEmpty = require('../helper/checkEmpty');
const validator = require('../helper/validationHelper');
const adValidator = require('../helper/adValidationHelper');
const constants = require('../helper/myConstants');

module.exports = function validateAdCreateInput(data,errorMessage,optionData) {
    
    if(data.name === undefined || data.category === undefined || data.subcategory === undefined || data.options === undefined || data.contactNo === undefined
        || data.description === undefined || data.condition === undefined || data.for === undefined || data.parcel === undefined || data.weight === undefined 
        || data.weightUnit === undefined || data.parcelWeight === undefined || data.parcelWeightUnit === undefined || data.volume === undefined || data.volumeUnit === undefined 
        || data.dimension === undefined || data.dimensionUnit === undefined || data.parcelDimension === undefined || data.parcelDimensionUnit === undefined || data.area === undefined 
        || data.areaUnit === undefined || data.price === undefined || data.priceUnit === undefined || data.pricePer === undefined || data.parcelPrice === undefined 
        || data.parcelPriceUnit === undefined || data.governmentChargeApplicable === undefined || data.extraChargeApplicable === undefined
        || data.availableHours === undefined || data.photos === undefined || data.demoPhotos === undefined) {

        errorMessage.fatalError = 'Invalid request';
        return false;
    }

    data.type = checkEmpty(data.type);
    data.name = checkEmpty(data.name);
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
    data.governmentChargeApplicable = checkEmpty(data.governmentChargeApplicable);
    data.governmentCharge = checkEmpty(data.governmentCharge);
    data.governmentChargeDescription = checkEmpty(data.governmentChargeDescription);
    data.governmentChargeRegNo = checkEmpty(data.governmentChargeRegNo);
    data.extraChargeApplicable = checkEmpty(data.extraChargeApplicable);
    data.extraCharge = checkEmpty(data.extraCharge);
    data.extraChargeDescription = checkEmpty(data.extraChargeDescription);
    data.coordinate = checkEmpty(data.coordinate);
    data.address = checkEmpty(data.address);
    data.instruction = checkEmpty(data.instruction);
    data.sameAsShopOpeningHours = checkEmpty(data.sameAsShopOpeningHours) ? true : false;
    data.availableHours = checkEmpty(data.availableHours);
    data.midBreakApplicable = checkEmpty(data.midBreakApplicable);
    data.midBreaks = checkEmpty(data.midBreaks);
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

    if(data.type === "Shop Ad") {
        if(data.sameAsShopOpeningHours) {
            data.availableHours = {};
        }
        else if(!validator.isValidAvailablePeriod(data.availableHours)) {
            error = true;
            errorMessage.availableHours = 'Valid Available Hours are required';
        }
        data.governmentCharge = 0;
        data.governmentChargeDescription = undefined;
        data.governmentChargeRegNo = undefined;
        data.extraCharge = 0;
        data.extraChargeDescription = undefined;
        data.midBreakApplicable = undefined;
        data.midBreaks = undefined;
        data.instruction = undefined;
        data.processingCapacity = undefined;
        data.productReturnPolicy = undefined;
    }
    else if(data.type === "Individual Ad") {
        if(!validator.isValidAvailablePeriod(data.availableHours)) {
            error = true;
            errorMessage.availableHours = 'Valid Available Hours are required';
        }

        if(data.extraChargeApplicable) {
            if(validator.checkExtraChargeError(data,errorMessage))
                error = true;
        } else {
            data.extraCharge = 0;
            data.extraChargeDescription = "";
        }

        if(data.governmentChargeApplicable) {
            if(validator.checkGovernmentChargeError(data,errorMessage))
                error = true;
        } else {
            data.governmentCharge = 0;
            data.governmentChargeDescription = "";
            data.governmentChargeRegNo = "";
        }

        if(!validator.isValidLattitude(data.coordinate.lat) || !validator.isValidLongitude(data.coordinate.long)) {
            error = true;
            errorMessage.coordinate = 'A valid coordinate is required';
        }
        
        if(!validator.isValidString(data.address,5,2000)) {
            error = true;
            errorMessage.address = 'Address must be between 5 to 2000 characters';
        }
        
        if(data.instruction && data.instruction.length > 2000) {
            error = true;
            errorMessage.instruction = 'Instructions cannot be more than 2000 characters';
        }

        if(data.brandName && data.brandName.length > 200) {
            error = true;
            errorMessage.brandName = 'Brand Name cannot be more than 200 characters';
        }

        if(!data.contactNo) {
            error = true;
            errorMessage.contactNo = "At least one Contact Number is required";
        }
        else if(data.contactNo.length > 200) {
            error = true;
            errorMessage.contactNo = "Contact Number cannot be more than 200 characters";
        }
        else {
            data.contactNo = data.contactNo.replace(/( *, *)|( +)/g,", ");
        }

        if(data.midBreakApplicable) {
            if(!validator.isValidAvailablePeriod(data.midBreaks)) {
                error = true;
                errorMessage.midBreaks = 'Valid Mid Breaks are required';
            }
            else {
                const checkAvailablePeriodConflict = require('../helper/checkAvailablePeriodConflict');
                if(checkAvailablePeriodConflict(data.availableHours, data.midBreaks)) {
                    error = true;
                    errorMessage.midBreaks = "Mid Breaks conflict with the Opening Hours of the Shop";
                }
            }
        } else {
            data.midBreaks = {};
        }
    } else {
        errorMessage.type = 'A valid Type is required';
        error = true;
    }

    if(validator.checkNameError(data.name,errorMessage))
        error = true;

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

    var pLength = 0;
    if(data.photos)
        pLength += data.photos.length;
    if(data.demoPhotos)
        pLength += data.demoPhotos.length;

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
            errorMessage.for = "A valid value is required";
        }
        
        if(data.for === 'Rent' || data.category === 'Property') {
            data.condition = '';
        }
        else if(!/^New|Used|Reconditioned$/.test(data.condition)) {
            error = true;
            errorMessage.condition = 'A valid value is required';
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

    if(data.specifications && adValidator.checkSpecificationError(data.specifications,errorMessage)) {
        error = true;
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
                errorMessage.parcelWeight = 'Such a big number is not allowed';
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
                data.productReturnPolicy = "";
            }
            else if(data.type === "Individual Ad") {
                if(!data.productReturnPolicy || data.productReturnPolicy.length < 5) {
                    error = true;
                    errorMessage.productReturnPolicy = "Product Return Policy must be at least 5 characters";
                }
                else if(data.productReturnPolicy.length > 5000) {
                    data.productReturnPolicy = data.productReturnPolicy.substring(0,5000);
                }
            }
            if(data.type === "Individual Ad") {
                if(!validator.isPositiveNumber(data.processingCapacity)) {
                    error = true;
                    errorMessage.processingCapacity = "Processing Capacity must be a positive integer";
                }
                else if(data.processingCapacity > constants.MAX_INT_VALUE) {
                    error = true;
                    errorMessage.processingCapacity = 'Such a big value is not allowed';
                }
            }

            if(!validator.isPositiveNumber(data.numOfItems)) {
                error = true;
                errorMessage.numOfItems = 'Number of Items in Stock must be a positive number';
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

        data.pricePer = "";
    } else {
        data.parcel = false;
    }

    if(!data.parcel) {
        data.productReturnApplicable = 'Not applicable';
        data.processingCapacity = "";
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

    if(data.options && adValidator.checkOptionError(data.options,errorMessage,optionData)) {
        error = true;
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