const prepareItemOptions = require('./prepareItemOptions');
const getPublicAvailableStatus = require('./getPublicAvailableStatus');

const calculateTotalQuantity = (adID,items) => {
    let totalQuantity = 0;

    items.forEach(item => {
        if(item.adID.id.toString() === adID)
            totalQuantity += item.quantity;
    });

    return totalQuantity;
}

const checkErrorItemsForCart = (items,checkLeadTime,storedQuantityInCart) => {
    let errorMessages = [
        {//0
            errorMessage: "Items below are not available",
            errorItems: []
        },
        {//1
            errorMessage: "Items below are not available for shipping",
            errorItems: []
        },
        {//2
            errorMessage: "Items below are not for sale",
            errorItems: []
        },
        {//3
            errorMessage: "Items below are not available for Express Shipping",
            errorItems: []
        },
        {//4
            errorMessage: "Items below are not available with the options selected",
            errorItems: []
        },
        {//5
            errorMessage: "Quantities of the Items below have exceeded the number of Items available",
            errorItems: []
        },
        {//6
            errorMessage: "Quantities of the Items below have exceeded the maximum number of Items allowed per order",
            errorItems: []
        }
    ]

    let itemStatus = {};
    let error = false;
    items.forEach(item => {
        if(!item.adID) {
            return;
        }

        let adID = item.adID.id.toString();
        let errorItem = {
            adID: adID,
            adName: item.adID.name
        };

        if(itemStatus[adID] === undefined) {
            itemStatus[adID] = 1;

            if(item.adID.isDeleted || getPublicAvailableStatus(item.adID,item.shopID) !== "Available") {
                errorMessages[0].errorItems.push(errorItem);
            }
            else if(!item.adID.parcel) {
                errorMessages[1].errorItems.push(errorItem);
            }
            else if(item.adID.for !== 'Sale'){
                errorMessages[2].errorItems.push(errorItem);
            }
            else if(checkLeadTime && item.adID.leadTime !== "Less than 10 minutes" && item.adID.leadTime !== "10 minutes to 30 minutes" && item.adID.leadTime !== "30 minutes to 1 hour") {
                errorMessages[3].errorItems.push(errorItem);
            }
            else {
                itemStatus[adID] = 0;
                // check quantity
                let totalQuantity = calculateTotalQuantity(adID,items);
                if(storedQuantityInCart)
                    totalQuantity += storedQuantityInCart[adID];

                if(item.adID.numOfItemsPerOrder < item.adID.numOfItems) {
                    if(totalQuantity > item.adID.numOfItemsPerOrder) {
                        itemStatus[adID] = 2;
                        errorMessages[6].errorItems.push(errorItem);
                    }
                }
                else if(totalQuantity > item.adID.numOfItems) {
                    itemStatus[adID] = 2;
                    errorMessages[5].errorItems.push(errorItem);
                }
            }
        }

        // check options
        if(itemStatus[adID] !== 1 && itemStatus[adID] !== 3 && item.options && (!item.adVersion || item.adVersion < item.adID.optionVersion)) {
            if(prepareItemOptions(item,item.adID.options)) {
                itemStatus[adID] = 3;
                errorMessages[4].errorItems.push(errorItem);
            }
        }

        if(itemStatus[adID] !== 0) {
            error = true;
        }
    });

    let newErrorMessages = [];
    for(var i=0; i<errorMessages.length; i++)
        if(errorMessages[i].errorItems.length)
            newErrorMessages.push(errorMessages[i]);

    if(error)
        return newErrorMessages;
}

module.exports = checkErrorItemsForCart;