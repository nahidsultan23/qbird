const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const adModel = require('../models/adModel');
const cartModel = require('../models/cartModel');
const buyNowModel = require('../models/buyNowModel');
const checkoutModel = require('../models/checkoutModel');
const constants = require('../helper/myConstants');
const validator = require('../helper/validationHelper');
const sortOptions = require('../helper/sortOptions');
const storedInDatabaseModel = require('../models/storedInDatabaseModel');
const checkItemAvailability = require('../helper/checkItemAvailability');
const checkErrorItemsForCart = require('../helper/checkErrorItemsForCart');
const checkErrorItemsForCheckout = require('../helper/checkErrorItemsForCheckout');
const sendWishListItems = require('../helper/sendWishListItems');
const sendBuyNowItem = require('../helper/sendBuyNowItem');
const sendCartItems = require('../helper/sendCartItems');
const groupAdsByStoppage = require('../helper/groupAdsByStoppage');
const calculateStoppageWaitingCharge = require('../helper/calculateStoppageWaitingCharge');
const calculateEstimatedDistance = require('../helper/calculateEstimatedDistance');
const getShippingClass = require('../helper/getShippingClass');
const calculateExtraDistanceCharge = require('../helper/calculateExtraDistanceCharge');
const calculateExtraWeightCharge = require('../helper/calculateExtraWeightCharge');
const checkItemPriceUpdate = require('../helper/checkItemPriceUpdate');
const calculateShippingCharge = require('../helper/calculateShippingCharge');
const calculateExtraStoppageCharge = require('../helper/calculateExtraStoppageCharge');
const checkAndUpdateStoppageData = require('../helper/checkAndUpdateStoppageData');
const calculateItemDiscounts = require('../helper/calculateItemDiscounts');
const calculateShippingDiscounts = require('../helper/calculateShippingDiscounts');
const calculateFinalDiscount = require('../helper/calculateFinalDiscount');
const validateAddressInfo = require('../validation/validateAddressInfo');
const isLoggedIn = require('../helper/isLoggedIn');

router.post('/wishlist',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Item is not available!";
            return res.json(resData);
        }

        adModel.findById(req.body.adID,(err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            else if(!ad|| ad.isDeleted) {
                resData.errorMessage.fatalError = "Item is not available!";
                return res.json(resData);
            }

            const wishListModel = require('../models/wishListModel');
            wishListModel.findOne({userID: user.id, adID: ad.id},(err,wishListItem) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                else if(wishListItem === null) {
                    wishListItem = new wishListModel({
                        userID: user.id,
                        adID: ad.id
                    });
                }
                else {
                    wishListItem.time = new Date();
                }
                wishListItem
                .save()
                .then( w => {
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        }); 
    });
});

router.post('/cart-many',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        errorItems: [],
        cartItemNumber: ""
    }

    let cartItems = req.body.cart;
    if(typeof cartItems !== 'object') {
        resData.errorMessage.fatalError = "Something went wrong!!";
        return res.json(resData);
    }

    isLoggedIn(req,res,resData,(user) => {

        let adIDs = [];
        cartItems.forEach(cartItem => {
            if(!validator.isValidObjectID(cartItem.adID)) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!validator.isPositiveNumber(cartItem.quantity))
                cartItem.quantity = 1;

            adIDs.push(mongoose.Types.ObjectId(cartItem.adID));
        });

        adModel.find({_id: {$in: adIDs}}).populate('shopID','active forceOpen openingHours midBreaks version governmentCharge extraCharge').exec((err,ads) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            for(var i=0; i < cartItems.length; i++) {
                let ad = ads.find(ad => ad.id.toString() === cartItems[i].adID.toString());
                if(ad) {
                    cartItems[i].adID = ad;
                    cartItems[i].shopID = ad.shopID;
                }
                else {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
            }

            let storedQuantityInCart = {};
            cartModel.aggregate().match({adID: {$in: adIDs}}).group({_id: '$adID', quantityExist: {$sum : '$quantity'}})
            .exec((err,result) => {
                if(err || !result) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                result.forEach(r => {
                    storedQuantityInCart[r._id.toString()] = r.quantityExist;
                });

                let errorMessages = checkErrorItemsForCart(cartItems,false,storedQuantityInCart);

                if(errorMessages) {
                    resData.errorMessages = errorMessages;
                    return res.json(resData);
                }

                const addCartItems = require('../helper/addCartItems');
                addCartItems(cartItems,cartItems.length-1,res,resData,user);
            });
        });
    });
});

