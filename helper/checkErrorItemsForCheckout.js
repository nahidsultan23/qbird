const prepareItemOptions = require('./prepareItemOptions');
const getPublicAvailableStatus = require('./getPublicAvailableStatus');

const checkErrorItemsForCheckout = (itemsArrangedByStoppages,adData) => {
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
        },
        {//7
            errorMessage: "Items below make the Waiting Time more than 180 minutes",
            errorItems: []
        },
        {//8
            errorMessage: "Items below make stoppage count more than 10",
            errorItems: []
        },
        {//9
            errorMessage: "Items below make total distance among the stoppages more than 10 km",
            errorItems: []
        },
        {//10
            errorMessage: "Items below make the distance between two nearest stoppage more than 5 km",
            errorItems: []
        },
        {//11
            errorMessage: "Delivery is restricted for distances more than 10 km - kilometer. Items below make the delivery distance more than 10 km - kilometer",
            errorItems: []
        }
    ]

    let error = false;
    itemsArrangedByStoppages.forEach(point => {
        let itemStatus = {};

        point.items.forEach(item => {
            let key = item.adID.toString();
            let ad = adData[key].ad;
            let quantity = adData[key].quantity;
            let errorItem = {
                adID: key,
                adName: ad.name
            };

            if(itemStatus[key] === undefined) {
                itemStatus[key] = 1;

                if(ad.isDeleted || getPublicAvailableStatus(ad,ad.shopID) !== "Available") {
                    errorMessages[0].errorItems.push(errorItem);
                }
                else if(!ad.parcel) {
                    errorMessages[1].errorItems.push(errorItem);
                }
                else if(ad.for !== 'Sale'){
                    errorMessages[2].errorItems.push(errorItem);
                }
                else if(ad.leadTime !== "Less than 10 minutes" && ad.leadTime !== "10 minutes to 30 minutes" && ad.leadTime !== "30 minutes to 1 hour") {
                    errorMessages[3].errorItems.push(errorItem);
                }
                else {
                    itemStatus[key] = 0;
                    // check quantity
                    if(ad.numOfItemsPerOrder < ad.numOfItems) {
                        if(quantity > ad.numOfItemsPerOrder) {
                            itemStatus[key] = 2;
                            errorMessages[6].errorItems.push(errorItem);
                        }
                    }
                    else if(quantity > ad.numOfItems) {
                        itemStatus[key] = 2;
                        errorMessages[5].errorItems.push(errorItem);
                    }
                    if(item.errorCode) {
                        itemStatus[key] = 3;
                        errorMessages[item.errorCode].errorItems.push(errorItem);
                    }
                }
            }

            // check options
            if(itemStatus[key] !== 1 && itemStatus[key] !== 4 && item.options && (!item.adVersion || item.adVersion < ad.optionVersion)) {
                if(prepareItemOptions(item,ad.options)) {
                    itemStatus[key] = 4;
                    errorMessages[4].errorItems.push(errorItem);
                }
            }

            if(itemStatus[key] !== 0) {
                error = true;
            }
        });
    })

    let newErrorMessages = [];
    for(var i=0; i<errorMessages.length; i++)
        if(errorMessages[i].errorItems.length)
            newErrorMessages.push(errorMessages[i]);

    if(error)
        return newErrorMessages;
}

module.exports = checkErrorItemsForCheckout;