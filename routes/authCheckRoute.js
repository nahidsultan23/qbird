const express = require('express');
const router = express.Router();
const constants = require("../helper/myConstants");
const checkItemAvailability = require('../helper/checkItemAvailability');
const storedInDatabaseModel = require('../models/storedInDatabaseModel');
const demoAdModel = require('../models/demoAdModel');
const shopModel = require('../models/shopModel');
const adModel = require('../models/adModel');
const validator = require('../helper/validationHelper');
const sendWishListItems = require('../helper/sendWishListItems');
const isLoggedIn = require('../helper/isLoggedIn');
const getPermissions = require('../helper/getPermissions');
const checkAndUpdateStoppageData = require('../helper/checkAndUpdateStoppageData');
const prepareItemOptions = require('../helper/prepareItemOptions');
const preOrderCheck = require('../helper/preOrderCheck');

router.post('/admin',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        phoneNumber: "",
        email: "",
        categories:[],
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.permissions = getPermissions(user.userType);
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.cartItemNumber = user.cartItemNumber;
            resData.email = user.email;

            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/general',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        phoneNumber: "",
        email: "",
        categories:[],
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        resData.shopCategories = data.shopCategories;
        resData.status = 'success';
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.cartItemNumber = user.cartItemNumber;
            resData.email = user.email;
            res.json(resData);
        });
    });
});

router.post('/authenticated',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        phoneNumber: "",
        email: "",
        cartItemNumber: "",
        categories: [],
        customCategories: [],
        weightUnits: [],
        volumeUnits: [],
        dimensionUnits: [],
        areaUnits: [],
        priceUnits: [],
        pricePer: []
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        resData.shopCategories = data.shopCategories;

        isLoggedIn(req,res,resData,(user) => {
            resData.status = 'success';
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.cartItemNumber = user.cartItemNumber;
            resData.email = user.email;
            resData.customCategories = data.customCategories;
            resData.weightUnits = data.weightUnits;
            resData.volumeUnits = data.volumeUnits;
            resData.dimensionUnits = data.dimensionUnits;
            resData.areaUnits = data.areaUnits;
            resData.priceUnits = data.priceUnits;
            resData.pricePer = data.pricePer;
            res.json(resData);
        });
    });
});

router.post('/create-individual-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        cartItemNumber: "",
        category: [],
        customCategory: [],
        weightUnit: [],
        volumeUnit: [],
        dimensionUnit: [],
        areaUnit: [],
        pricePer: []
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.category = data.categories;
        resData.customCategory = data.customCategories;
        resData.weightUnit = data.weightUnits;
        resData.volumeUnit = data.volumeUnits;
        resData.dimensionUnit = data.dimensionUnits;
        resData.areaUnit = data.areaUnits;
        resData.pricePer = data.pricePer;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.status = 'success';
            res.json(resData);
        });
    });
});

router.post('/attach-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        cartItemNumber: "",
        shopNameAndID: [],
        category: [],
        customCategory: [],
        weightUnit: [],
        volumeUnit: [],
        dimensionUnit: [],
        areaUnit: [],
        pricePer: []
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.category = data.categories;
        resData.customCategory = data.customCategories;
        resData.weightUnit = data.weightUnits;
        resData.volumeUnit = data.volumeUnits;
        resData.dimensionUnit = data.dimensionUnits;
        resData.areaUnit = data.areaUnits;
        resData.pricePer = data.pricePer;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            shopModel.find({userID: user.id,isDeleted: false},{name:1, urlName: 1},(err,shops) => {
                if(err || shops === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i = 0; i < shops.length; i++) {
                    resData.shopNameAndID.push({
                        id: shops[i].id,
                        name: shops[i].name,
                        urlName: shops[i].urlName
                    });
                }
                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

router.post('/wishlist',(req,res) => {

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

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            sendWishListItems(res,resData,user._id);
        });
    });
});