router.post('/cart',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        cartItemNumber: ""
    }

    if(typeof req.body.cart !== 'object') {
        resData.errorMessage.fatalError = "Something went wrong!!";
        return res.json(resData);
    }

    isLoggedIn(req,res,resData,(user) => {
        let cartItem = req.body.cart;
        if(!validator.isValidObjectID(cartItem.adID)) {
            resData.errorMessage.fatalError = "Item is not available!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(cartItem.quantity))
            cartItem.quantity = 1;

        adModel.findById(cartItem.adID).populate('shopID','active forceOpen openingHours midBreaks version governmentCharge extraCharge').exec((err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            sortOptions(cartItem.options);

            cartModel.find({userID: user.id,adID: cartItem.adID},(err,cart) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let quantityToAdd = cartItem.quantity;
                let quantityExist = 0;
                cart.forEach(item => quantityExist += item.quantity);
                cartItem.shopID = ad.shopID;
                let errorMessage = checkItemAvailability(cartItem,ad,cartItem.shopID,quantityExist,quantityToAdd);
                if(errorMessage) {
                    resData.cartItemNumber = user.cartItemNumber;
                    resData.errorMessage.fatalError = errorMessage;
                    return res.json(resData)
                }

                var isSameCartOptions = require('../helper/isSameCartOptions');
                var item = cart.find((item) => isSameCartOptions(cartItem.options,item.options));

                if(!item) {
                    item = new cartModel({
                        userID: user.id,
                        adID: ad.id,
                        adVersion: ad.version,
                        shopID: ad.shopID,
                        options: cartItem.options,
                        quantity: cartItem.quantity,
                        optionPrice: cartItem.optionPrice,
                        optionWeight: cartItem.optionWeight,
                        basePrice: ad.price + ad.parcelPrice
                    });
                    item.unitPrice = item.basePrice + item.optionPrice;
                    if(ad.shopID) {
                       item.shopVersion = ad.shopID.version;
                       ad.governmentCharge = ad.shopID.governmentCharge;
                       ad.extraCharge = ad.extraChargeApplicable ? ad.shopID.extraCharge : 0;
                    }
                } else {
                    item.quantity += cartItem.quantity;
                }
                item.totalPrice = item.unitPrice * item.quantity;
                item.governmentCharge = Math.round(item.totalPrice * ad.governmentCharge)/100;
                item.extraCharge = Math.round(item.totalPrice * ad.extraCharge)/100;
                item.netPrice = Math.round((item.totalPrice + item.governmentCharge + item.extraCharge)*100)/100;
                item.weight = Math.round((ad.parcelWeightInKg + item.optionWeight) * item.quantity * 100)/100;

                item
                .save()
                .then(item => {
                    user.cartItemNumber += cartItem.quantity;
                    user
                    .save()
                    .then(user => {
                        resData.cartItemNumber = user.cartItemNumber;
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        res.json(resData);
                    });
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    res.json(resData);
                });
            });
        });
    });
});

router.post('/buy-now',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Item is not available!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;

        buyNowModel.findOne({userID: user.id},(err,buyNow) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            sortOptions(req.body.options);

            adModel.findById(req.body.adID).populate('shopID','active forceOpen openingHours midBreaks version extraCharge governmentCharge').exec((err,ad) => {
                if(err || !ad) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                req.body.quantity = parseInt(req.body.quantity);
                let buyNowItem = {
                    shopID: ad.shopID,
                    options: req.body.options,
                    quantity: req.body.quantity
                };
                let errorMessage = checkItemAvailability(buyNowItem,ad,buyNowItem.shopID,0,req.body.quantity);

                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return res.json(resData)
                }

                if(buyNow === null) {
                    buyNow = new buyNowModel({
                        userID: user.id
                    });
                }

                if(ad.shopID) {
                    buyNow.shopVersion = ad.shopID.version;
                    ad.governmentCharge = ad.shopID.governmentCharge;
                    ad.extraCharge = ad.extraChargeApplicable ? ad.shopID.extraCharge : 0;
                }
                buyNow.adID = ad.id;
                buyNow.adVersion = ad.version;
                buyNow.shopID = ad.shopID;
                buyNow.options = buyNowItem.options,
                buyNow.quantity = buyNowItem.quantity,
                buyNow.optionPrice = buyNowItem.optionPrice,
                buyNow.optionWeight = buyNowItem.optionWeight,
                buyNow.basePrice = ad.price + ad.parcelPrice
                buyNow.unitPrice = buyNow.basePrice + buyNow.optionPrice;

                buyNow.totalPrice = buyNow.unitPrice * buyNow.quantity;
                buyNow.governmentCharge = Math.round(buyNow.totalPrice * ad.governmentCharge)/100;
                buyNow.extraCharge = Math.round(buyNow.totalPrice * ad.extraCharge)/100;
                buyNow.netPrice = Math.round((buyNow.totalPrice + buyNow.governmentCharge + buyNow.extraCharge)*100)/100;
                buyNow.weight = Math.round((ad.parcelWeightInKg + buyNow.optionWeight) * buyNow.quantity * 100)/100;

                buyNow
                .save()
                .then( buyNowItem => {
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        }); 
    });
});

