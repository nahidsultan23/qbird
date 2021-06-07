const validator = require('./validationHelper');
const constants = require('./myConstants');

const checkShopDiscountDataError = (data,errorMessage,optionData) => {
    let error = false;

    if(!data.discounts) {
        errorMessage.fatalError = "Invalid request";
        return true;
    }

    if(data.discounts.length > 50) {
        error = true;
        errorMessage.discounts = "Maximum 50 discounts can be added";
    }
    else {
        for(var i = 0; i < data.discounts.length; i++) {
            if(errorMessage.discounts)
                break;

            let discount = data.discounts[i];
            if(discount.discountOn !== 'Shipping Charge' && discount.discountOn !== 'Subtotal' && discount.discountOn !== 'Total') {
                error = true;
                errorMessage.discounts = "A valid Discount On value is required";
            }
            else if(!validator.isPositiveNumber(discount.discount)) {
                error = true;
                errorMessage.discounts = "A valid Discount is required";
            }
            else {
                discount.discount = Number(discount.discount);
                if(discount.discountType === 'Percentage') {
                    if(discount.discount > 100) {
                        error = true;
                        errorMessage.discounts = "Discount percentage can not exceed 100";
                    }
                    else if(validator.isPositiveNumber(discount.maxAmount)) {
                        if(discount.discountOn === 'Shipping Charge') {
                            let discountOnMinShippingCharge = Math.round(constants.SHIPPING_CHARGE * discount.discount)/100;
                            if(discount.maxAmount < discountOnMinShippingCharge) {
                                error = true;
                                errorMessage.discounts = "Maximum Discount Amount is smaller than the discount percentage of minimum Shipping Charge. It should be at least "+ discountOnMinShippingCharge + " or bigger.";
                            }
                        }
                        else {
                            let discountOnMinOrder = Math.round(discount.minOrder * discount.discount)/100;
                            if(discount.maxAmount < discountOnMinOrder) {
                                error = true;
                                errorMessage.discounts = "Maximum Discount Amount is smaller than the discount percentage of Minimum Order Amount. It should be at least "+ discountOnMinOrder + " or bigger.";
                            }
                        }
                    }
                    else {
                        discount.maxAmount = undefined;
                    }
                }
                else if(discount.discountType === 'Amount') {
                    if(discount.discount > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.discounts = "Such a big value is not allowed for Discount Amount";
                    }
                    else if(!optionData.priceUnits.includes(discount.discountUnit)) {
                        error = true;
                        errorMessage.discounts = 'A valid Discount Unit is required';
                    }
                    discount.maxAmount = undefined;
                    discount.maxAmountUnit = undefined;
                }
                else {
                    error = true;
                    errorMessage.discounts = "A valid Discount Type is required";
                }

                if(!errorMessage.discounts && validator.isPositiveNumber(discount.minOrder)) {
                    discount.minOrder = Number(discount.minOrder);
                    if(discount.minOrder < 0) {
                        error = true;
                        errorMessage.discounts = "Minimum Order Amount must be 0 or a positive number";
                    }
                    else if(discount.minOrder > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.discounts = "Such a big number is not allowed as Minimum Order Amount";
                    }
                    else if(!optionData.priceUnits.includes(discount.minOrderUnit)) {
                        error = true;
                        errorMessage.discounts = "Enter a valid Minimum Order Unit";
                    }
                }
                else {
                    discount.minOrder = 0;
                }

                if(!errorMessage.discounts && validator.isPositiveNumber(discount.maxOrder)) {
                    discount.maxOrder = Number(discount.maxOrder);
                    if(discount.maxOrder < 0) {
                        error = true;
                        errorMessage.discounts = "Maximum Order Amount must be a positive number";
                    }
                    else if(discount.maxOrder > constants.MAX_FRACTION_VALUE) {
                        error = true;
                        errorMessage.discounts = "Such a big number is not allowed as Minimum Order Amount";
                    }
                    else if(!optionData.priceUnits.includes(discount.maxOrderUnit)) {
                        error = true;
                        errorMessage.discounts = "A valid Maximum Order Unit is required";
                    }
                }
                else {
                    discount.maxOrder = undefined;
                }

                if(!errorMessage.discounts && discount.minOrder > discount.maxOrder) {
                    error = true;
                    errorMessage.discounts = "Maximum Order Amount cannot be less than Minimum Order Amount";
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

const checkCategoryError = (data,errorMessage,optionData,update) => {
    let error = false;
    if(!update) {
        if(!data.category) {
            error = true;
            errorMessage.category = 'Category is required';
        }
        else if(!optionData.shopCategories.find(c => c.categoryName === data.category) && data.category.length > 100) {
            error = true;
            errorMessage.category = 'Category cannot be more than 100 characters';
        }
    }

    if(data.subcategory && !optionData.shopCategories.find(cc => cc.categoryName === data.category) && data.subcategory.length > 100) {
        error = true;
        errorMessage.subcategory = 'Subcategory cannot be more than 100 characters';
    }
    return error;
}

module.exports = {
    checkShopDiscountDataError: checkShopDiscountDataError,
    checkCategoryError: checkCategoryError
}