router.post('/cart',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        cartItemNumber: "",
        categories:[],
        cart:[],
        totalWeight: 0,
        netPayable: 0
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            resData.status = 'success';
            const sendCartItems = require('../helper/sendCartItems');
            sendCartItems(res,{userID: user.id},resData);
        });
    });
});

router.post('/checkout',(req,res) => {
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
        deliveryTime: 0,
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;

            if(!validator.isValidObjectID(req.body.checkoutID)) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const checkoutModel = require('../models/checkoutModel');
            checkoutModel.findById(req.body.checkoutID).exec((err,checkout) => {
                if(err || checkout === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
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

                    checkout.itemsArrangedByStoppages.forEach(point => {
                        point.items.forEach(item => {
                            let key = item.adID.toString();
                            let ad = adData[key].ad;
                            item.checkoutErrorMessage = checkItemAvailability(item,ad,ad.shopID,0,adData[key].quantity);
                        })
                    })

                    let dataUpdated = checkAndUpdateStoppageData(checkout,adData);

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
                        })
                    })

                    resData.governmentCharge = checkout.totalGovernmentCharge;
                    resData.extraCharge = checkout.totalExtraCharge;
                    resData.subtotal = checkout.subtotal;
                    resData.distance = checkout.distance;
                    resData.deliveryTime = 1800;
                    resData.shippingCharge = checkout.shippingCharge;
                    resData.extraStoppageCharge = checkout.extraStoppageCharge;
                    resData.extraWeightCharge = checkout.extraWeightCharge;
                    resData.extraDistanceCharge = checkout.extraDistanceCharge;
                    resData.extraWaitingCharge = checkout.totalWaitingTime > 60 ? checkout.totalWaitingTime - 60 : 0;
                    resData.totalPrice = checkout.total;

                    if(!dataUpdated) {
                        resData.status = "success";
                        return res.json(resData);
                    }

                    checkout.save().then(c => {
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

router.post('/pre-order-checkout',(req,res) => {
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
        deliveryTime: 0,
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;

            if(!validator.isValidObjectID(req.body.checkoutID)) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            const PreOrderCheckoutModel = require('../models/PreOrderCheckoutModel');
            PreOrderCheckoutModel.findById(req.body.checkoutID,(err,checkout) => {
                if(err || !checkout) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let item = checkout.itemsArrangedByStoppages[0].items[0];

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
                    let dataUpdated = checkAndUpdateStoppageData(checkout,adData,true);

                    resData.checkout =[{
                        id: item.id,
                        adID: item.adID,
                        adName: item.name,
                        options: item.options,
                        quantity: item.quantity,
                        price: item.netPrice,
                        photo: item.photo,
                        checkoutErrorMessage: item.checkoutErrorMessage
                    }];

                    resData.governmentCharge = checkout.totalGovernmentCharge;
                    resData.extraCharge = checkout.totalExtraCharge;
                    resData.subtotal = checkout.subtotal;
                    resData.distance = checkout.distance;
                    resData.deliveryTime = 1800;
                    resData.shippingCharge = checkout.shippingCharge;
                    resData.extraStoppageCharge = checkout.extraStoppageCharge;
                    resData.extraWeightCharge = checkout.extraWeightCharge;
                    resData.extraDistanceCharge = checkout.extraDistanceCharge;
                    resData.totalPrice = checkout.total;

                    if(!dataUpdated) {
                        resData.status = "success";
                        return res.json(resData);
                    }

                    checkout.save().then(c => {
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

router.post('/user-address',(req,res) => {

    let resData = {
        status: "failure",
        addressName: "",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;
        
        if(user.address.length >= 20) {
            resData.status = 'success';
            return res.json(resData);
        }

        const names = ["Home", "Office", "Address 1", "Address 2", "Address 3", "Address 4", "Address 5", "Address 6",
        "Address 7", "Address 8", "Address 9", "Address 10", "Address 11", "Address 12", "Address 13", "Address 14",
        "Address 15", "Address 16", "Address 17", "Address 18"];

        for(var i=0; i < names.length; i++) {
            if(!user.address.find(a => a.addressName === names[i])) {
                resData.addressName = names[i];
                break;
            }
        }

        resData.status = 'success';
        res.json(resData);
    });
});

router.post('/edit-user-address',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;

        let userAddress = user.address.find(a => a._id.toString() === req.body.addressID);
        if(!userAddress) {
            resData.errorMessage.fatalError = "Address not found";
            return res.json(resData);
        }

        resData.addressName = userAddress.addressName;
        resData.coordinate = userAddress.coordinate;
        resData.address = userAddress.address;

        resData.status = 'success';
        res.json(resData);
    });
});

router.post('/all-orders',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        orders:[],
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            const orderModel = require('../models/orderModel');
            orderModel.find({userID: user.id},(err,orders) => {
                if(err || orders === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i = orders.length-1; i >= 0; i--) {

                    let currentState = orders[i].stateRecord[constants.ORDER_PLACED];
                    if(orders[i].currentState > constants.WAITING_FOR_DECISION)
                        currentState = orders[i].stateRecord[orders[i].currentState];

                    if(orders[i].currentState === constants.ACCEPTED)
                        currentState.state = "Delivery Person Found";
                    else if(orders[i].currentState === constants.DELIVERY_COMPLETION_REQUEST)
                        currentState.state = "Waiting for User Response";

                    resData.orders.push({
                        netPayable: orders[i].total,
                        createdOn: orders[i].createdOn,
                        currentState: currentState,
                        orderID: orders[i].id
                    });
                }

                resData.status = "success";
                res.json(resData);
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
        },
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            if(!validator.isValidObjectID(req.body.adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            const buyNowModel = require('../models/buyNowModel');
            buyNowModel.findOne({adID:req.body.adID,userID:user.id})
            .populate('adID')
            .populate('shopID','name active forceOpen openingHours midBreaks version governmentCharge governmentChargeDescription extraCharge extraChargeDescription')
            .exec((err,buyNowItem) => {
                if(err || buyNowItem === null) {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                resData.buyNowErrorMessage = checkItemAvailability(buyNowItem,buyNowItem.adID,buyNowItem.shopID,0,buyNowItem.quantity);
                resData.status = "success";
                if(buyNowItem) {
                    const sendBuyNowItem = require('../helper/sendBuyNowItem');
                    sendBuyNowItem(res,buyNowItem,resData);
                } else {
                    res.json(resData);
                }
            });
        });
    });
});

router.post('/pre-order',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            if(!validator.isValidObjectID(req.body.adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            const preOrderCartModel = require('../models/preOrderCartModel');
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
                    resData.preOrderErrorMessage = "Pre order is not available";
                }
                else if(cartItem.options && (!cartItem.adVersion || cartItem.adVersion < ad.optionVersion)) {
                    if(prepareItemOptions(cartItem,cartItem.adID.options)) {
                        resData.preOrderErrorMessage = "Item with the options selected is not available";
                    }
                }
                resData.status = "success";
                if(cartItem) {
                    const sendBuyNowItem = require('../helper/sendBuyNowItem');
                    sendBuyNowItem(res,cartItem,resData);
                } else {
                    res.json(resData);
                }
            });
        });
    });
});