const prepareAndSaveCheckout = (res,resData,items,user,from) => {
    if(items.length < 1) {
        resData.errorMessage.fatalError = "Selected item list is empty, can not proceed. Please add some item to cart or buy now";
        return res.json(resData);
    }

    let adData = {};
    items.forEach(item => {
        let key = item.adID.id.toString();
        if(!adData[key]) {
            item.adID.shopID = item.shopID;
            adData[key] = {quantity: item.quantity,ad: item.adID};
        }
        else {
            adData[key].quantity += item.quantity;
        }
        let shopUpdated = item.shopID && item.shopVersion !== item.shopID.version;
        if(shopUpdated) {
            item.shopVersion = item.shopID.version
        }
        checkItemPriceUpdate(item,item.adID,item.shopID,shopUpdated);
    });

    checkoutModel.findOne({userID: user.id},(err,checkout) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else if(!checkout) {
            checkout = new checkoutModel({userID: user.id,from: from});
        } else {
            checkout.from = from;
            checkout.distance = 0;
            checkout.location = undefined;
            checkout.userCoordinate = undefined;
            checkout.address = undefined;
            checkout.addressID = undefined;
        }

        checkout.itemsArrangedByStoppages = groupAdsByStoppage(items,from);

        checkout.subtotal = checkout.totalGovernmentCharge = checkout.totalExtraCharge = checkout.total = checkout.totalWeight = 0;
        let totalWaitingTime = 0;
        let totalItemDiscount = 0;
        checkout.itemsArrangedByStoppages.forEach(point => {
            checkout.subtotal += point.subtotal;
            checkout.totalGovernmentCharge += point.governmentCharge;
            checkout.totalExtraCharge += point.extraCharge;
            checkout.total += point.total;
            checkout.totalWeight += point.totalWeight;

            let shopDiscounts = null;
            let ad = adData[point.items[0].adID.toString()].ad;
            if((point.type === "Shop")) {
                totalWaitingTime = calculateStoppageWaitingCharge(point,adData,ad.shopID.processingCapacity,totalWaitingTime);
                shopDiscounts = ad.shopID.discounts;
            }
            else {
                totalWaitingTime = calculateStoppageWaitingCharge(point,adData,ad.processingCapacity,totalWaitingTime);
            }
            calculateItemDiscounts(point,adData,shopDiscounts);
            totalItemDiscount += point.itemDiscount;
        });

        if(checkout.total > constants.MAX_FRACTION_VALUE) {
            resData.errorMessage.fatalError = "Order of such big amount cannot be placed";
            return res.json(resData);
        }

        if(totalWaitingTime > 180) {
            resData.errorMessage.fatalError = "Waiting time cannot be more than 180 minutes";
            return res.json(resData);
        }

        checkout.totalWaitingTime = totalWaitingTime;
        checkout.shippingCharge = calculateShippingCharge(totalWaitingTime);

        if(user.address && user.address.length > 0) {
            let userAddress = user.address.find(a => a.default);
            if(userAddress) {
                checkout.addressID = userAddress.id;
                resData.defaultAddress = true;
            }
        }

        checkout
        .save()
        .then( c => {
            resData.checkoutID = c.id;
            resData.status = "success";
            res.json(resData);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    });
}

router.post('/checkout',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        defaultAddress: false,
        checkoutID: "",
        errorMessages: []
    }

    isLoggedIn(req,res,resData,(user) => {
        if(req.body.from === 'buy-now') {
            buyNowModel.findOne({userID: user.id})
            .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems address discounts coordinate userID leadTime processingCapacity version optionVersion name photos isDeleted for options numOfItemsPerOrder price parcelPrice parcelWeightInKg governmentCharge extraChargeApplicable extraCharge')
            .populate('shopID','discounts name photos processingCapacity active forceOpen openingHours midBreaks governmentCharge extraCharge version')
            .exec((err,buyNowItem) => {
                if(err || buyNowItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let errorMessage = checkItemAvailability(buyNowItem,buyNowItem.adID,buyNowItem.shopID,0,buyNowItem.quantity);
                if(!errorMessage && buyNowItem.adID.leadTime !== "Less than 10 minutes" && buyNowItem.adID.leadTime !== "10 minutes to 30 minutes" && buyNowItem.adID.leadTime !== "30 minutes to 1 hour") {
                    errorMessage = "This item is not available for Express Shipping";
                }
                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return res.json(resData)
                }

                prepareAndSaveCheckout(res,resData,[buyNowItem],user,req.body.from);
            });
        } else {
            cartModel.find({userID: user.id})
            .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems address discounts coordinate userID leadTime processingCapacity version optionVersion name photos isDeleted for options numOfItemsPerOrder price parcelPrice parcelWeightInKg governmentCharge extraChargeApplicable extraCharge')
            .populate('shopID','discounts name photos processingCapacity active forceOpen openingHours midBreaks governmentCharge extraCharge version')
            .exec((err,cart) => {
                if(err || cart === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let errorMessages = checkErrorItemsForCart(cart,true);

                if(errorMessages) {
                    resData.errorMessages = errorMessages;
                    return res.json(resData);
                }

                prepareAndSaveCheckout(res,resData,cart,user,req.body.from);
            });
        } 
    });
});

