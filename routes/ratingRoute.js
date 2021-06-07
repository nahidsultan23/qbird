const express = require('express');
const router = express.Router();
const adjustRatingCount = require('../helper/adjustRatingCount');
const prepareRatingOverview = require('../helper/prepareRatingOverview');


router.post('/shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        avgRating: 0,
        numberOfRatings: 0,
        userRating: 0
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!req.body.urlName || !req.body.rating || req.body.rating > 5 || req.body.rating < 1) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const shopModel = require('../models/shopModel');
        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err || shop === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            req.body.rating = parseInt(req.body.rating);

            if(req.body.orderID) {
                if(!validator.isValidObjectID(req.body.orderID)) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                var item = shop.ratings.find((item) => item.userID.toString() === user.id.toString() && item.orderID && item.orderID.toString() === req.body.orderID);
                if(item) {
                    resData.status = 'success';
                    res.json(resData);
                } else {
                    const orderModel = require('../models/orderModel');
                    orderModel.findById(req.body.orderID,(err,order) => {
                        if(err || !order || order.userID.toString() !== user.id.toString()) {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        shop.ratings.push({
                            userID: user.id,
                            rating: req.body.rating,
                            orderID: order.id
                        });
                        shop.avgRating = (shop.avgRating * shop.numberOfRatings + req.body.rating)/(shop.numberOfRatings + 1);
                        shop.numberOfRatings += 1;
                        adjustRatingCount(shop,req.body.rating);
                        
                        shop
                        .save()
                        .then(shop => {
                            resData.avgRating = shop.avgRating;
                            resData.numberOfRatings = shop.numberOfRatings;
                            var item = shop.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                            if(item)
                                resData.userRating = item.rating;

                            resData.ratingOverview = prepareRatingOverview(shop);
                            resData.status = 'success';
                            return res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    })
                }
            } else {
                var item = shop.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                if(item) {
                    shop.avgRating += (req.body.rating - item.rating) / shop.numberOfRatings;
                    adjustRatingCount(shop,req.body.rating,item.rating);
                    item.rating = req.body.rating;
                    item.time = new Date();
                } else {
                    shop.ratings.push({
                        userID: user.id,
                        rating: req.body.rating
                    });
                    shop.avgRating = (shop.avgRating * shop.numberOfRatings + req.body.rating)/(shop.numberOfRatings + 1);
                    shop.numberOfRatings += 1;
                    adjustRatingCount(shop,req.body.rating);
                }
            
                shop
                .save()
                .then(shop => {
                    resData.avgRating = shop.avgRating;
                    resData.numberOfRatings = shop.numberOfRatings;
                    resData.userRating = req.body.rating;
                    resData.ratingOverview = prepareRatingOverview(shop);
                    resData.status = 'success';
                    return res.json(resData);
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

router.post('/ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        avgRating: 0,
        numberOfRatings: 0,
        userRating: 0
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.adID) || !req.body.rating || req.body.rating > 5 || req.body.rating < 1) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const adModel = require('../models/adModel');
        adModel.findById(req.body.adID,(err,ad) => {
            if(err || ad === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            req.body.rating = parseInt(req.body.rating);

            if(req.body.orderID) {
                if(!validator.isValidObjectID(req.body.orderID)) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                var item = ad.ratings.find((item) => item.userID.toString() === user.id.toString() && item.orderID && item.orderID.toString() === req.body.orderID);
                if(item) {
                    resData.status = 'success';
                    res.json(resData);
                } else {
                    const orderModel = require('../models/orderModel');
                    orderModel.findById(req.body.orderID,(err,order) => {
                        if(err || !order || order.userID.toString() !== user.id.toString()) {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        ad.ratings.push({
                            userID: user.id,
                            rating: req.body.rating,
                            orderID: order.id
                        });
                        ad.avgRating = (ad.avgRating * ad.numberOfRatings + req.body.rating)/(ad.numberOfRatings + 1);
                        ad.numberOfRatings += 1;
                        adjustRatingCount(ad,req.body.rating);
                        
                        ad
                        .save()
                        .then(ad => {
                            resData.avgRating = ad.avgRating;
                            resData.numberOfRatings = ad.numberOfRatings;
                            var item = ad.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                            if(item)
                                resData.userRating = item.rating;

                            resData.ratingOverview = prepareRatingOverview(ad);
                            resData.status = 'success';
                            return res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    })
                }
            } else {
                var item = ad.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                if(item) {
                    ad.avgRating += (req.body.rating - item.rating) / ad.numberOfRatings;
                    adjustRatingCount(ad,req.body.rating,item.rating);
                    item.rating = req.body.rating;
                    item.time = new Date();
                } else {
                    ad.ratings.push({
                        userID: user.id,
                        rating: req.body.rating
                    });
                    ad.avgRating = (ad.avgRating * ad.numberOfRatings + req.body.rating)/(ad.numberOfRatings + 1);
                    ad.numberOfRatings += 1;
                    adjustRatingCount(ad,req.body.rating);
                }
            
                ad
                .save()
                .then(ad => {
                    resData.avgRating = ad.avgRating;
                    resData.numberOfRatings = ad.numberOfRatings;
                    resData.userRating = req.body.rating;
                    resData.ratingOverview = prepareRatingOverview(ad);

                    resData.status = 'success';
                    return res.json(resData);
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

module.exports = router;