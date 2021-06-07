const express = require('express');
const router = express.Router();
const constants = require('../helper/myConstants');
const isLoggedIn = require('../helper/isLoggedIn');
const adModel = require('../models/adModel');
const sortOptions = require('../helper/sortOptions');
const preOrderCartModel = require('../models/preOrderCartModel');
const prepareItemOptions = require('../helper/prepareItemOptions');
const preOrderCheck = require('../helper/preOrderCheck');
const sendPreOrderItem = require('../helper/sendBuyNowItem');
const checkItemPriceUpdate = require('../helper/checkItemPriceUpdate');
const groupAdsByStoppage = require('../helper/groupAdsByStoppage');
const calculateItemDiscounts = require('../helper/calculateItemDiscounts');
const calculateShippingCharge = require('../helper/calculateShippingCharge');
const PreOrderCheckoutModel = require('../models/PreOrderCheckoutModel');
const checkAndUpdateStoppageData = require('../helper/checkAndUpdateStoppageData');
const calculateEstimatedDistance = require('../helper/calculateEstimatedDistance');
const calculateExtraDistanceCharge = require('../helper/calculateExtraDistanceCharge');
const calculateExtraWeightCharge = require('../helper/calculateExtraWeightCharge');
const calculateShippingDiscounts = require('../helper/calculateShippingDiscounts');
const calculateFinalDiscount = require('../helper/calculateFinalDiscount');
const getShippingClass = require('../helper/getShippingClass');
const preOrderModel = require('../models/preOrderModel');