router.post('/user-address',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            addressName: "",
            location: "",
            address: ""
        },
        addressID: ""
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!user.address) user.address = [];

        var isValid = validateAddressInfo(req.body,user.address,resData.errorMessage);
        if(!isValid) {
            return res.json(resData);
        }

        const fetchLocation = require('../helper/fetchLocation');
        fetchLocation(req,(outsideBD) => {
            if(outsideBD) {
                resData.errorMessage.location = "Shipping is only available inside the area of Bangladesh";
                return res.json(resData);
            }
            if(req.body.save) {
                user.address.forEach(a => {a.default = false});

                user.address.push({
                    addressName: req.body.addressName,
                    coordinate: req.body.coordinate,
                    address: req.body.address,
                    location: req.body.location,
                    default: true
                })

                user
                .save()
                .then(user => {
                    let addressID = user.address[user.address.length - 1]._id;
                    checkoutModel.findOne({userID: user.id},(err,checkout) => {
                        if(err || !checkout) {
                            console.log(err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }
                        else {
                            checkout.userCoordinate = undefined;
                            checkout.address = undefined;
                            checkout.location = undefined;
                            checkout.addressID = addressID;

                            checkout
                            .save()
                            .then(checkout => {
                                resData.addressID = addressID;
                                resData.status = "success";
                                res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        }
                    });
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            }
            else {
                checkoutModel.findOne({userID: user.id},(err,checkout) => {
                    if(err || !checkout) {
                        console.log(err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    else {
                        checkout.userCoordinate = req.body.coordinate;
                        checkout.address = req.body.address;
                        checkout.location = req.body.location;
                        checkout.addressID = undefined;

                        checkout
                        .save()
                        .then(checkout => {
                            resData.status = "success";
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    }
                });
            }
        });
    });
});

router.post('/user-address-calculations',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        checkout:[],
        governmentCharge: 0,
        extraCharge: 0,
        shippingCharge: 0,
        extraStoppageCharge: 0,
        extraWaitingCharge: 0,
        extraWeightCharge: 0,
        extraDistanceCharge: 0,
        totalPrice: 0,
        subtotal: 0,
        distance: 0,
        name: "",
        cartItemNumber: "",
        deliveryTime: 0
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || !data) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.cartItemNumber = user.cartItemNumber;

            if(!validator.isValidObjectID(req.body.checkoutID)) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            checkoutModel.findById(req.body.checkoutID).exec((err,checkout) => {
                if(err || !checkout) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let adData = {};
                checkout.itemsArrangedByStoppages.forEach(point => {
                    point.items.forEach(item => {
                        item.errorCode = undefined;
                        let key = item.adID.toString();
                        if(!adData[key]) {
                            adData[key] = {quantity: item.quantity};
                        }
                        else {
                            adData[key].quantity += item.quantity;
                        }
                    })
                })

                let adIDs = Object.keys(adData);
                adModel.find({_id: { $in: adIDs}})
                .populate('shopID','discounts processingCapacity version active forceOpen openingHours midBreaks governmentCharge extraCharge')
                .exec((err,ads) => {
                    if(err || !ads || ads.length !== adIDs.length) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    ads.forEach(ad => {
                        let key = ad.id.toString();
                        adData[key].ad = ad;
                    })

                    checkout.itemsArrangedByStoppages.forEach(point => {
                        point.items.forEach(item => {
                            let key = item.adID.toString();
                            let ad = adData[key].ad;
                            item.checkoutErrorMessage = checkItemAvailability(item,ad,ad.shopID,0,adData[key].quantity);
                        })
                    })

                    checkAndUpdateStoppageData(checkout,adData);

                    let addressID = req.body.addressID;
                    let deleteAddressID = req.body.deleteAddressID;
                    let userCoordinate = checkout.userCoordinate;

                    resData.address = [];
                    user.address.forEach(a => {
                        resData.address.push({
                            _id: a._id,
                            coordinate: a.coordinate,
                            addressName: a.addressName,
                            address: a.address,
                            location: a.location,
                            default: a.default,
                            current: false
                        });
                    });

                    if(addressID) {
                        let userAddress = user.address.find(a => a._id.toString() === addressID.toString());
                        let addressIndex = resData.address.findIndex(a => a._id.toString() == addressID);

                        if(!userAddress) {
                            resData.errorMessage.locationError = "A valid Shipping Address is required";
                            return res.json(resData);
                        }
                        resData.address[addressIndex].current = true;
                        userCoordinate = userAddress.coordinate;
                        checkout.addressID = addressID;
                    }
                    else if(!addressID && deleteAddressID) {
                        if(!checkout.address || !checkout.location || !checkout.userCoordinate) {
                            resData.errorMessage.locationError = "A valid Shipping Address is required";
                            return res.json(resData);
                        }
                        else {
                            checkout.addressID = undefined;
                        }
                    }
                    else {
                        addressID = checkout.addressID;
                        if(addressID) {
                            let userAddress = user.address.find(a => a._id.toString() === addressID.toString());
                            if(!userAddress) {
                                resData.errorMessage.locationError = "A valid Shipping Address is required";
                                return res.json(resData);
                            }
                            userCoordinate = userAddress.coordinate;
                            checkout.addressID = addressID;
                            let addressIndex = resData.address.findIndex(a => a._id.toString() == addressID);
                            resData.address[addressIndex].current = true;
                        }
                        else {
                            if(!checkout.address || !checkout.location || !checkout.userCoordinate) {
                                resData.errorMessage.locationError = "A valid Shipping Address is required";
                                return res.json(resData);
                            }
                            else {
                                checkout.addressID = undefined;
                                resData.newUnsavedAddress = {
                                    coordinate: userCoordinate,
                                    address: checkout.address
                                }
                            }
                        }
                    }

                    calculateEstimatedDistance(checkout,userCoordinate, () => {
                        if(!checkout.distance) {
                            checkout.distance = undefined;
                            checkout.save()

                            resData.errorMessage.locationError = "No valid route was found. Please update your Shipping Address";
                            return res.json(resData);
                        }
                        checkout.extraStoppageCharge = calculateExtraStoppageCharge(checkout.itemsArrangedByStoppages);

                        let totalItemDiscount = 0;
                        let totalShippingDiscount = 0;
                        let totalDistance = checkout.itemsArrangedByStoppages[checkout.itemsArrangedByStoppages.length-1].userDistance;
                        let items = [];
                        let stoppages = [];
                        checkout.itemsArrangedByStoppages.forEach(point => {
                            let shopDiscounts = null;
                            let ad = adData[point.items[0].adID.toString()].ad;
                            if((point.type === "Shop")) {
                                shopDiscounts = ad.shopID.discounts;
                            }
                            let pointShippingClass = getShippingClass(point.userDistance,point.totalWeight);
                            let stoppageWaitingCharge = point.stoppageWaitingTime > 60 ? point.stoppageWaitingTime - 60: 0;
                            point.stoppageShippingCharge = stoppageWaitingCharge + calculateShippingCharge(checkout.totalWaitingTime)
                                + calculateExtraDistanceCharge(pointShippingClass,point.userDistance,point.totalWeight)
                                + calculateExtraWeightCharge(point.items,pointShippingClass,point.totalWeight);

                            calculateShippingDiscounts(point,shopDiscounts);
                            totalItemDiscount += point.itemDiscount;
                            totalShippingDiscount += point.shippingDiscount;
                            point.items.forEach(item => {
                                items.push(item);
                            });
                            totalDistance += point.distance;
                            if(totalDistance > 10) {
                                point.items.forEach(item => {
                                    item.checkoutErrorMessage = "Current distance exceeds the 10 km – kilometer limit";
                                    item.errorCode = 11;
                                });
                            }

                            stoppages.push({
                                stoppageName: point.name,
                                distance: point.distance
                            });
                        });
                        stoppages.push({
                            stoppageName: "Shipping Point",
                            distance: checkout.itemsArrangedByStoppages[checkout.itemsArrangedByStoppages.length - 1].userDistance
                        })
                        resData.stoppages = stoppages;
                        let Class = getShippingClass(checkout.distance,checkout.totalWeight);
                        checkout.extraDistanceCharge = calculateExtraDistanceCharge(Class,checkout.distance,checkout.totalWeight);
                        checkout.extraWeightCharge = calculateExtraWeightCharge(items,Class,checkout.totalWeight);
                        calculateFinalDiscount(checkout,totalItemDiscount,totalShippingDiscount);
                        let deliveryTime = (10 + checkout.totalWaitingTime + checkout.distance * 5) * 60;
                        checkout.deliveryTime = deliveryTime > 1800 ? deliveryTime : 1800;

                        checkout
                        .save()
                        .then(checkout => {
                            checkout.itemsArrangedByStoppages.forEach(point => {
                                point.items.forEach(item => {
                                resData.checkout.push({
                                        id: item.id,
                                        adID: item.adID,
                                        adName: item.name,
                                        options: item.options,
                                        quantity: item.quantity,
                                        price: item.netPrice,
                                        photo: item.photo,
                                        checkoutErrorMessage: item.checkoutErrorMessage
                                    });
                                });
                            })

                            resData.subtotal = checkout.subtotal + checkout.totalGovernmentCharge + checkout.totalExtraCharge;
                            resData.distance = checkout.distance;
                            resData.deliveryTime = checkout.deliveryTime;
                            resData.shippingCharge = checkout.shippingCharge;
                            resData.extraStoppageCharge = checkout.extraStoppageCharge;
                            resData.extraWeightCharge = checkout.extraWeightCharge;
                            resData.extraDistanceCharge = checkout.extraDistanceCharge;
                            resData.extraWaitingCharge = checkout.totalWaitingTime > 60 ? checkout.totalWaitingTime - 60: 0;
                            resData.discount = checkout.calculationsForUser.discount;
                            resData.totalPrice = checkout.total;

                            resData.status = "success";
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    });
                });
            });
        });
    }); 
});

router.post('/place-order',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        cartItemNumber: "",
        errorMessages: []
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.checkoutID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        checkoutModel.findById(req.body.checkoutID)
        .exec((err,checkout) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!checkout || checkout.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied"
                return res.json(resData);
            }
            if(!checkout.distance || (!checkout.addressID && (checkout.address == undefined || checkout.location == undefined || checkout.userCoordinate == undefined))) {
                resData.errorMessage.locationError = "A valid Shipping Address is required";
                return res.json(resData);
            }

            let adData = {};
            checkout.itemsArrangedByStoppages.forEach(point => {
                point.items.forEach(item => {
                    let key = item.adID.toString();
                    if(!adData[key]) {
                        adData[key] = {quantity: item.quantity};
                    }
                    else {
                        adData[key].quantity += item.quantity;
                    }
                })
            })

            let adIDs = Object.keys(adData);
            adModel.find({_id: { $in: adIDs}})
            .populate('shopID','discounts processingCapacity version active forceOpen openingHours midBreaks governmentCharge extraCharge')
            .exec((err,ads) => {
                if(err || !ads || ads.length !== adIDs.length) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                ads.forEach(ad => {
                    let key = ad.id.toString();
                    adData[key].ad = ad;
                })

                let errorMessages = checkErrorItemsForCheckout(checkout.itemsArrangedByStoppages,adData);

                if(errorMessages) {
                    resData.errorMessages = errorMessages;
                    return res.json(resData);
                }

                checkAndUpdateStoppageData(checkout,adData);

                if(checkout.total > constants.MAX_FRACTION_VALUE) {
                    resData.errorMessage.fatalError = "Order of such big amount cannot be placed";
                    return res.json(resData);
                }

                let userCoordinate = {};

                if(checkout.addressID) {
                    let userAddress = user.address.find(a => a._id.toString() === checkout.addressID.toString());
                    if(!userAddress) {
                        resData.errorMessage.locationError = "A valid Shipping Address is required";
                        return res.json(resData);
                    }
                    userCoordinate = userAddress.coordinate;
                    checkout.location = userAddress.location;
                    checkout.address = userAddress.address;
                }

                let orderData = {
                    userID: checkout.userID,
                    userPhoto: user.photo,
                    shippingLocation: {
                        coordinate: checkout.addressID ? userCoordinate : checkout.userCoordinate,
                        address: checkout.address,
                        location: checkout.location,
                        distance: checkout.itemsArrangedByStoppages[checkout.itemsArrangedByStoppages.length-1].userDistance,
                        userName: user.name,
                        photo: user.photo,
                        contactNo: user.countryCode + user.phoneNumber,
                        rating: user.avgRating,
                        numOfRatings: user.numberOfRatings
                    },
                    numberOfCompletedOrders: user.numberOfCompletedOrders,
                    itemsArrangedByStoppages: checkout.itemsArrangedByStoppages,
                    shippingCharge: checkout.shippingCharge,
                    distance: checkout.distance,
                    extraStoppageCharge: checkout.extraStoppageCharge,
                    totalWaitingTime: checkout.totalWaitingTime,
                    extraDistanceCharge: checkout.extraDistanceCharge,
                    extraWeightCharge: checkout.extraWeightCharge,
                    totalWeight: checkout.totalWeight,
                    subtotal: checkout.subtotal,
                    totalGovernmentCharge: checkout.totalGovernmentCharge,
                    totalExtraCharge: checkout.totalExtraCharge,
                    total: checkout.total,
                    deliveryTime: checkout.deliveryTime,
                    grossTotal: checkout.subtotal + checkout.totalGovernmentCharge + checkout.totalExtraCharge,
                    calculationsForUser: checkout.calculationsForUser,
                    calculationsForDeliveryPerson: checkout.calculationsForDeliveryPerson,
                    stateRecord: [
                        {//0
                            state: "Order Placed",
                            time: Date.now()
                        },
                        {//1
                            state: "Request Assigned"
                        },
                        {//2
                            state: "Waiting for Response"
                        },
                        {//3
                            state: "Waiting for Decision"
                        },
                        {//4
                            state: "Accepted"
                        },
                        {//5
                            state: "Shopping Started"
                        },
                        {//6
                            state: "Shopping Ended"
                        },
                        {//7
                            state: "Out for Delivery"
                        },
                        {//8
                            state: "Delivery Completion Request"
                        },
                        {//9
                            state: "Delivery Completed"
                        },
                        {//10
                            state: "No Delivery Person Found"
                        },
                        {//11
                            state: "Delivery Canceled"
                        },
                        {//12
                            state: "Order Canceled"
                        }
                    ]
                };

                const orderModel = require('../models/orderModel');
                new orderModel(orderData)
                .save()
                .then(order => {
                    if(checkout.addressID) {
                        let modified = false;
                        user.address.forEach(address => {
                            if(address._id.toString() == checkout.addressID.toString()) {
                                address.default = true;
                                modified = true;
                            }
                            else {
                                address.default = false;
                            }
                        })

                        if(modified) user.save();
                    }

                    if(checkout.from === "buy-now") {
                        checkout.remove();
                        cartItemNumber = user.cartItemNumber;
                        let item = checkout.itemsArrangedByStoppages[0].items[0];

                        adModel.findById(item.adID,(err,ad) => {
                            if(err) {
                                console.log(err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            }
                            else if(ad) {
                                ad.numOfItems -= item.quantity;
                                if(ad.numOfItems < 0) ad.numOfItems =  0;
                                ad.save()
                                .then(ad => {
                                    resData.status = "success";
                                    res.json(resData);
                                })
                                .catch(err => {
                                    console.log("ERROR: "+err);
                                    resData.errorMessage.fatalError = "Something went wrong!!";
                                    return res.json(resData);
                                });
                            }
                            else {
                                resData.status = "success";
                                res.json(resData);
                            }
                        })
                    }
                    else {
                        const adjustItemQuantityOnOrderPlaced = require('../helper/adjustItemQuantityOnOrderPlaced');
                        adjustItemQuantityOnOrderPlaced(checkout,user,res,resData);
                    }
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/remove-from-wishlist',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const wishListModel = require('../models/wishListModel');
        wishListModel.findOneAndRemove({userID: user.id, adID: req.body.adID},(err) => {
            if(err) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            sendWishListItems(res,resData,user._id);
        });
    });
});

router.post('/add-quantity-in-cart',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        cartItemNumber: "",
        cart:[],
        totalWeight: 0,
        netPayable: 0
    }
    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.ID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;

        cartModel.findById(req.body.ID)
        .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems price parcelPrice parcelWeightInKg governmentCharge extraChargeApplicable extraCharge version optionVersion name isDeleted for options numOfItemsPerOrder')
        .populate('shopID','active forceOpen openingHours midBreaks governmentCharge extraCharge version')
        .exec((err,cartItem) => {
            if(err || cartItem === null) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            cartModel.aggregate().match({adID: cartItem.adID._id}).group({_id: null, quantityExist: {$sum : '$quantity'}})
            .exec((err,result) => {
                if(err || !result || result.length < 1) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                req.body.quantity = parseInt(req.body.quantity);

                let errorMessage = checkItemAvailability(cartItem,cartItem.adID,cartItem.shopID,result[0].quantityExist,req.body.quantity);

                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return sendCartItems(res,{userID: user.id},resData);
                }

                cartItem.quantity += req.body.quantity;
                cartItem.time = new Date();

                let shopUpdated = cartItem.shopID && cartItem.shopVersion !== cartItem.shopID.version;
                if(shopUpdated) {
                    cartItem.shopVersion = cartItem.shopID.version
                }
                checkItemPriceUpdate(cartItem,cartItem.adID,cartItem.shopID,shopUpdated,true);

                cartItem
                .save()
                .then(cartItem => {
                    user.cartItemNumber += req.body.quantity;
                    user
                    .save()
                    .then( user => {
                        resData.status = "success";
                        resData.cartItemNumber = user.cartItemNumber;
                        sendCartItems(res,{userID: user.id},resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/subtract-quantity-from-cart',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        cartItemNumber: "",
        cart:[],
        totalWeight: 0,
        netPayable: 0
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.ID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;
        else
            req.body.quantity = parseInt(req.body.quantity);

        cartModel.findById(req.body.ID)
        .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems price parcelPrice parcelWeightInKg governmentCharge extraChargeApplicable extraCharge version optionVersion name isDeleted for options numOfItemsPerOrder')
        .populate('shopID','active forceOpen openingHours midBreaks governmentCharge extraCharge version')
        .exec((err,cartItem) => {
            if(err || cartItem === null) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            let errorMessage = checkItemAvailability(cartItem,cartItem.adID,cartItem.shopID);

            if(errorMessage) {
                resData.errorMessage.fatalError = errorMessage;
                return sendCartItems(res,{userID: user.id},resData);
            }

            if(cartItem.quantity < req.body.quantity)
                req.body.quantity = cartItem.quantity;

            user.cartItemNumber -= req.body.quantity;
            if(user.cartItemNumber < 0) user.cartItemNumber = 0;

            cartItem.quantity -= req.body.quantity;

            user
            .save()
            .then( user => {
                resData.cartItemNumber = user.cartItemNumber;
                if(cartItem.quantity > 0) {
                    cartItem.time = new Date();

                    let shopUpdated = cartItem.shopID && cartItem.shopVersion !== cartItem.shopID.version;
                    if(shopUpdated) {
                        cartItem.shopVersion = cartItem.shopID.version
                    }
                    checkItemPriceUpdate(cartItem,cartItem.adID,cartItem.shopID,shopUpdated,true);

                    cartItem
                    .save()
                    .then(cartItem => {
                        resData.status = "success";
                        sendCartItems(res,{userID: user.id},resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                } else {
                    cartItem
                    .remove()
                    .then(cartItem => {
                        resData.status = "success";
                        sendCartItems(res,{userID: user.id},resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                }
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/remove-from-cart',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        cart: [],
        cartItemNumber: "",
        totalWeight: 0,
        netPayable: 0
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.ID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        cartModel.findById(req.body.ID,(err,cartItem) => {
            if(err || cartItem === null) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            user.cartItemNumber -= cartItem.quantity;
            if(user.cartItemNumber < 0) user.cartItemNumber = 0;

            user
            .save()
            .then(user => {
                resData.cartItemNumber = user.cartItemNumber;
                cartItem
                .remove()
                .then(cartItem => {
                    resData.status = "success";
                    sendCartItems(res,{userID: user.id},resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/add-quantity-in-buy-now',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        categories: [],
        adName: "",
        shopID: "",
        shopName: "",
        basePrice: "",
        options: [],
        unitPrice: "",
        quantity: "",
        totalPrice: 0,
        governmentChargeDescription: "",
        extraChargeDescription: "",
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;

        storedInDatabaseModel.findOne({},(err,data) => {
            if(err || data === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.categories = data.categories;
            buyNowModel.findOne({adID:req.body.adID,userID:user.id})
            .populate('adID')
            .populate('shopID','name active forceOpen openingHours midBreaks version governmentCharge governmentChargeDescription extraCharge extraChargeDescription')
            .exec((err,buyNowItem) => {
                if(err || buyNowItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                req.body.quantity = parseInt(req.body.quantity);
                let errorMessage = checkItemAvailability(buyNowItem,buyNowItem.adID,buyNowItem.shopID,buyNowItem.quantity,req.body.quantity);

                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return sendBuyNowItem(res,buyNowItem,resData);
                }

                buyNowItem.quantity += req.body.quantity;

                let shopUpdated = buyNowItem.shopID && buyNowItem.shopVersion !== buyNowItem.shopID.version;
                if(shopUpdated) {
                    buyNowItem.shopVersion = buyNowItem.shopID.version
                }
                checkItemPriceUpdate(buyNowItem,buyNowItem.adID,buyNowItem.shopID,shopUpdated,true);

                buyNowItem
                .save()
                .then(buyNowItem => {
                    resData.status = "success";
                    sendBuyNowItem(res,buyNowItem,resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/subtract-quantity-from-buy-now',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        categories: [],
        adName: "",
        shopID: "",
        shopName: "",
        basePrice: "",
        options: [],
        unitPrice: "",
        quantity: "",
        totalPrice: 0,
        governmentChargeDescription: "",
        extraChargeDescription: "",
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;
        else
            req.body.quantity = parseInt(req.body.quantity);

        storedInDatabaseModel.findOne({},(err,data) => {
            if(err || data === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.categories = data.categories;
            buyNowModel.findOne({adID:req.body.adID,userID:user.id})
            .populate('adID')
            .populate('shopID','name active forceOpen openingHours midBreaks version governmentCharge governmentChargeDescription extraCharge extraChargeDescription')
            .exec((err,buyNowItem) => {
                if(err || buyNowItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                let errorMessage = checkItemAvailability(buyNowItem,buyNowItem.adID,buyNowItem.shopID);

                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return sendBuyNowItem(res,buyNowItem,resData);
                }

                if(req.body.quantity < buyNowItem.quantity) {
                    buyNowItem.quantity -= req.body.quantity;

                    let shopUpdated = buyNowItem.shopID && buyNowItem.shopVersion !== buyNowItem.shopID.version;
                    if(shopUpdated) {
                        buyNowItem.shopVersion = buyNowItem.shopID.version
                    }
                    checkItemPriceUpdate(buyNowItem,buyNowItem.adID,buyNowItem.shopID,shopUpdated,true);

                    buyNowItem
                    .save()
                    .then(buyNowItem => {
                        resData.status = "success";
                        sendBuyNowItem(res,buyNowItem,resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                } else {
                    buyNowItem
                    .remove()
                    .then(buyNowItem => {
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                }
            });
        });
    });
});

router.post('/edit-user-address',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            addressName: "",
            location: "",
            address: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!user.address) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        req.body.save = false;
        let isValid = validateAddressInfo(req.body,user.address,resData.errorMessage);

        if(!isValid) {
            return res.json(resData);
        }

        const fetchLocation = require('../helper/fetchLocation');
        fetchLocation(req,(outsideBD) => {
            if(outsideBD) {
                resData.errorMessage.location = "Shipping is only available inside the area of Bangladesh";
                return res.json(resData);
            }

            if(req.body.addressID) {
                let userAddress = user.address.find(a => a._id.toString() === req.body.addressID);
                if(!userAddress) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let addressName = req.body.addressName;
                if(addressName) {
                    if(addressName.length > 100) {
                        resData.errorMessage.addressName = 'Address name can have maximum 100 characters';
                        return res.json(resData);
                    }
                    if(user.address.find(a => a !== userAddress && a.addressName === addressName)) {
                        resData.errorMessage.addressName =  `${addressName} has already been used. Try something different.`;
                        return res.json(resData);
                    }

                    userAddress.addressName = addressName;
                }

                user.address.forEach(a => {a.default = false});

                userAddress.coordinate = req.body.coordinate;
                userAddress.address = req.body.address;
                userAddress.location = req.body.location;
                userAddress.default = true;

                user
                .save()
                .then(user => {
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            }
            else if(req.body.checkoutID) {
                if(!validator.isValidObjectID(req.body.checkoutID)) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                checkoutModel.findById(req.body.checkoutID).exec((err,checkout) => {
                    if(err || !checkout) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    checkout.userCoordinate = req.body.coordinate;
                    checkout.address = req.body.address;
                    checkout.location = req.body.location;
                    checkout.addressID = undefined;

                    checkout
                    .save()
                    .then(checkout => {
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                });
            }
            else {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
        });
    });
});

router.post('/delete-user-address',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        hasOtherAddress: true
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!user.address) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        checkoutModel.findOne({userID: user.id},(err,checkout) => {
            if(err || !checkout) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            let saveUser = false;
            if(req.body.addressID) {
                let addressIndex = user.address.findIndex(a => a._id.toString() === req.body.addressID);
                if(addressIndex == -1) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let needToSetDefault = user.address[addressIndex].default == true;
                user.address.splice(addressIndex,1);
                if(needToSetDefault && user.address.length > 0)
                    user.address[0].default = true;

                if(checkout.addressID) {
                    checkout.addressID = undefined;
                }
                if(checkout.address == undefined || checkout.location == undefined || checkout.userCoordinate == undefined) {
                    let defaultAddress = user.address.find(a => a.default);
                    if(defaultAddress) {
                        checkout.addressID = defaultAddress.id;
                    }
                    else if(user.address.length > 0) {
                        resData.errorMessage.locationError = "A valid Shipping Address is required";
                        return res.json(resData);
                    }
                }
                else {
                    resData.newUnsavedAddress = {
                        coordinate: checkout.userCoordinate,
                        address: checkout.address
                    }
                }

                saveUser = true;
            }
            else {
                checkout.userCoordinate = undefined;
                checkout.address = undefined;
                checkout.location = undefined;

                let defaultAddress = user.address.find(a => a.default);
                if(defaultAddress) {
                    checkout.addressID = defaultAddress.id;
                }
                else if(user.address.length > 0) {
                    resData.errorMessage.fatalError = "A valid Shipping Address is required";
                    return res.json(resData);
                }
            }

            checkout
            .save()
            .then(checkout => {
                if(saveUser) {
                    user
                    .save()
                    .then(user => {
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                }
                else {
                    resData.status = "success";
                    res.json(resData);
                }
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

module.exports = router;