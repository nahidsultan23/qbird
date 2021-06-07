const checkItemAvailability = require('../helper/checkItemAvailability');
const bulkSave = require('./bulkSave');

const sendCartItems = (res,query,resData) => {
    const cartModel = require('../models/cartModel');
    cartModel
    .find(query)
    .populate('shopID','governmentCharge governmentChargeDescription extraCharge extraChargeDescription active forceOpen openingHours midBreaks version')
    .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems version optionVersion options name shopName price parcelPrice governmentCharge governmentChargeDescription extraCharge extraChargeDescription parcelWeightInKg isDeleted for numOfItemsPerOrder photos')
    .exec((err,cart) => {
        if(err || cart === null) {
            resData.status = 'failure';
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.subtotal = 0;
        resData.totalGovernmentCharge = 0;
        resData.totalExtraCharge = 0;

        let updatedItems = [];
        let quantityExist = {};
        cart.forEach((cartItem) => {
            if(!cartItem.adID) {
                resData.cart.push({cartErrorMessage: "Item is not available!"});
                return;
            }

            let key = cartItem.adID.id.toString();
            if(!quantityExist[key]) {
                quantityExist[key] = 0;
                cart.forEach((item) => {
                    if(item.adID.id.toString() === key)quantityExist[key] += item.quantity;
                });
            }

            let cartItemData = {
                id: cartItem._id,
                adID: key,
                adName: cartItem.adID.name,
                photo: cartItem.adID.photos ? cartItem.adID.photos[0] : null,
                quantity: cartItem.quantity,
                cartErrorMessage: checkItemAvailability(cartItem,cartItem.adID,cartItem.shopID,0,quantityExist[key])
            }

            if(cartItem.adID) {
                let itemUpdated = false;
                if(cartItem.shopID) {
                    cartItem.adID.governmentCharge = cartItem.shopID.governmentCharge;
                    cartItem.adID.governmentChargeDescription = cartItem.shopID.governmentChargeDescription;
                    cartItem.adID.extraCharge = cartItem.shopID.extraCharge;
                    cartItem.adID.extraChargeDescription = cartItem.shopID.extraChargeDescription;
                    cartItemData.shopID = cartItem.shopID.id;
                    if(cartItem.shopVersion !== cartItem.shopID.version) {
                        cartItem.shopVersion = cartItem.shopID.version;
                        itemUpdated = true;
                    }
                }

                if(cartItem.adID.version !== cartItem.adVersion) {
                    cartItem.adVersion = cartItem.adID.version;
                    cartItem.basePrice = cartItem.adID.price + cartItem.adID.parcelPrice
                    cartItem.unitPrice = cartItem.basePrice + cartItem.optionPrice;
                    itemUpdated = true;
                }
                if(itemUpdated) {
                    cartItem.totalPrice = cartItem.unitPrice * cartItem.quantity;
                    cartItem.governmentCharge = Math.round(cartItem.totalPrice * cartItem.adID.governmentCharge)/100;
                    cartItem.extraCharge = Math.round(cartItem.totalPrice * cartItem.adID.extraCharge)/100;
                    cartItem.netPrice = Math.round((cartItem.totalPrice + cartItem.governmentCharge + cartItem.extraCharge)*100)/100;
                    cartItem.weight = Math.round((cartItem.adID.parcelWeightInKg + cartItem.optionWeight) * cartItem.quantity * 100)/100;
                    updatedItems.push(cartItem);
                }

                let keys = ['basePrice','unitPrice','totalPrice','governmentCharge','extraCharge','netPrice','weight','options']
                keys.forEach(key => cartItemData[key] = cartItem[key]);

                cartItemData.shopName = cartItem.adID.shopName;
                cartItemData.governmentChargePercentage = cartItem.adID.governmentCharge;
                cartItemData.governmentChargeDescription = cartItem.adID.governmentChargeDescription;
                cartItemData.extraChargePercentage = cartItem.adID.extraCharge;
                cartItemData.extraChargeDescription = cartItem.adID.extraChargeDescription;
            }
            if(!cartItemData.cartErrorMessage) {
                resData.totalWeight += cartItemData.weight;
                resData.subtotal += cartItemData.totalPrice;
                resData.totalGovernmentCharge += cartItemData.governmentCharge;
                resData.totalExtraCharge += cartItemData.extraCharge;
                resData.netPayable += cartItemData.netPrice;
            }

            resData.cart.push(cartItemData);
        });

        resData.totalWeight = Math.round(resData.totalWeight * 100)/100;
        resData.netPayable = Math.round(resData.netPayable * 100)/100;
        bulkSave(updatedItems,() => {
            res.json(resData);
        })
    });
}

module.exports = sendCartItems;