router.post('/get-demo-ads',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        cartItemNumber: "",
        categories: [],
        ads: []
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            var query = [{isDeleted: false}];
            if(req.body.category && req.body.category !== "All")
                query.push({ category: req.body.category });

            if(req.body.subcategory && req.body.subcategory !== "All")
                query.push({ subcategory: req.body.subcategory });

            if((typeof req.body.searchString) === 'string') {
                var token = req.body.searchString.split(" ");
                token.forEach(element => {
                    query.push({searchString: new RegExp(element,'i')});
                });
            }

            demoAdModel.find({$and: query},(err,ads) => {
                if(err || ads === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i=ads.length-1; i >= 0; i--) {
                    resData.ads.push({
                        adID: ads[i].id,
                        adName: ads[i].name,
                        price: ads[i].price,
                        description: ads[i].description,
                        photo: ads[i].photos ? ads[i].photos[0] : null
                    });
                }

                resData.permissions = getPermissions(user.userType);
                resData.listedDemoAds = req.session.listedDemoAds;
                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

router.post('/get-demo-ad-details',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        name:"",
        cartItemNumber: "",
        categories: []
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            var adID = req.body.adID;
            if(!validator.isValidObjectID(adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found !!";
                return res.json(resData);
            }

            demoAdModel.findById(adID,(err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad || ad.isDeleted) {
                    resData.errorMessage.contentUnavailable = "Ad was not found !!";
                    return res.json(resData);
                }

                resData.adName = ad.name;
                resData.category = ad.category;
                resData.subcategory = ad.subcategory;
                resData.description = ad.description;
                resData.weight = ad.weight;
                resData.weightUnit = ad.weightUnit;
                resData.parcelWeight = ad.parcelWeight;
                resData.parcelWeightUnit = ad.parcelWeightUnit;
                resData.volume = ad.volume;
                resData.volumeUnit = ad.volumeUnit;
                resData.dimension = ad.dimension;
                resData.dimensionUnit = ad.dimensionUnit;
                resData.parcelDimension = ad.parcelDimension;
                resData.parcelDimensionUnit = ad.parcelDimensionUnit;
                resData.price = ad.price;
                resData.priceUnit = ad.priceUnit;
                resData.parcelPrice = ad.parcelPrice;
                resData.parcelPriceUnit = ad.parcelPriceUnit;
                resData.brandName = ad.brandName;
                resData.specifications = ad.specifications;
                resData.options = ad.options;
                resData.expiryTime = ad.expiryTime;
                resData.photos = ad.photos;

                resData.permissions = getPermissions(user.userType);
                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

router.post('/all-deliveries',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        deliveries:[],
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            const orderModel = require('../models/orderModel');
            orderModel.find({deliveryPersonID: user.id, currentState: {$gt: constants.WAITING_FOR_DECISION}},(err,orders) => {
                if(err || orders === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i = orders.length-1; i >= 0; i--) {
                    let currentState = orders[i].stateRecord[orders[i].currentState];
                    if(orders[i].currentState === constants.DELIVERY_COMPLETION_REQUEST)
                        currentState.state = "Waiting for User Response";
                    resData.deliveries.push({
                        price: Math.round(orders[i].grossTotal * 100)/100,
                        createdOn: orders[i].createdOn,
                        currentState: currentState,
                        deliveryID: orders[i].id
                    });
                }

                resData.status = "success";
                res.json(resData);
            });
        });
    });
});

router.post('/all-sales',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        categories:[],
        sales:[],
        name:"",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = data.categories;

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            const orderModel = require('../models/orderModel');
            orderModel.find({"itemsArrangedByStoppages.ownerID": user.id},(err,orders) => {
                if(err || orders === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i = orders.length-1; i >= 0; i--) {
                    if((orders[i].currentState >= 4) && (orders[i].currentState !== 10) && (orders[i].currentState !== 12)) {
                        let currentState = orders[i].stateRecord[orders[i].currentState];
                        if(orders[i].currentState < constants.DELIVERY_COMPLETION_REQUEST) {
                            currentState = orders[i].stateRecord[constants.ACCEPTED];
                            currentState.state = "Ongoing Order";
                        }
                        else if(orders[i].currentState === constants.DELIVERY_COMPLETION_REQUEST) {
                            currentState = orders[i].stateRecord[constants.ACCEPTED];
                            currentState.state = "Delivery Completed";
                        }
                        else if(orders[i].currentState === constants.DELIVERY_COMPLETED) {
                            currentState = orders[i].stateRecord[constants.ACCEPTED];
                            currentState.state = "Order Completed";
                        }

                        let price = 0;
                        orders[i].itemsArrangedByStoppages.forEach(point => {
                            if(point.ownerID.toString() === user.id.toString()) {
                                price += point.total;
                            }
                        })

                        resData.sales.push({
                            price: Math.round(price * 100)/100,
                            createdOn: orders[i].createdOn,
                            currentState: currentState,
                            saleID: orders[i].id
                        });
                    }
                }

                resData.status = "success";
                res.json(resData);
            });
        });
    });
});

