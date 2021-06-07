const prepareItemOptions = require('./prepareItemOptions');
const getPublicAvailableStatus = require('./getPublicAvailableStatus');

const checkItemAvailability = (item,ad,shop,quantityExist,quantityToAdd) => {

    if(!ad || ad.isDeleted || getPublicAvailableStatus(ad,shop) !== "Available")
        return "Item is not available!";
    if(!ad.parcel)
        return "Item is not available for shipping!";
    if(ad.for !== 'Sale')
        return "Item is not for sale!";

    if(item.options && (!item.adVersion || item.adVersion < ad.optionVersion)) {
        if(prepareItemOptions(item,ad.options)) {
            return "Item with the options selected is not available";
        }
    }

    if(quantityExist || quantityToAdd) {
        let message = "";
        if(ad.numOfItemsPerOrder < ad.numOfItems) {
            if(quantityExist + quantityToAdd > ad.numOfItemsPerOrder)
                message = "Quantity exceeds the number of Items allowed per order.";
        }
        else if(quantityExist + quantityToAdd > ad.numOfItems) {
            message = "Quantity exceeds the number of Items available.";
        }

        if(message) {
            if(quantityExist) message += "You already have "+ quantityExist +" unit(s) of this item in your Cart";
            return message;
        }
    }

    if(item.errorCode)
        return item.checkoutErrorMessage;
}

module.exports = checkItemAvailability;