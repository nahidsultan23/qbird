const express = require('express');
const router = express.Router();
const constants = require("../helper/myConstants");

router.post('/register',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        user.deliveryPersonInfo = {};

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        new activeDeliveryPersonModel({deliveryPersonID: user.id})
        .save()
        .then(adp => {
            user.activeDeliveryPersonID = adp.id;

            user
            .save()
            .then(user => {
                resData.status = 'success';
                return res.json(resData);
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

router.post('/update-location',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        deliveryRequest: false
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        if(user.deliveryPersonInfo && user.activeDeliveryPersonID) {
            const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
            activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
                if(err || activeDeliveryPerson === null) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                const validator = require('../helper/validationHelper');
                if(!validator.isValidLattitude(req.body.lat) || !validator.isValidLongitude(req.body.long)) {
                    resData.errorMessage.fatalError = "something went wrong!!"
                    return res.json(resData);
                }

                activeDeliveryPerson.curLocation = {
                    type: "Point",
                    coordinates: [
                        req.body.long,
                        req.body.lat
                    ]
                };
                activeDeliveryPerson.lastUpdatedOn = new Date();

                console.log(activeDeliveryPerson.curLocation.coordinates[1] + "," + activeDeliveryPerson.curLocation.coordinates[0] + " ==> " + user.name);

                activeDeliveryPerson
                .save()
                .then(activeDeliveryPerson => {
                    resData.status = "success";
                    if(activeDeliveryPerson.deliveryRequestOrderID !== null) {
                        const orderModel = require('../models/orderModel');
                        orderModel.findById(activeDeliveryPerson.deliveryRequestOrderID,(err,order) => {
                            if(err || !order) {
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            }

                            if(order.currentState === constants.REQUEST_ASSIGNED && order.deliveryPersonID && order.deliveryPersonID.toString() === user.id.toString()) {
                                order.stateRecord[constants.WAITING_FOR_RESPONSE].time = new Date();
                                order.currentState = constants.WAITING_FOR_RESPONSE;
                                order
                                .save()
                                .then(order => {
                                    resData.deliveryRequest = true;
                                    resData.deliveryID = order.id;
                                    resData.netPayable = order.total;
                                    resData.totalWeight = order.totalWeight;
                                    resData.address = order.shippingLocation.address;
                                    resData.location = order.shippingLocation.location;
                                    resData.distance = order.distance;
                                    res.json(resData);
                                })
                                .catch(err => {
                                    console.log("ERROR: "+err);
                                    resData.errorMessage.fatalError = "Something went wrong!!";
                                    return res.json(resData);
                                });
                            }
                            else {
                                res.json(resData);
                            }
                        });
                    }
                    else {
                        res.json(resData);
                    }
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

module.exports = router;