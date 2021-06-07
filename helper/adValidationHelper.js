const validator = require('./validationHelper');
const constants = require('./myConstants');

const checkOptionError = (options,errorMessage,optionData) => {
    let error = false;
    if(options.length > 20) {
        error = true;
        errorMessage.options = 'Maximum 20 Options can be added';
    }
    else if(options.length > 0) {
        for(option in options) {
            option = options[option];

            if(!option.optionName || option.optionName.length > 50) {
                error = true;
                errorMessage.options = "A valid Option Name is needed within 50 characters";
            }
            else if(option.optionType !== "Mandatory" && option.optionType !== "Optional") {
                error = true;
                errorMessage.options = 'OptionType can be Mandatory or Optional';
            }
            else if(typeof option.options === 'object') {
                for(o in option.options) {
                    o = option.options[o];

                    if(!o.option || o.option.length > 50) {
                        error = true;
                        errorMessage.options = "A valid Option is needed within 50 characters";
                    }
                    else if(!validator.isNonNegativeNumber(o.extraPrice)) {
                        error = true;
                        errorMessage.options = 'Extra Price must be 0 or a positive number';
                    }
                    else if(o.extraPrice > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.options = 'Such a big value is not allowed';
                    }
                    else if(!validator.isNonNegativeNumber(o.extraWeight)) {
                        error = true;
                        errorMessage.options = 'Extra Weight must be 0 or a positive number';
                    }
                    else if(o.extraWeight > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.options = 'Such a big value is not allowed';
                    }
                    else if(!optionData.priceUnits.includes(o.extraPriceUnit)) {
                        error = true;
                        errorMessage.options = 'Enter a valid Extra Price Unit';
                    }
                    else {
                        var index = optionData.weightUnits.findIndex(unit => unit === o.extraWeightUnit);
                        if(index === -1) {
                            error = true;
                            errorMessage.options = 'Enter a valid Extra Weight Unit';
                        }
                        else {
                            o.extraWeightInKg = optionData.weightFactorForKg[index] * o.extraWeight;
                        }
                    }
                    if(error)
                        break;
                }
            }
            else {
                error = true;
                errorMessage.options = "Valid options are needed";
            }

            if(error)
                break;
        }
    }
    return error;
}

const checkSpecificationError = (specifications,errorMessage) => {

    for(var i=0; i < specifications.length; i++) {
        var item = specifications[i];
        if(!item.specificationName) {
            errorMessage.specifications = "Specification Name is required";
        }
        else if(item.specificationName.length > 100) {
            errorMessage.specifications = "Specification Name cannot be more than 100 characters";
        }
        if(!item.specification) {
            errorMessage.specifications = "Specification is required";
        }
        else if(item.specification.length > 100) {
            errorMessage.specifications = "Specification cannot be more than 100 characters";
        }
        if(errorMessage.specifications) {
            return true;
        }
    }
    return false;
}

const checkCategoryError = (data,errorMessage,optionData) => {
    let error = false;
    if(!data.category) {
        error = true;
        errorMessage.category = 'Category is required';
    }
    else if(!optionData.categories.find(c => c.categoryName === data.category) && !optionData.customCategories.find(cc => cc.categoryName === data.category)) {
        if(data.category.length > 100) {
            error = true;
            errorMessage.category = 'Category cannot be more than 100 characters';
        }
        if(data.subcategory && data.subcategory.length > 100) {
            error = true;
            errorMessage.subcategory = 'Subcategory cannot be more than 100 characters';
        }
    }
    return error;
}