router.post('/all-delivery-list',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
        },
        deliveries:[]
    }

    isLoggedIn(req,res,resData,(user) => {
        if(user.deliveryPersonInfo) {
            const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
            activeDeliveryPersonModel.findById(user.activeDeliveryPersonID,(err,activeDeliveryPerson) => {
                if(err || activeDeliveryPerson === null) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                let orderIDs = [];
                let status = [];

                if(activeDeliveryPerson.ongoingDeliveryID) {
                    orderIDs.push(activeDeliveryPerson.ongoingDeliveryID);
                    status.push("Ongoing");
                }
                if(req.body.onGoing === 'true') {
                    orderIDs.push(...user.deliveryPersonInfo.confirmationPendingDeliveries);
                    user.deliveryPersonInfo.confirmationPendingDeliveries.forEach(o => status.push("Confirmation Pending"));
                }
                if(req.body.completed === 'true') {
                    orderIDs.push(...user.deliveryPersonInfo.completedDeliveries);
                    user.deliveryPersonInfo.completedDeliveries.forEach(o => status.push("Completed"));
                }
                if(req.body.rejected === 'true') {
                    orderIDs.push(...user.deliveryPersonInfo.rejectedDeliveries);
                    user.deliveryPersonInfo.rejectedDeliveries.forEach(o => status.push("Rejected"));
                }
                if(req.body.canceled === 'true') {
                    orderIDs.push(...user.deliveryPersonInfo.cancelledDeliveries);
                    user.deliveryPersonInfo.cancelledDeliveries.forEach(o => status.push("Canceled"));
                    orderIDs.push(...user.deliveryPersonInfo.cancelledByUserDeliveries);
                    user.deliveryPersonInfo.cancelledByUserDeliveries.forEach(o => status.push("Canceled by user"));
                }

                const orderModel = require('../models/orderModel');
                orderModel.find({_id: {$in: orderIDs}},(err,orders) => {
                    if(err || orders === null) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    for(var i = orders.length - 1; i >= 0 ; i--) {
                        var index = orderIDs.findIndex(id => id.toString() === orders[i].id.toString());
                        if(index != -1) {
                            resData.deliveries.push({
                                createdOn: orders[i].createdOn,
                                status: status[index],
                                deliveryID: orders[i].id,
                                address: orders[i].shippingLocation.location
                            });
                        }
                    }
                    resData.status = "success";
                    res.json(resData);
                });
            });
        }
        else {
            resData.status = "success";
            res.json(resData);
        }
    });
});

