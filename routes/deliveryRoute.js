const express = require('express');
const router = express.Router();
const constants = require("../helper/myConstants");
const shopModel = require('../models/shopModel');
const adModel = require('../models/adModel');
const changeStoppageStatus = require('../helper/changeStoppageStatus');
const restoreQuantityOnOrderCancel = require('../helper/restoreQuantityOnOrderCancel');

router.post('/decide',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        accepted: true
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
            if(err || activeDeliveryPerson === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err || !order) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(order.currentState != constants.WAITING_FOR_RESPONSE || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                order.stateRecord[constants.WAITING_FOR_DECISION].time = new Date();
                order.currentState = constants.WAITING_FOR_DECISION;

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
});

router.post('/accept',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        accepted: true
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
            if(err || activeDeliveryPerson === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err || !order) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(order.currentState != constants.WAITING_FOR_DECISION || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                activeDeliveryPerson.deliveryRequestOrderID = null;
                order.stateRecord[constants.ACCEPTED].time = new Date();
                order.currentState = constants.ACCEPTED;
                order.deliveryPersonName = user.name;
                order.deliveryPersonPhoto = user.photo;
                order.numberOfCompletedDeliveries = user.deliveryPersonInfo.completedDeliveries.length;
                order.deliveryPersonPhoneNumber = user.countryCode + user.phoneNumber;
                activeDeliveryPerson.ongoingDeliveryID = order.id;

                order
                .save()
                .then(order => {
                    activeDeliveryPerson
                    .save()
                    .then(adp => {
                        resData.status = "success";
                        res.json(resData);
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

router.post('/reject',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        accepted: true
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
            if(err || activeDeliveryPerson === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err || !order) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!(order.currentState == constants.WAITING_FOR_RESPONSE || order.currentState == constants.WAITING_FOR_DECISION) || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                activeDeliveryPerson.deliveryRequestOrderID = null;
                resData.accepted = false;
                order.rejectedBy.push(user.id);
                order.rejectedTime.push(new Date());
                order.deliveryPersonID = null;
                order.currentState = constants.ORDER_PLACED;

                order
                .save()
                .then(order => {
                    activeDeliveryPerson
                    .save()
                    .then(adp => {
                        user.deliveryPersonInfo.dailyRecord.numberOfRejection += 1;
                        user.deliveryPersonInfo.weeklyRecord.numberOfRejection += 1;
                        user.deliveryPersonInfo.monthlyRecord.numberOfRejection += 1;
                        user.deliveryPersonInfo.rejectedDeliveries.push(order.id);

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

router.post('/shopping-start',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.ACCEPTED || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            order.stateRecord[constants.SHOPPING_STARTED].time = new Date();
            order.currentState = constants.SHOPPING_STARTED;
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

router.post('/shopping-complete',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.SHOPPING_STARTED || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!order.itemsArrangedByStoppages.length) {
                resData.errorMessage.fatalError = "There is no item left to end the shopping!!";
                return res.json(resData);
            }

            let allComplete = true;
            for(var i=0; i < order.itemsArrangedByStoppages.length; i++) {
                if(order.itemsArrangedByStoppages[i].stoppageStatus === "Pending") {
                    allComplete = false;
                    break;
                }
            };

            if(!allComplete) {
                resData.errorMessage.fatalError = "Complete shopping on each stoppage first!!";
                return res.json(resData);
            }

            order.stateRecord[constants.SHOPPING_ENDED].time = new Date();
            order.stateRecord[constants.OUT_FOR_DELIVERY].time = new Date();
            order.currentState = constants.OUT_FOR_DELIVERY;

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

router.post('/delivery-complete',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
            if(err || activeDeliveryPerson === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err || !order) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(order.currentState != constants.OUT_FOR_DELIVERY || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                order.stateRecord[constants.DELIVERY_COMPLETION_REQUEST].time = new Date();
                order.currentState = constants.DELIVERY_COMPLETION_REQUEST;

                activeDeliveryPerson.ongoingDeliveryID = null;
                order
                .save()
                .then(order => {
                    activeDeliveryPerson
                    .save()
                    .then(adp => {
                        user.deliveryPersonInfo.confirmationPendingDeliveries.push(order.id);
                        user
                        .save()
                        .then(user => {
                            const adjustShoppingCount = require('../helper/adjustShoppingCount');
                            adjustShoppingCount(order.itemsArrangedByStoppages,res,resData);
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

router.post('/cancel-delivery',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        name:"",
        cartItemNumber: ""
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
        activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
            if(err || activeDeliveryPerson === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err || !order) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(order.currentState < constants.ACCEPTED || !order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!req.body.reason || req.body.reason.length < 1) {
                    resData.errorMessage.reason = "Please enter the reason for delivery cancelation";
                    return res.json(resData);
                }

                order.stateRecord[constants.DELIVERY_CANCELED].time = new Date();
                order.currentState = constants.DELIVERY_CANCELED;
                order.reason = req.body.reason.substring(0,500);

                activeDeliveryPerson.ongoingDeliveryID = null;
                activeDeliveryPerson.deliveryRequestOrderID = null;
                order
                .save()
                .then(order => {
                    activeDeliveryPerson
                    .save()
                    .then(adp => {
                        user.deliveryPersonInfo.dailyRecord.numberOfCancellation += 1;
                        user.deliveryPersonInfo.weeklyRecord.numberOfCancellation += 1;
                        user.deliveryPersonInfo.monthlyRecord.numberOfCancellation += 1;
                        user.deliveryPersonInfo.cancelledDeliveries.push(order.id);

                        user
                        .save()
                        .then(user => {
                            restoreQuantityOnOrderCancel(order.itemsArrangedByStoppages,res,resData);
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

router.post('/details',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
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
            if(!validator.isValidObjectID(req.body.deliveryID)) {
                resData.errorMessage.contentUnavailable = "Delivery was not found !!";
                return res.json(resData);
            }
            const orderModel = require('../models/orderModel');
            orderModel.findById(req.body.deliveryID,(err,order) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!order || user.id.toString() !== order.deliveryPersonID.toString()) {
                    resData.errorMessage.contentUnavailable = "Delivery was not found !!";
                    return res.json(resData);
                }

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

                resData.rateableByDeliveryPerson = order.rateableByDeliveryPerson;
                resData.deliveryID = order.id;
                resData.totalWeight = order.totalWeight;
                resData.subtotal = order.total - (order.calculationsForDeliveryPerson.shippingCharge + order.calculationsForDeliveryPerson.qbirdCharge - order.calculationsForDeliveryPerson.waiver);
                resData.grossTotal = order.grossTotal;
                resData.totalGovernmentCharge = order.totalGovernmentCharge;
                resData.totalExtraCharge = order.totalExtraCharge;
                resData.address = order.shippingLocation.address;
                resData.netPayable = order.total;
                resData.coordinate = order.shippingLocation.coordinate;

                let extraWaitingCharge = order.totalWaitingTime > 60 ? order.totalWaitingTime - 60 : 0;
                resData.shippingCharge = order.shippingCharge + order.extraStoppageCharge + extraWaitingCharge + order.extraDistanceCharge + order.extraWeightCharge;

                order.stateRecord[constants.DELIVERY_COMPLETION_REQUEST].state = "Waiting for User Response"; 
                let currentState = order.stateRecord[order.currentState];
                if(order.currentState === constants.WAITING_FOR_RESPONSE || order.currentState === constants.WAITING_FOR_DECISION)
                    currentState = order.stateRecord[constants.REQUEST_ASSIGNED];

                let stateRecord = [];
                for(var i = order.stateRecord.length - 1; i > constants.WAITING_FOR_DECISION; i--) {
                    if(order.stateRecord[i].time) {
                        stateRecord.push(order.stateRecord[i]);
                    }
                }
                if(order.stateRecord[constants.REQUEST_ASSIGNED].time) {
                    stateRecord.push(order.stateRecord[constants.REQUEST_ASSIGNED]);
                }
                stateRecord.push(order.stateRecord[constants.ORDER_PLACED]);

                resData.currentState = currentState;
                resData.stateRecord = stateRecord;
                resData.reason = order.reason;
                resData.userID = order.userID;
                resData.userName = order.shippingLocation.userName;
                resData.userPhoto = order.shippingLocation.photo;
                resData.avgRating = order.shippingLocation.rating;
                resData.numberOfRatings = order.shippingLocation.numberOfRatings;
                resData.shippingCharge = order.calculationsForDeliveryPerson.shippingCharge;
                resData.qbirdCharge = order.calculationsForDeliveryPerson.qbirdCharge;
                resData.waiver = order.calculationsForDeliveryPerson.waiver;
                resData.numberOfCompletedOrders = order.numberOfCompletedOrders;
                if(order.currentState > constants.WAITING_FOR_DECISION && order.currentState < constants.DELIVERY_COMPLETED)
                    resData.userPhoneNumber = order.shippingLocation.contactNo;

                resData.status = "success";
                res.json(resData);
            });
        });
    });
});

router.post('/details-for-app',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.currentState = order.stateRecord[order.currentState];
            resData.grandTotal = order.total;
            resData.shippingCharge = order.calculationsForDeliveryPerson.shippingCharge;
            resData.qbirdCharge = order.calculationsForDeliveryPerson.qbirdCharge;
            resData.waiver = order.calculationsForDeliveryPerson.waiver;
            resData.total = resData.grandTotal - (resData.shippingCharge + resData.qbirdCharge - resData.waiver);
            resData.numberOfStoppages = order.itemsArrangedByStoppages.length;
            resData.totalDistance = order.distance;
            resData.stoppages = [];
            order.itemsArrangedByStoppages.forEach(stoppage => {
                resData.stoppages.push({
                    stoppageID: stoppage.stoppageID,
                    initialization: stoppage.initialization,
                    stoppageStatus: stoppage.stoppageStatus,
                    coordinate: stoppage.coordinate,
                    type: stoppage.type,
                    name: stoppage.name,
                    address: stoppage.address,
                    distance: stoppage.distance
                });
            });
            resData.unavailableStoppages = [];
            let i = 1;
            order.unavailableStoppages.forEach(stoppage => {
                resData.unavailableStoppages.push({
                    stoppageID: stoppage.stoppageID,
                    initialization: "Unavailable Stoppage " + i,
                    stoppageStatus: stoppage.stoppageStatus,
                    coordinate: stoppage.coordinate,
                    type: stoppage.type,
                    name: stoppage.name,
                    address: stoppage.address,
                    distance: stoppage.distance
                });
                i++;
            });
            resData.shippingLocation = order.shippingLocation;
            resData.stateRecord = [];
            order.stateRecord.forEach(s => {
                if(s.time) {
                    resData.stateRecord.push(s);
                }
            });

            if(order.currentState < constants.WAITING_FOR_RESPONSE || order.currentState > constants.DELIVERY_COMPLETION_REQUEST) {
                resData.ongoingDeliveryStatus = 0;
            }
            else if(order.currentState === constants.OUT_FOR_DELIVERY) {
                resData.ongoingDeliveryStatus = 5;
            }
            else if(order.currentState === constants.DELIVERY_COMPLETION_REQUEST) {
                resData.ongoingDeliveryStatus = 6;
            }
            else {
                resData.ongoingDeliveryStatus = order.currentState - 1;
            }

            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/details-for-app/shop',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID) || !validator.isValidObjectID(req.body.stoppageID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            shopModel.findById(req.body.stoppageID).populate('userID','name').exec((err,shop) => {
                if(err || !shop) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let stoppageList = order.itemsArrangedByStoppages;
                if(req.body.stoppageStatus === "Unavailable")
                    stoppageList = order.unavailableStoppages;

                let stoppage = stoppageList.find(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID);
                if(!stoppage) {
                    resData.errorMessage.fatalError = "Stoppage not found!!";
                    return res.json(resData);
                }

                changeStoppageStatus.setStopageDataResponse(stoppage,resData);

                let shopData = shop;
                if(stoppage.version < shop.version)
                    shopData = shop.versionRecords[stoppage.version];

                resData.shop = {
                    name: stoppage.name,
                    photo: stoppage.photo,
                    address: stoppage.address,
                    owner: shop.userID.name,
                    contactNo: shopData.contactNo.split(', '),
                    openingHours: shopData.openingHours,
                    midBreaks: shopData.midBreaks
                };

                resData.status = "success";
                res.json(resData);
            });
        });
    });
});

router.post('/details-for-app/individual-ad',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID) || !validator.isValidObjectID(req.body.stoppageID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            adModel.findById(req.body.stoppageID).populate('userID','name').exec((err,ad) => {
                if(err || !ad) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let stoppageList = order.itemsArrangedByStoppages;
                if(req.body.stoppageStatus === "Unavailable")
                    stoppageList = order.unavailableStoppages;

                let stoppage = stoppageList.find(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID);
                if(!stoppage) {
                    resData.errorMessage.fatalError = "Stoppage not found!!";
                    return res.json(resData);
                }
                changeStoppageStatus.setStopageDataResponse(stoppage,resData);

                let adData = ad;
                if(stoppage.version < ad.version)
                    adData = ad.versionRecords[stoppage.version];

                resData.ad = {
                    name: stoppage.name,
                    photo: stoppage.photo,
                    address: stoppage.address,
                    owner: ad.userID.name,
                    contactNo: adData.contactNo.split(', '),
                    openingHours: adData.availableHours,
                    midBreaks: adData.midBreaks
                };

                resData.status = "success";
                res.json(resData);
            });
        });
    });
});

router.post('/details-for-app/shipping-location',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.initialization = "Shipping Details";
            resData.ordersCompleted = order.numberOfCompletedOrders;
            resData.stoppageStatus = order.shippingLocation.stoppageStatus;
            resData.coordinate = order.shippingLocation.coordinate;
            resData.address = order.shippingLocation.address;
            resData.userName = order.shippingLocation.userName;
            resData.photo = order.shippingLocation.photo;
            resData.contactNo = order.shippingLocation.contactNo;
            resData.rating = order.shippingLocation.rating;
            resData.numOfRatings = order.shippingLocation.numOfRatings;

            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/change-stoppage-status',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID) || !validator.isValidObjectID(req.body.stoppageID) || (req.body.status !== "Pending" && req.body.status !== "Complete" && req.body.status !== "Unavailable")) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.SHOPPING_STARTED) {
                resData.errorMessage.fatalError = "Start shopping first!!";
                return res.json(resData);
            }

            let stoppageIndex = -1;
            let stoppage = null;
            if(req.body.status === "Unavailable") {
                stoppageIndex = order.itemsArrangedByStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID && stoppage.stoppageStatus === "Pending");
                if(stoppageIndex == -1) {
                    resData.errorMessage.fatalError = "Stoppage doesn't exist or status is not pending!!";
                    return res.json(resData);
                }
                stoppage = order.itemsArrangedByStoppages[stoppageIndex];
                changeStoppageStatus.makeUnavailable(order,stoppageIndex, () => {
                    order
                    .save()
                    .then(order => {
                        changeStoppageStatus.setStopageDataResponse(stoppage,resData);
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
                if(req.body.status === "Complete") {
                    stoppageIndex = order.itemsArrangedByStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID && stoppage.stoppageStatus === "Pending");
                    if(stoppageIndex == -1) {
                        resData.errorMessage.fatalError = "Stoppage doesn't exist or status is not pending!!";
                        return res.json(resData);
                    }
                    stoppage = order.itemsArrangedByStoppages[stoppageIndex];
                    stoppage.stoppageStatus = "Complete";
                }
                else {
                    stoppageIndex = order.itemsArrangedByStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID && stoppage.stoppageStatus === "Complete");
                    if(stoppageIndex !== -1) {
                        stoppage = order.itemsArrangedByStoppages[stoppageIndex];
                        stoppage.stoppageStatus = "Pending";
                    }
                    else {
                        stoppageIndex = order.unavailableStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID);
                        if(stoppageIndex == -1) {
                            resData.errorMessage.fatalError = "Stoppage doesn't exist or already pending!!";
                            return res.json(resData);
                        }
                        return changeStoppageStatus.makeAvailableAsync(order,stoppageIndex,res,resData);
                    }
                }

                order
                .save()
                .then(order => {
                    changeStoppageStatus.setStopageDataResponse(stoppage,resData);
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

router.post('/change-item-availability',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID) || !validator.isValidObjectID(req.body.stoppageID) || !validator.isValidObjectID(req.body.itemID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.SHOPPING_STARTED) {
                resData.errorMessage.fatalError = "Start shopping first!!";
                return res.json(resData);
            }

            let stoppageIndex = order.itemsArrangedByStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID && stoppage.stoppageStatus === "Pending");
            if(stoppageIndex == -1) {
                resData.errorMessage.fatalError = "Stoppage doesn't exist or status is not pending!!";
                return res.json(resData);
            }
            let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
            let item = stoppage.items.find(item => item.id.toString() === req.body.itemID);
            if(!item) {
                resData.errorMessage.fatalError = "Item doesn't exist";
                return res.json(resData);
            }

            if(req.body.available === "true") {
                if(item.available) {
                    resData.errorMessage.fatalError = "Item is already in available state";
                    return res.json(resData);
                }
                changeStoppageStatus.makeItemAvailableAsync(order,stoppageIndex,item,res,resData);
            }
            else {
                if(!item.available) {
                    resData.errorMessage.fatalError = "Item is already in not available state";
                    return res.json(resData);
                }
                changeStoppageStatus.makeItemUnavailableAsync(order,stoppageIndex,item,res,resData);
            }
        });
    });
});

router.post('/change-item-quantity',(req,res) => {
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
        if(!validator.isValidObjectID(req.body.deliveryID) || !validator.isValidObjectID(req.body.stoppageID) || !validator.isValidObjectID(req.body.itemID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const orderModel = require('../models/orderModel');
        orderModel.findById(req.body.deliveryID,(err,order) => {
            if(err || !order) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!order.deliveryPersonID || order.deliveryPersonID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(order.currentState != constants.SHOPPING_STARTED) {
                resData.errorMessage.fatalError = "Start shopping first!!";
                return res.json(resData);
            }

            let stoppageIndex = order.itemsArrangedByStoppages.findIndex(stoppage => stoppage.stoppageID.toString() === req.body.stoppageID && stoppage.stoppageStatus === "Pending");
            if(stoppageIndex == -1) {
                resData.errorMessage.fatalError = "Stoppage doesn't exist or status is not pending!!";
                return res.json(resData);
            }
            let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
            let item = stoppage.items.find(item => item.id.toString() === req.body.itemID);
            if(!item) {
                resData.errorMessage.fatalError = "Item doesn't exist";
                return res.json(resData);
            }

            let quantity = parseInt(req.body.quantity);

            changeStoppageStatus.changeItemQuantityAsync(order,stoppageIndex,item,quantity,res,resData);
        });
    });
});

router.post('/delivery-person-summary',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        resData.status = "success";
        resData.balance = Math.round(user.balance * 100) / 100;
        return res.json(resData);
    });
});

module.exports = router;