const express = require('express');
const router = express.Router();
const constants = require("../helper/myConstants");

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
            if(!validator.isValidObjectID(req.body.saleID)) {
                resData.errorMessage.contentUnavailable = "Sale was not found !!";
                return res.json(resData);
            }

            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.saleID)
            .populate('deliveryPersonID','photo deliveryPersonInfo.avgRating deliveryPersonInfo.numberOfRatings')
            .exec((err,order) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                
                if(!order) {
                    resData.errorMessage.contentUnavailable = "Sale was not found !!";
                    return res.json(resData);
                }

                if((order.currentState < 4) || (order.currentState === 10) || (order.currentState === 12)) {
                    resData.errorMessage.contentUnavailable = "Sale was not found !!";
                    return res.json(resData);
                }

                resData.saleID = order.id;
                resData.totalWeight = 0;
                resData.grossTotal = 0;
                resData.totalGovernmentCharge = 0;
                resData.totalExtraCharge = 0;
                resData.subtotal = 0;
                resData.discount = 0;
                resData.items = [];
                order.itemsArrangedByStoppages.forEach(point => {
                    if(point.ownerID.toString() !== user.id.toString())
                        return;

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

                    resData.totalWeight += point.totalWeight;
                    resData.subtotal += point.subtotal;
                    resData.grossTotal += point.stoppageTotal;
                    resData.totalGovernmentCharge += point.governmentCharge;
                    resData.totalExtraCharge += point.extraCharge;
                    resData.discount += point.discount;
                });
                order.unavailableStoppages.forEach(point => {
                    if(point.ownerID.toString() !== user.id.toString())
                        return;

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
                if(resData.items.length < 1) {
                    resData.errorMessage.contentUnavailable = "Sale was not found !!";
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
                let currentState = order.stateRecord[order.currentState];
                if(order.currentState < constants.DELIVERY_COMPLETION_REQUEST) {
                    currentState = {
                        ...order.stateRecord[constants.ACCEPTED],
                        state: "Ongoing Order"
                    };
                }
                else if(order.currentState === constants.DELIVERY_COMPLETION_REQUEST) {
                    currentState = {
                        ...order.stateRecord[order.currentState],
                        state: "Delivery Completed"
                    };
                }
                else if(order.currentState === constants.DELIVERY_COMPLETED) {
                    currentState = {
                        ...order.stateRecord[order.currentState],
                        state: "Order Completed"
                    };
                }

                let stateRecord = [];
                for(var i = order.stateRecord.length - 1; i > constants.OUT_FOR_DELIVERY; i--) {
                    if(order.stateRecord[i].time) {
                        if(order.stateRecord[i].state === "Delivery Completion Request") {
                            order.stateRecord[i].state = "Delivery Completed";
                        }
                        else if(order.stateRecord[i].state === "Delivery Completed") {
                            order.stateRecord[i].state = "Order Completed";
                        }
                        stateRecord.push(order.stateRecord[i]);
                    }
                }
                if(order.stateRecord[constants.ACCEPTED].time) {
                    stateRecord.push(order.stateRecord[constants.ACCEPTED]);
                }
                stateRecord.push(order.stateRecord[constants.ORDER_PLACED]);

                resData.currentState = currentState;
                resData.stateRecord = stateRecord;
                resData.reason = order.reason;
                resData.createdOn = order.createdOn;

                resData.status = "success";
                res.json(resData);
            });
        });
    }); 
});

module.exports = router;