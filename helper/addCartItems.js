
const sortOptions = require('./sortOptions');

const addCartItems = (cartItems,index,res,resData,user) => {

    if(index < 0) {
        resData.cartItemNumber = user.cartItemNumber;

        user
        .save()
        .then( user => {
            resData.status = "success";
            return res.json(resData);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
        return;
    }

    sortOptions(cartItems[index].options);

    const cartModel = require('../models/cartModel');
    cartModel.find({userID: user.id,adID: cartItems[index].adID.id},(err,cart) => {
        if(err || !cart) {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        var isSameCartOptions = require('../helper/isSameCartOptions');
        var item = cart.find((item) => isSameCartOptions(cartItems[index].options,item.options));

        if(!item) {
            item = new cartModel({
                userID: user.id,
                adID: cartItems[index].adID.id,
                adVersion: cartItems[index].adID.version,
                shopID: cartItems[index].shopID,
                options: cartItems[index].options,
                quantity: cartItems[index].quantity,
                optionPrice: cartItems[index].optionPrice,
                optionWeight: cartItems[index].optionWeight,
                basePrice: cartItems[index].adID.price + cartItems[index].adID.parcelPrice
            });
            item.unitPrice = item.basePrice + item.optionPrice;
            if(cartItems[index].shopID) {
               item.shopVersion = cartItems[index].shopID.version;
               cartItems[index].adID.governmentCharge = cartItems[index].shopID.governmentCharge;
               cartItems[index].adID.extraCharge = cartItems[index].adID.extraChargeApplicable ? cartItems[index].shopID.extraCharge : 0;
            }
        } else {
            item.quantity += cartItems[index].quantity;
        }
        item.totalPrice = item.unitPrice * item.quantity;
        item.governmentCharge = Math.round(item.totalPrice * cartItems[index].adID.governmentCharge)/100;
        item.extraCharge = Math.round(item.totalPrice * cartItems[index].adID.extraCharge)/100;
        item.netPrice = Math.round((item.totalPrice + item.governmentCharge + item.extraCharge)*100)/100;
        item.weight = Math.round((cartItems[index].adID.parcelWeightInKg + item.optionWeight) * item.quantity * 100)/100;

        item
        .save()
        .then(cartItem => {
            user.cartItemNumber += cartItems[index].quantity;
            addCartItems(cartItems,index-1,res,resData,user);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    });
}

module.exports = addCartItems;