router.post('/add-to-cart',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Item is not available!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;

        preOrderCartModel.findOne({userID: user.id},(err,cart) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            sortOptions(req.body.options);

            adModel.findById(req.body.adID).populate('shopID','active forceOpen openingHours midBreaks version extraCharge governmentCharge preOrderPermission preOrder').exec((err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                req.body.quantity = parseInt(req.body.quantity);
                let cartItem = {
                    shopID: ad.shopID,
                    options: req.body.options,
                    quantity: req.body.quantity
                };
                
                if(!preOrderCheck(ad,ad.shopID)) {
                    resData.errorMessage.fatalError = "Pre order is not available";
                    return res.json(resData);
                }

                if(prepareItemOptions(cartItem,ad.options)) {
                    resData.errorMessage.fatalError =  "Pre order with the options selected is not available";
                    return res.json(resData);
                }

                if(cart === null) {
                    cart = new preOrderCartModel({
                        userID: user.id
                    });
                }

                if(ad.shopID) {
                    cart.shopVersion = ad.shopID.version;
                    ad.governmentCharge = ad.shopID.governmentCharge;
                    ad.extraCharge = ad.extraChargeApplicable ? ad.shopID.extraCharge : 0;
                }
                cart.adID = ad.id;
                cart.adVersion = ad.version;
                cart.shopID = ad.shopID;
                cart.options = cartItem.options,
                cart.quantity = cartItem.quantity,
                cart.optionPrice = cartItem.optionPrice,
                cart.optionWeight = cartItem.optionWeight,
                cart.basePrice = ad.price + ad.parcelPrice
                cart.unitPrice = cart.basePrice + cart.optionPrice;

                cart.totalPrice = cart.unitPrice * cart.quantity;
                cart.governmentCharge = Math.round(cart.totalPrice * ad.governmentCharge)/100;
                cart.extraCharge = Math.round(cart.totalPrice * ad.extraCharge)/100;
                cart.netPrice = Math.round((cart.totalPrice + cart.governmentCharge + cart.extraCharge)*100)/100;
                cart.weight = Math.round((ad.parcelWeightInKg + cart.optionWeight) * cart.quantity * 100)/100;

                cart
                .save()
                .then( cartItem => {
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

router.post('/add-quantity',(req,res) => {
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
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;

        const storedInDatabaseModel = require('../models/storedInDatabaseModel');
        storedInDatabaseModel.findOne({},(err,data) => {
            if(err || data === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.categories = data.categories;
            preOrderCartModel.findOne({adID:req.body.adID,userID:user.id})
            .populate('adID')
            .populate('shopID','name active forceOpen openingHours midBreaks version governmentCharge governmentChargeDescription extraCharge extraChargeDescription preOrderPermission preOrder')
            .exec((err,cartItem) => {
                if(err || cartItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                req.body.quantity = parseInt(req.body.quantity);

                if(!preOrderCheck(cartItem.adID,cartItem.shopID)) {
                    resData.errorMessage.fatalError = "Pre order is not available";
                    return sendPreOrderItem(res,cartItem,resData);
                }
                else if(cartItem.options && (!cartItem.adVersion || cartItem.adVersion < ad.optionVersion)) {
                    if(prepareItemOptions(cartItem,cartItem.adID.options)) {
                        resData.errorMessage.fatalError = "Item with the options selected is not available";
                        return sendPreOrderItem(res,cartItem,resData);
                    }
                }

                cartItem.quantity += req.body.quantity;

                let shopUpdated = cartItem.shopID && cartItem.shopVersion !== cartItem.shopID.version;
                if(shopUpdated) {
                    cartItem.shopVersion = cartItem.shopID.version
                }
                checkItemPriceUpdate(cartItem,cartItem.adID,cartItem.shopID,shopUpdated,true);

                cartItem
                .save()
                .then(cartItem => {
                    resData.status = "success";
                    sendPreOrderItem(res,cartItem,resData);
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

router.post('/subtract-quantity',(req,res) => {
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
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        if(!validator.isPositiveNumber(req.body.quantity))
            req.body.quantity = 1;
        else
            req.body.quantity = parseInt(req.body.quantity);

        const storedInDatabaseModel = require('../models/storedInDatabaseModel');
        storedInDatabaseModel.findOne({},(err,data) => {
            if(err || data === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.categories = data.categories;
            preOrderCartModel.findOne({adID:req.body.adID,userID:user.id})
            .populate('adID')
            .populate('shopID','name active forceOpen openingHours midBreaks version governmentCharge governmentChargeDescription extraCharge extraChargeDescription preOrderPermission preOrder')
            .exec((err,cartItem) => {
                if(err || cartItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!preOrderCheck(cartItem.adID,cartItem.shopID)) {
                    resData.errorMessage.fatalError = "Pre order is not available";
                    return sendPreOrderItem(res,cartItem,resData);
                }
                else if(cartItem.options && (!cartItem.adVersion || cartItem.adVersion < ad.optionVersion)) {
                    if(prepareItemOptions(cartItem,cartItem.adID.options)) {
                        resData.errorMessage.fatalError = "Item with the options selected is not available";
                        return sendPreOrderItem(res,cartItem,resData);
                    }
                }

                if(req.body.quantity < cartItem.quantity) {
                    cartItem.quantity -= req.body.quantity;

                    let shopUpdated = cartItem.shopID && cartItem.shopVersion !== cartItem.shopID.version;
                    if(shopUpdated) {
                        cartItem.shopVersion = cartItem.shopID.version
                    }
                    checkItemPriceUpdate(cartItem,cartItem.adID,cartItem.shopID,shopUpdated,true);

                    cartItem
                    .save()
                    .then(cartItem => {
                        resData.status = "success";
                        sendPreOrderItem(res,cartItem,resData);
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

router.post('/checkout',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        checkoutID: "",
        errorMessages: []
    }

    isLoggedIn(req,res,resData,(user) => {
        preOrderCartModel.findOne({userID: user.id})
        .populate('adID','available availableHours midBreaks sameAsShopOpeningHours parcel numOfItems address discounts coordinate userID leadTime processingCapacity version optionVersion name photos isDeleted for options numOfItemsPerOrder price parcelPrice parcelWeightInKg governmentCharge extraChargeApplicable extraCharge preOrder')
        .populate('shopID','discounts name photos processingCapacity active forceOpen openingHours midBreaks governmentCharge extraCharge version preOrderPermission preOrder')
        .exec((err,cartItem) => {
            if(err || !cartItem) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!preOrderCheck(cartItem.adID,cartItem.shopID)) {
                resData.errorMessage.fatalError = "Pre order is not available";
                return res.json(resData);
            }
            else if(cartItem.options && (!cartItem.adVersion || cartItem.adVersion < ad.optionVersion)) {
                if(prepareItemOptions(cartItem,cartItem.adID.options)) {
                    resData.errorMessage.fatalError = "Item with the options selected is not available";
                    return res.json(resData);
                }
            }
            else if(cartItem.adID.leadTime !== "Less than 10 minutes" && cartItem.adID.leadTime !== "10 minutes to 30 minutes" && cartItem.adID.leadTime !== "30 minutes to 1 hour") {
                resData.errorMessage.fatalError = "This item is not available for Express Shipping";
                return res.json(resData)
            }

            let shopUpdated = cartItem.shopID && cartItem.shopVersion !== cartItem.shopID.version;
            if(shopUpdated) {
                cartItem.shopVersion = cartItem.shopID.version
            }
            checkItemPriceUpdate(cartItem,cartItem.adID,cartItem.shopID,shopUpdated,true);

            PreOrderCheckoutModel.findOne({userID: user.id},(err,checkout) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                else if(!checkout) {
                    checkout = new PreOrderCheckoutModel({userID: user.id});
                } else {
                    checkout.distance = 0;
                    checkout.location = undefined;
                    checkout.userCoordinate = undefined;
                }

                checkout.itemsArrangedByStoppages = groupAdsByStoppage([cartItem]);

                let point = checkout.itemsArrangedByStoppages[0];
                checkout.subtotal = point.subtotal;
                checkout.totalGovernmentCharge = point.governmentCharge;
                checkout.totalExtraCharge = point.extraCharge;
                checkout.total = point.total;
                checkout.totalWeight = point.totalWeight;

                let shopDiscounts = cartItem.shopID ? cartItem.shopID.discounts : null;
                let adData = {[cartItem.adID.id.toString()] : {quantity: cartItem.quantity, ad: cartItem.adID}};
                calculateItemDiscounts(point,adData,shopDiscounts);

                if(checkout.total > constants.MAX_FRACTION_VALUE) {
                    resData.errorMessage.fatalError = "Order of such big amount cannot be placed";
                    return res.json(resData);
                }

                checkout.shippingCharge = calculateShippingCharge(checkout.total - point.itemDiscount);

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
        });
    });
});

router.post('/user-address',(req,res) => {
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
        extraWeightCharge: 0,
        extraDistanceCharge: 0,
        totalPrice: 0,
        subtotal: 0,
        distance: 0,
        name: "",
        cartItemNumber: "",
        deliveryTime: 0
    }

    if(!req.body.userCoordinate || !req.body.checkoutID) {
        resData.errorMessage.fatalError = "Invalid request!!";
        return res.json(resData);
    }
    const storedInDatabaseModel = require('../models/storedInDatabaseModel');
    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        const validator = require('../helper/validationHelper');
        let error = false;
        if(!req.body.userCoordinate || !validator.isValidLattitude(req.body.userCoordinate.lat) || !validator.isValidLongitude(req.body.userCoordinate.long)) {
            error = true;
            resData.errorMessage.locationError = 'A valid Shipping Location is required';
        }
        if(error)
            return res.json(resData);

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.cartItemNumber = user.cartItemNumber;

            if(!validator.isValidObjectID(req.body.checkoutID)) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            PreOrderCheckoutModel.findOne({userID: user.id},(err,checkout) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                else if(!checkout) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let point = checkout.itemsArrangedByStoppages[0];
                let item = point.items[0];
               
                adModel.findById(item.adID)
                .populate('shopID','discounts processingCapacity version active forceOpen openingHours midBreaks governmentCharge extraCharge preOrderPermission preOrder')
                .exec((err,ad) => {
                    if(err || !ad) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    if(!preOrderCheck(ad,ad.shopID)) {
                        item.checkoutErrorMessage = "Pre order is not available";
                    }
                    else if(item.options && (!item.adVersion || item.adVersion < ad.optionVersion)) {
                        if(prepareItemOptions(item,ad.options)) {
                            item.checkoutErrorMessage = "Item with the options selected is not available";
                        }
                    }

                    let adData = {[ad.id.toString()] : {quantity: item.quantity, ad: ad}};
                    checkAndUpdateStoppageData(checkout,adData,true);

                    req.body.coordinate = req.body.userCoordinate;
                    const fetchLocation = require('../helper/fetchLocation');
                    fetchLocation(req,(outsideBD) => {
                        if(outsideBD) {
                            resData.errorMessage.locationError = "Shipping is only available inside the area of Bangladesh";
                            return res.json(resData);
                        }
                        checkout.userCoordinate = req.body.userCoordinate;
                        checkout.location = req.body.location;

                        calculateEstimatedDistance(checkout,checkout.userCoordinate, () => {
                            if(!checkout.distance) {
                                checkout.distance = undefined;
                                checkout.save()
    
                                resData.errorMessage.locationError = "No valid route was found. Please update your Shipping Address";
                                return res.json(resData);
                            }
                            
                            checkout.extraStoppageCharge = 0;

                            let totalDistance = point.userDistance;

                            let pointShippingClass = getShippingClass(point.userDistance,point.totalWeight);
                            checkout.extraDistanceCharge = calculateExtraDistanceCharge(pointShippingClass,point.userDistance,point.totalWeight);
                            checkout.extraWeightCharge = calculateExtraWeightCharge(point.items,pointShippingClass,point.totalWeight);

                            point.stoppageShippingCharge = checkout.shippingCharge + checkout.extraDistanceCharge + checkout.extraWeightCharge;

                            let shopDiscounts = point.type === "Shop" ? ad.shopID.discounts : null;
                            calculateShippingDiscounts(point,shopDiscounts);

                            if(totalDistance > 10) {
                                item.checkoutErrorMessage = "Current distance exceeds the 10 km – kilometer limit";
                                item.errorCode = 11;
                            }
    
                            calculateFinalDiscount(checkout,point.itemDiscount,point.shippingDiscount);
                            let deliveryTime = (10 + checkout.distance * 5) * 60;
                            checkout.deliveryTime = deliveryTime > 1800 ? deliveryTime : 1800;

                            checkout
                            .save()
                            .then( checkout => {
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

                                resData.subtotal = checkout.subtotal + checkout.totalGovernmentCharge + checkout.totalExtraCharge;
                                resData.distance = checkout.distance;
                                resData.deliveryTime = checkout.deliveryTime;
                                resData.shippingCharge = checkout.shippingCharge;
                                resData.extraStoppageCharge = checkout.extraStoppageCharge;
                                resData.extraWeightCharge = checkout.extraWeightCharge;
                                resData.extraDistanceCharge = checkout.extraDistanceCharge;
                                resData.extraWaitingCharge = 0;
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
                })
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
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.checkoutID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        PreOrderCheckoutModel.findById(req.body.checkoutID,(err,checkout) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!checkout || checkout.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied"
                return res.json(resData);
            }
            if(!checkout.distance || checkout.location == undefined || checkout.userCoordinate == undefined) {
                resData.errorMessage.fatalError = "Update user location first";
                return res.json(resData);
            }

            if(!validator.isValidString(req.body.address,5)) {
                resData.errorMessage.address = 'Shipping address must be at least 5 characters';
                return res.json(resData);
            }


            let point = checkout.itemsArrangedByStoppages[0];
            let item = point.items[0];
           
            adModel.findById(item.adID)
            .populate('shopID','discounts processingCapacity version active forceOpen openingHours midBreaks governmentCharge extraCharge preOrderPermission preOrder')
            .exec((err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let errorMessage = "";
                if(!ad || !preOrderCheck(ad,ad.shopID)) {
                    errorMessage = "Pre order is not available";
                }
                else if(item.options && (!item.adVersion || item.adVersion < ad.optionVersion)) {
                    if(prepareItemOptions(item,ad.options)) {
                        errorMessage = "Item with the options selected is not available";
                    }
                }

                if(errorMessage) {
                    resData.errorMessage.fatalError = errorMessage;
                    return res.json(resData);
                }

                let adData = {[ad.id.toString()] : {quantity: item.quantity, ad: ad}};
                checkAndUpdateStoppageData(checkout,adData,true);

                if(checkout.total > constants.MAX_FRACTION_VALUE) {
                    resData.errorMessage.fatalError = "Order of such big amount cannot be placed";
                    return res.json(resData);
                }

                let orderData = {
                    userID: checkout.userID,
                    userPhoto: user.photo,
                    shippingLocation: {
                        coordinate: checkout.userCoordinate,
                        address: req.body.address.substring(0,2000),
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
                        },
                        {//13
                            state: "Seller Rejected"
                        },
                        {//14
                            state: "Order Canceled by the Seller"
                        },
                        {//15
                            state: "Seller Accepted"
                        },
                        {//16
                            state: "Seller Initiated"
                        },
                        {//17
                            state: "User Initiated"
                        }
                    ]
                };

                new preOrderModel(orderData)
                .save()
                .then(order => {
                    checkout.remove();
                    cartItemNumber = user.cartItemNumber;
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

module.exports = router;