router.post('/get-listed-demo-ads',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        },
        listedDemoAds: [],
        name: "",
        cartItemNumber: ""
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;
        if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_ATTACH_DEMO_AD)) {
            resData.errorMessage.permissionError = "You don't have permissions to do it";
            return res.json(resData);
        }

        resData.permissions = getPermissions(user.userType);

        demoAdModel.find({_id: {$in: req.session.listedDemoAds}},{name: 1},(err,ads) => {
            if(err || !ads) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            ads.forEach(ad => {
                resData.listedDemoAds.push({
                    adID: ad.id,
                    adName: ad.name
                })
            })
            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/create-demo-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: "",
		    contentUnavailable: ""
        },
        name: "",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.data = {
            categories: data.categories,
            customCategories: data.customCategories,
            weightUnits: data.weightUnits,
            volumeUnits: data.volumeUnits,
            dimensionUnits: data.dimensionUnits,
            areaUnits: data.areaUnits,
            pricePer: data.pricePer,
            priceUnits: data.priceUnits
        }

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.email = user.email;

            resData.permissions = getPermissions(user.userType);
            if(!resData.permissions.createDemoAd) {
                resData.errorMessage.permissionError = "You don't have permissions to do it";
                return res.json(resData);
            }
            if(!req.body.demoAdID) {
                resData.status = 'success';
                return res.json(resData);
            }

            if(!validator.isValidObjectID(req.body.demoAdID)) {
                resData.errorMessage.contentUnavailable = "Demo Ad was not found!!";
                return res.json(resData);
            }

            demoAdModel.findById(req.body.demoAdID,(err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad) {
                    resData.errorMessage.contentUnavailable = "Demo Ad was not found!!";
                    return res.json(resData);
                }

                resData.demoAdData = {
                    adName: ad.name,
                    category: ad.category,
                    subcategory: ad.subcategory,
                    description: ad.description,
                    weight: ad.weight,
                    weightUnit: ad.weightUnit,
                    parcelWeight: ad.parcelWeight,
                    parcelWeightUnit: ad.parcelWeightUnit,
                    volume: ad.volume,
                    volumeUnit: ad.volumeUnit,
                    dimension: ad.dimension,
                    dimensionUnit: ad.dimensionUnit,
                    parcelDimension: ad.parcelDimension,
                    parcelDimensionUnit: ad.parcelDimensionUnit,
                    price: ad.price,
                    priceUnit: ad.priceUnit,
                    parcelPrice: ad.parcelPrice,
                    parcelPriceUnit: ad.parcelPriceUnit,
                    brandName: ad.brandName,
                    specifications: ad.specifications,
                    options: ad.options,
                    expiryTime: ad.expiryTime,
                    photos: ad.photos
                }

                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

router.post('/create-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            contentUnavailable: ""
        },
        shopNameAndID: [],
        name: "",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.data = {
            categories: data.categories,
            customCategories: data.customCategories,
            weightUnits: data.weightUnits,
            volumeUnits: data.volumeUnits,
            dimensionUnits: data.dimensionUnits,
            areaUnits: data.areaUnits,
            pricePer: data.pricePer,
            priceUnits: data.priceUnits
        }

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.email = user.email;

            shopModel.find({userID: user.id,isDeleted: false},{name:1, urlName: 1},(err,shops) => {
                if(err || shops === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                for(var i = 0; i < shops.length; i++) {
                    resData.shopNameAndID.push({
                        id: shops[i].id,
                        name: shops[i].name,
                        urlName: shops[i].urlName
                    });
                }

                if(!req.body.demoAdID) {
                    resData.status = 'success';
                    return res.json(resData);
                }

                if(!validator.isValidObjectID(req.body.demoAdID)) {
                    resData.errorMessage.contentUnavailable = "Demo Ad was not found!!";
                    return res.json(resData);
                }

                demoAdModel.findById(req.body.demoAdID,(err,ad) => {
                    if(err) {
                        console.log(err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    if(!ad) {
                        resData.errorMessage.contentUnavailable = "Demo Ad was not found!!";
                        return res.json(resData);
                    }

                    resData.demoAdData = {
                        adName: ad.name,
                        category: ad.category,
                        subcategory: ad.subcategory,
                        description: ad.description,
                        weight: ad.weight,
                        weightUnit: ad.weightUnit,
                        parcelWeight: ad.parcelWeight,
                        parcelWeightUnit: ad.parcelWeightUnit,
                        volume: ad.volume,
                        volumeUnit: ad.volumeUnit,
                        dimension: ad.dimension,
                        dimensionUnit: ad.dimensionUnit,
                        parcelDimension: ad.parcelDimension,
                        parcelDimensionUnit: ad.parcelDimensionUnit,
                        price: ad.price,
                        priceUnit: ad.priceUnit,
                        parcelPrice: ad.parcelPrice,
                        parcelPriceUnit: ad.parcelPriceUnit,
                        brandName: ad.brandName,
                        specifications: ad.specifications,
                        options: ad.options,
                        expiryTime: ad.expiryTime,
                        photos: ad.photos
                    }

                    resData.status = 'success';
                    res.json(resData);
                });
            });
        });
    });
});

