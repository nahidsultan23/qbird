const express = require('express');
const router = express.Router();
const constants = require("../helper/myConstants");
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const rateOrder = require('../helper/rateOrder');
const restoreQuantityOnOrderCancel = require('../helper/restoreQuantityOnOrderCancel');

router.post('/details',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        items:[],
        name: "",
        cartItemNumber: ""
    }

    const storedInDatabaseModel = require('../models/storedInDatabaseModel');
    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        const isLoggedIn = require('../helper/isLoggedIn');
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            const validator = require('../helper/validationHelper');
            if(!validator.isValidObjectID(req.body.orderID)) {
                resData.errorMessage.contentUnavailable = "Order was not found !!";
                return res.json(resData);
            }

            orderModel.findById(req.body.orderID)
            .populate('deliveryPersonID','photo deliveryPersonInfo.avgRating deliveryPersonInfo.numberOfRatings deliveryPersonInfo.completedDeliveries')
            .exec((err,order) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!order || user.id.toString() !== order.userID.toString()) {
                    resData.errorMessage.contentUnavailable = "Order was not found !!";
                    return res.json(resData);
                }

                if(order.currentState > constants.WAITING_FOR_DECISION) {
                    if(order.currentState < constants.DELIVERY_COMPLETED)
                        resData.deliveryPersonPhoneNumber = order.deliveryPersonPhoneNumber;

                    if(order.deliveryPersonID && order.deliveryPersonID.deliveryPersonInfo) {
                        resData.deliveryPersonID = order.deliveryPersonID.id;
                        resData.deliveryPersonPhoto = order.deliveryPersonPhoto;
                        resData.deliveryPersonName = order.deliveryPersonName;
                        resData.avgRating = order.deliveryPersonID.deliveryPersonInfo.avgRating;
                        resData.numberOfRatings = order.deliveryPersonID.deliveryPersonInfo.numberOfRatings;
                        resData.numberOfCompletedDeliveries = order.numberOfCompletedDeliveries;
                    }
                }

                order.stateRecord[constants.ACCEPTED].state = "Delivery Person Found";
                order.stateRecord[constants.DELIVERY_COMPLETION_REQUEST].state = "Waiting for User Response";
                let currentState = order.stateRecord[constants.ORDER_PLACED];
                if(order.currentState > constants.WAITING_FOR_DECISION)
                    currentState = order.stateRecord[order.currentState];

                let stateRecord = [];
                for(var i = order.stateRecord.length - 1; i > constants.WAITING_FOR_DECISION; i--) {
                    if(order.stateRecord[i].time) {
                        stateRecord.push(order.stateRecord[i]);
                    }
                }
                stateRecord.push(order.stateRecord[constants.ORDER_PLACED]);
                resData.items = [];
                order.itemsArrangedByStoppages.forEach(point => {
                    point.items.forEach(item => {
                        resData.items.push({
                            _id: item._id,
                            adID: item.adID,
                            adName: item.name,
                            unitPrice: item.unitPrice,
                            netPrice: item.netPrice,
                            governmentCharge: item.governmentCharge,
                            extraCharge: item.extraCharge,
                            netWeight: item.netWeight,
                            options: item.options,
                            photo: item.photo,
                            quantity: item.quantity + item.numberOfUnavailableQuantity,
                            numberOfUnavailableQuantity: item.numberOfUnavailableQuantity,
                            available: item.available,
                            errorMessage: item.available ? "" : "Item is not available!"
                        });
                    });
                });
                order.unavailableStoppages.forEach(point => {
                    point.items.forEach(item => {
                        resData.items.push({
                            _id: item._id,
                            adID: item.adID,
                            adName: item.name,
                            unitPrice: item.unitPrice,
                            netPrice: item.netPrice,
                            governmentCharge: item.governmentCharge,
                            extraCharge: item.extraCharge,
                            netWeight: item.netWeight,
                            options: item.options,
                            photo: item.photo,
                            quantity: item.quantity + item.numberOfUnavailableQuantity,
                            numberOfUnavailableQuantity: 0,
                            available: item.available,
                            errorMessage: item.available ? "" : "Item is not available!"
                        });
                    });
                });
                resData.orderID = order.id;
                resData.totalWeight = order.totalWeight;
                resData.subtotal = order.subtotal;
                resData.totalGovernmentCharge = order.totalGovernmentCharge;
                resData.totalExtraCharge = order.totalExtraCharge;
                resData.address = order.shippingLocation.address;
                resData.coordinate = order.shippingLocation.coordinate;
                resData.extraWeightCharge = order.extraWeightCharge;
                resData.extraDistanceCharge = order.extraDistanceCharge;
                resData.shippingCharge = order.shippingCharge;
                resData.extraStoppageCharge = order.extraStoppageCharge;
                resData.extraWaitingCharge = order.totalWaitingTime > 60 ? order.totalWaitingTime - 60 : 0;
                resData.netPayable = order.total;
                resData.currentState = currentState;
                resData.stateRecord = stateRecord;
                resData.reason = order.reason;
                resData.createdOn = order.createdOn;
                resData.rateableByUser = order.rateableByUser;
                resData.discount = order.calculationsForUser.discount;

                resData.adsAndShops = [];

                order.itemsArrangedByStoppages.forEach(point => {
                    if(point.type !== 'Shop')
                        return

                    point.items.forEach(item => {
                        let alreadyAdded = {}
                        let adKey = item.adID.toString();
                        if(!alreadyAdded[adKey]) {
                            resData.adsAndShops.push({
                                itemID: adKey,
                                type: 'ad',
                                name: item.name
                            });
                            alreadyAdded[adKey] = 1;
                        }
                    })
                    resData.adsAndShops.push({
                        itemID: point.stoppageID,
                        type: 'shop',
                        name: point.name
                    });
                });
                order.itemsArrangedByStoppages.forEach(point => {
                    if(point.type === 'Shop')
                        return

                    resData.adsAndShops.push({
                        itemID: point.stoppageID,
                        type: 'ad',
                        name: point.name
                    });
                });

                resData.status = "success";
                res.json(resData);
            });
        });
    }); 
});

