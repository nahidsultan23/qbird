const bulkSave = require('./bulkSave');
const bulkRemove = require('./bulkRemove');

const adjustAdQuantity = (adsToAdjust,cb,ecb) => {
    const adModel = require('../models/adModel');
    adModel.find({ _id: { $in : Object.keys(adsToAdjust) }},(err,ads) => {
        if(err) {
            console.log(err);
            return ecb();
        }
        if(!ads)
            return ecb();

        ads.forEach(ad => {
            ad.numOfItems -= adsToAdjust[ad.id.toString()];
            if(ad.numOfItems < 0) ad.numOfItems =  0;
            if(ad.numOfItems === 0) ad.available = false;
        });

        bulkSave(ads,cb);
    });
}

const adjustCartQuantity = (cartItemsToAdjust,cb,ecb) => {
    const cartModel = require('../models/cartModel');
    cartModel.find({ _id: { $in : Object.keys(cartItemsToAdjust) }},(err,cartItems) => {
        if(err) {
            console.log(err);
            return ecb();
        }
        if(!cartItems)
            return ecb();

        let itemsToSave = [];
        let itemsToRemove = [];
        let totalQuantity = 0;
        cartItems.forEach(cartItem => {
            let quantity = cartItemsToAdjust[cartItem.id.toString()];
            cartItem.quantity -= quantity;
            totalQuantity += quantity;

            if(cartItem.quantity > 0) {
                itemsToSave.push(cartItem);
            }
            else {
                itemsToRemove.push(cartItem);
            }
        });

        bulkSave(itemsToSave,() => {
            bulkRemove(itemsToRemove,() => {
                cb(totalQuantity);
            })
        })
    });
}

const adjustItemQuantityOnOrderPlaced = (checkout,user,res,resData) => {

    let cartItemsToAdjust = {};
    let adsToAdjust = {};
    checkout.itemsArrangedByStoppages.forEach(point => {
        point.items.forEach(item => {
            cartItemsToAdjust[item.cartItemID.toString()] = item.quantity;
            let adKey = item.adID.toString();
            if(adsToAdjust[adKey])
                adsToAdjust[adKey] += item.quantity;
            else
                adsToAdjust[adKey] = item.quantity;
        });
    });

    adjustAdQuantity(adsToAdjust,() => {
        adjustCartQuantity(cartItemsToAdjust,(totalQuantity) => {
            checkout.remove();
            user.cartItemNumber -= totalQuantity;
            if(user.cartItemNumber < 0) user.cartItemNumber = 0;
            user
            .save()
            .then(u => {
                resData.cartItemNumber = u.cartItemNumber;
                resData.status = "success";
                res.json(resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                res.json(resData);
            });
        },
        () => {
            resData.errorMessage.fatalError = "Something went wrong!!";
            res.json(resData);
        });
    },
    () => {
        resData.errorMessage.fatalError = "Something went wrong!!";
        res.json(resData);
    });
}

module.exports = adjustItemQuantityOnOrderPlaced;