router.post('/update-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            contentUnavailable: ""
        },
        name: "",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.data = {
            categories: data.categories,
            customCategories: data.customCategories,
            weightUnits: data.weightUnits,
            volumeUnits: data.volumeUnits,
            dimensionUnits: data.dimensionUnits,
            areaUnits: data.areaUnits,
            pricePer: data.pricePer,
            priceUnits: data.priceUnits
        }

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.email = user.email;

            if(!validator.isValidObjectID(req.body.adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            adModel.findById(req.body.adID).populate('shopID', 'sameAsShopOpeningHours openingHours midBreaks governmentCharge governmentChargeDescription governmentChargeRegNo extraCharge extraChargeDescription address instructions contactNo productReturnPolicy').exec((err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad || ad.isDeleted || ad.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.contentUnavailable = "Ad was not found!!";
                    return res.json(resData);
                }

                resData.adData = {
                    adName: ad.name,
                    brandName: ad.brandName,
                    price: ad.price,
                    priceUnit: ad.priceUnit,
                    pricePer: ad.pricePer,
                    parcelPrice: ad.parcelPrice,
                    parcelPriceUnit: ad.parcelPriceUnit,
                    options: ad.options,
                    available: ad.available,
                    coordinate: {
                        lat: ad.coordinate.coordinates[1],
                        long: ad.coordinate.coordinates[0]
                    },
                    address: ad.address,
                    location: ad.location,
                    category: ad.category,
                    subcategory: ad.subcategory,
                    description: ad.description,
                    condition: ad.condition,
                    for: ad.for,
                    parcel: ad.parcel,
                    weight: ad.weight,
                    weightUnit: ad.weightUnit,
                    parcelWeight: ad.parcelWeight,
                    parcelWeightUnit: ad.parcelWeightUnit,
                    volume: ad.volume,
                    volumeUnit: ad.volumeUnit,
                    dimension: ad.dimension,
                    dimensionUnit: ad.dimensionUnit,
                    parcelDimension: ad.parcelDimension,
                    parcelDimensionUnit: ad.parcelDimensionUnit,
                    area: ad.area,
                    areaUnit: ad.areaUnit,
                    numberOfPhotos: ad.numberOfPhotos,
                    avgRating: ad.avgRating,
                    numberOfRatings: ad.numberOfRatings,
                    shoppingCount: ad.shoppingCount,
                    createdOn: ad.createdOn,
                    specifications: ad.specifications,
                    numOfItems: ad.numOfItems,
                    numOfItemsPerOrder: ad.numOfItemsPerOrder,
                    leadTime: ad.leadTime,
                    expiryTime: ad.expiryTime,
                    extraChargeApplicable: ad.extraChargeApplicable,
                    governmentChargeApplicable: ad.governmentChargeApplicable,
                    productReturnApplicable: ad.productReturnApplicable,
                    discountTag: ad.discountTag,
                    showableDiscountTag: ad.showableDiscountTag,
                    originalPrice: ad.originalPrice,
                    originalParcelPrice: ad.originalParcelPrice,
                    discounts: ad.discounts,
                    photos: ad.photos,
                }
                if(!ad.shopID) {
                    resData.adData.instruction = ad.instruction;
                    resData.adData.contactNo = ad.contactNo;
                    resData.adData.availableHours = ad.availableHours;
                    resData.adData.midBreaks = ad.midBreaks;
                    resData.adData.extraCharge = ad.extraCharge;
                    resData.adData.extraChargeDescription = ad.extraChargeDescription;
                    resData.adData.governmentCharge = ad.governmentCharge;
                    resData.adData.governmentChargeDescription = ad.governmentChargeDescription;
                    resData.adData.governmentChargeRegNo = ad.governmentChargeRegNo;
                    resData.adData.processingCapacity = ad.processingCapacity;
                    resData.adData.productReturnPolicy = ad.productReturnPolicy;
                }
                else {
                    resData.adData.shopName = ad.shopName;
                    resData.adData.shopID = ad.shopID.id;
                    resData.adData.instruction = ad.shopID.instruction;
                    resData.adData.contactNo = ad.shopID.contactNo;
                    resData.adData.sameAsShopOpeningHours = ad.sameAsShopOpeningHours;
                    resData.adData.availableHours = ad.sameAsShopOpeningHours ? ad.shopID.openingHours : ad.availableHours;
                    resData.adData.midBreaks = ad.shopID.midBreaks;
                    resData.adData.extraCharge = ad.shopID.extraCharge;
                    resData.adData.extraChargeDescription = ad.shopID.extraChargeDescription;
                    resData.adData.governmentCharge = ad.shopID.governmentCharge;
                    resData.adData.governmentChargeDescription = ad.shopID.governmentChargeDescription;
                    resData.adData.governmentChargeRegNo = ad.shopID.governmentChargeRegNo;
                    resData.adData.processingCapacity = ad.shopID.processingCapacity;
                    resData.adData.productReturnPolicy = ad.shopID.productReturnPolicy;
                }

                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

router.post('/update-shop',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            contentUnavailable: ""
        },
        name: "",
        cartItemNumber: ""
    }

    storedInDatabaseModel.findOne({},(err,data) => {
        if(err || data === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.data = {
            categories: data.categories,
            shopCategories: data.shopCategories,
            customCategories: data.customCategories,
            weightUnits: data.weightUnits,
            volumeUnits: data.volumeUnits,
            dimensionUnits: data.dimensionUnits,
            areaUnits: data.areaUnits,
            pricePer: data.pricePer,
            priceUnits: data.priceUnits
        }

        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.email = user.email;

            shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!shop || shop.isDeleted || shop.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.contentUnavailable = "Shop was not found!!";
                    return res.json(resData);
                }

                resData.shopData = {
                    shopName: shop.name,
                    description: shop.description,
                    contactNo: shop.contactNo,
                    coordinate: {
                        lat: shop.coordinate.coordinates[1],
                        long: shop.coordinate.coordinates[0]
                    },
                    active: shop.active,
                    address: shop.address,
                    location: shop.location,
                    instruction: shop.instruction,
                    openingHours: shop.openingHours,
                    midBreaks: shop.midBreaks,
                    governmentCharge: shop.governmentCharge,
                    governmentChargeDescription: shop.governmentChargeDescription,
                    governmentChargeRegNo: shop.governmentChargeRegNo,
                    extraCharge: shop.extraCharge,
                    extraChargeDescription: shop.extraChargeDescription,
                    avgRating: shop.avgRating,
                    numberOfRatings: shop.numberOfRatings,
                    shoppingCount: shop.shoppingCount,
                    numberOfPhotos: shop.photos.length,
                    numberOfAds: shop.numberOfAds,
                    createdOn: shop.createdOn,
                    category: shop.category,
                    subcategory: shop.subcategory,
                    active: shop.active,
                    processingCapacity: shop.processingCapacity,
                    productReturnApplicable: shop.productReturnApplicable,
                    productReturnPolicy: shop.productReturnPolicy,
                    photos: shop.photos,
                    discounts: shop.discounts,
                    discountTag: shop.discountTag,
                    showableDiscountTag: shop.showableDiscountTag
                }

                resData.status = 'success';
                res.json(resData);
            });
        });
    });
});

module.exports = router;