router.post('/complete-order',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.orderID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        orderModel.findById(req.body.orderID,(err,order) => {
            if(err || !order) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.DELIVERY_COMPLETION_REQUEST || order.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            order.stateRecord[constants.DELIVERY_COMPLETED].time = new Date();
            order.currentState = constants.DELIVERY_COMPLETED;
            order.rateableByUser = true;
            order.rateableByDeliveryPerson = true;
            order
            .save()
            .then(order => {
                user.numberOfCompletedOrders += 1;
                user.save()
                .then(user => {
                    userModel.findById(order.deliveryPersonID,(err,deliveryPerson) => {
                        if(err || !deliveryPerson){
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        deliveryPerson.balance -= order.calculationsForDeliveryPerson.qbirdCharge;
                        deliveryPerson.balance += order.calculationsForDeliveryPerson.waiver;

                        //This one is the BDT 50 bonus for each delivery

                        deliveryPerson.balance += 50;

                        //This one is the BDT 50 bonus for each delivery

                        deliveryPerson.deliveryPersonInfo.dailyRecord.numberOfCompletion += 1;
                        deliveryPerson.deliveryPersonInfo.weeklyRecord.numberOfCompletion += 1;
                        deliveryPerson.deliveryPersonInfo.monthlyRecord.numberOfCompletion += 1;
                        deliveryPerson.deliveryPersonInfo.completedDeliveries.push(order.id);
                        let index = deliveryPerson.deliveryPersonInfo.confirmationPendingDeliveries.findIndex(e => e.toString() === order.id.toString());
                        if(index !== -1)
                            deliveryPerson.deliveryPersonInfo.confirmationPendingDeliveries.splice(index,1);

                        deliveryPerson.save()
                        .then(deliveryPerson => {
                            resData.status = "success";
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
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

router.post('/cancel',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.orderID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        orderModel.findById(req.body.orderID).populate("deliveryPersonID").exec((err,order) => {
            if(err || !order) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState > constants.WAITING_FOR_DECISION || order.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Order can not be canceled now";
                return res.json(resData);
            }

            order.stateRecord[constants.ORDER_CANCELED].time = new Date();
            order.currentState = constants.ORDER_CANCELED;

            order.reason = req.body.reason ? req.body.reason.substring(0,500) : "User's mind changed";

            if(order.deliveryPersonID) {
                const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
                activeDeliveryPersonModel.findById(order.deliveryPersonID.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
                    if(err || activeDeliveryPerson === null) {
                        console.log('Error: ' + err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    order.deliveryPersonID.deliveryPersonInfo.cancelledByUserDeliveries.push(order.id);
                    order.deliveryPersonID
                    .save()
                    .then(dp => {
                        activeDeliveryPerson.ongoingDeliveryID = null;
                        activeDeliveryPerson.deliveryRequestOrderID = null;
                        activeDeliveryPerson
                        .save()
                        .then(adp => {
                            order
                            .save()
                            .then(order => {
                                restoreQuantityOnOrderCancel(order.itemsArrangedByStoppages,res,resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            })
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
            }
            else {
                order
                .save()
                .then(order => {
                    restoreQuantityOnOrderCancel(order.itemsArrangedByStoppages,res,resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                })
            }
        });
    });
});

router.post('/never-rate',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.orderID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        orderModel.findById(req.body.orderID,(err,order) => {
            if(err || !order) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.DELIVERY_COMPLETED || !order.rateableByUser) {
                resData.status = "success";
                return res.json(resData);
            }

            order.rateableByUser = false;
            order
            .save()
            .then(order => {
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

router.post('/rate',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.orderID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        orderModel.findById(req.body.orderID)
        .populate('deliveryPersonID')
        .exec((err,order) => {
            if(err || !order || !order.deliveryPersonID) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!req.body.deliveryPerson || !req.body.adsAndShops || order.userID.toString() !== user.id.toString() || order.currentState != constants.DELIVERY_COMPLETED || !order.rateableByUser){
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            let deliveryPersonRating = {
                userID: user.id,
                deliveryPersonID: order.deliveryPersonID._id,
                comment: req.body.deliveryPerson.comment ? req.body.deliveryPerson.comment.substring(0,2000) : "" ,
                orderID: order.id,
                rating: req.body.deliveryPerson.rating
            }

            let myShops = {};
            let myAds = {};
            order.itemsArrangedByStoppages.forEach(point => {
                point.items.forEach(item => {
                    let key = item.adID.toString();
                    if(!myAds[key])
                        myAds[key] = 1;
                });
                if(point.type === 'Shop') {
                    let key = point.stoppageID.toString();
                    if(!myShops[key])
                        myShops[key] = 1;
                }
            });

            let shopRatings = [];
            let adRatings = [];
            req.body.adsAndShops.forEach(element => {
                if(element.rating >= 1 && element.rating <= 5)
                {
                    if(element.type === 'ad') {
                        if(!myAds[element.itemID]) return;
                        adRatings.push({
                            userID: user.id,
                            adID: element.itemID,
                            comment: element.comment ? element.comment.substring(0,2000) : "",
                            orderID: order.id,
                            rating: element.rating
                        });
                        myAds[element.itemID] = 0;
                    }
                    else if(element.type === 'shop') {
                        if(!myShops[element.itemID]) return;
                        shopRatings.push({
                            userID: user.id,
                            shopID: element.itemID,
                            comment: element.comment ? element.comment.substring(0,2000) : "",
                            orderID: order.id,
                            rating: element.rating
                        });
                        myShops[element.itemID] = 0;
                    }
                }
            });
            rateOrder.rateDeliveryPersonForOrder(deliveryPersonRating,order.deliveryPersonID,() => {
                rateOrder.rateShopsForOrder(shopRatings,shopRatings.length-1,() => {
                    rateOrder.rateAdsForOrder(adRatings,adRatings.length-1,() => {
                        order.rateableByUser = false;
                        order
                        .save()
                        .then(o => {
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

module.exports = router;