const checkAdDiscountDataError = (data,errorMessage,optionData) => {
    if(!data.discounts) {
        errorMessage.fatalError = "Invalid request";
        return true;
    }

    let error = false;
    if(data.discounts.length > 50) {
        error = true;
        errorMessage.discounts = "Maximum 50 discounts can be added";
    }
    else {
        for(var i = 0; i < data.discounts.length; i++) {
            if(errorMessage.discounts)
                break;

            let discount = data.discounts[i];
            if(discount.discountOn !== 'Number' && discount.discountOn !== 'Price' && discount.discountOn !== 'Shippable Product Price') {
                error = true;
                errorMessage.discounts = "A valid Discount On is required";
            }
            else if(discount.discountType !== 'Percentage' && discount.discountType !== 'Amount') {
                error = true;
                errorMessage.discounts = "A valid Discount Type is required";
            }
            else if (discount.discountOn === 'Number' && discount.discountType !== 'Amount') {
                error = true;
                errorMessage.discounts = "Discount Type can be 'Amount' only";
            }
            else if(!validator.isPositiveNumber(discount.discount)) {
                error = true;
                errorMessage.discounts = "Discount must be a positive number";
            }
            else {
                discount.discount = Number(discount.discount);
                if(discount.discountType === 'Percentage') {
                    if(discount.discount > 100) {
                        error = true;
                        errorMessage.discounts = "Discount percentage can not exceed 100";
                    }
                }
                else if(discount.discountType === 'Amount') {
                    if(discount.discount > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.discounts = "Such a Big value is not allowed for Discount";
                    }
                    else if(!optionData.priceUnits.includes(discount.discountUnit)) {
                        error = true;
                        errorMessage.discounts = 'A valid Discount Unit is required';
                    }
                    else if (discount.discountOn === 'Number') {
                        if(discount.maxOrder) {
                            if(!validator.isPositiveNumber(discount.maxOrder)|| discount.maxOrder > constants.MAX_FRACTION_VALUE){
                                error = true;
                                errorMessage.discounts = "Maximum Order must be a positive integer";
                            }
                            else {
                                discount.maxOrder = Number(discount.maxOrder);
                                if(discount.discount > (data.price + data.parcelPrice) * discount.maxOrder) {
                                    error = true;
                                    errorMessage.discounts = "Discount cannot be bigger than the total order amount";
                                }
                                else {
                                    discount.maxOrderUnit = 'Unit';
                                }
                            }
                        }
                        else {
                            discount.maxOrder = undefined;
                        }

                        if(!errorMessage.discounts) {
                            if(discount.minOrder) {
                                discount.minOrder = Number(discount.minOrder);
                                if(!validator.isPositiveNumber(discount.minOrder) || discount.minOrder > constants.MAX_FRACTION_VALUE) {
                                    error = true;
                                    errorMessage.discounts = "Minimum Order must be a 0 or a positive integer";
                                }
                            }
                            else if(discount.minOrder != 0) {
                                discount.minOrder = 1;
                            }
                            discount.minOrderUnit = 'Unit';
                        }

                        if(!errorMessage.discounts && discount.minOrder > discount.maxOrder) {
                            error = true;
                            errorMessage.discounts = "Maximum Order cannot be less than Minimum Order";
                        }
                    }
                    else if (discount.discountOn === 'Price') {
                        if(discount.discount > data.price) {
                            error = true;
                            errorMessage.discounts = 'Discount cannobe be bigger than the Price of the item.';
                        }
                    }
                    else if (discount.discountOn === 'Shippable Product Price') {
                        if(discount.discount > data.price + data.parcelPrice) {
                            error = true;
                            errorMessage.discounts = 'Discount cannot be bigger than the sum of Price and Shippable Product Price';
                        }
                    }
                }
            }
        }
    }

    if(data.discountTag && data.discountTag !== "Buy 1 get 1" && data.discountTag !== "Buy 1 get 2" && data.discountTag !== "Buy 2 get 1") {
        error = true;
        errorMessage.discountTag = "Invalid Discount Tag";
    }

    return error;
}

module.exports = {
    checkOptionError: checkOptionError,
    checkAdDiscountDataError: checkAdDiscountDataError,
    checkSpecificationError: checkSpecificationError,
    checkCategoryError: checkCategoryError,
}