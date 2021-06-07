const express = require('express');
const router = express.Router();
const sendComments = require('../helper/sendComments');
const isAuthenticated = require('../helper/isAuthenticated');
const validator = require('../helper/validationHelper');
const getPublicAvailableStatus = require('../helper/getPublicAvailableStatus');
const getShopPublicStatus = require('../helper/getShopPublicStatus');
const shopModel = require('../models/shopModel');
const adModel = require('../models/adModel');
const adjustRatingCount = require('../helper/adjustRatingCount');
const prepareRatingOverview = require('../helper/prepareRatingOverview');

router.post('/shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        userRating: 0,
        ownerID: "",
        ownerName: "",
        name: "",
        cartItemNumber: "",
        ads: []
    }

    shopModel.findOne({urlName: req.body.urlName}).populate('userID','name phoneNumber countryCode').exec(async (err,shop) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else if(!shop || shop.isDeleted) {
            resData.errorMessage.contentUnavailable = "Shop was not found!!";
            return res.json(resData);
        }

        if(shop.userID) {
            resData.ownerID = shop.userID._id;
            resData.ownerName = shop.userID.name;
        }
        resData.shopName = shop.name;
        resData.description = shop.description;
        resData.contactNo = shop.contactNo;
        resData.coordinate = {
            lat: shop.coordinate.coordinates[1],
            long: shop.coordinate.coordinates[0]
        };
        resData.active = getShopPublicStatus(shop);
        resData.address = shop.address;
        resData.location = shop.location;
        resData.instruction = shop.instruction;
        resData.openingHours = shop.openingHours;
        resData.midBreaks = shop.midBreaks;
        resData.governmentCharge = shop.governmentCharge;
        resData.governmentChargeDescription = shop.governmentChargeDescription;
        resData.governmentChargeRegNo = shop.governmentChargeRegNo;
        resData.extraCharge = shop.extraCharge;
        resData.extraChargeDescription = shop.extraChargeDescription;
        resData.avgRating = shop.avgRating;
        resData.numberOfRatings = shop.numberOfRatings;
        resData.shoppingCount = shop.shoppingCount;
        resData.numberOfPhotos = shop.photos.length;
        resData.numberOfAds = shop.numberOfAds;
        resData.createdOn = shop.createdOn;
        resData.processingCapacity = shop.processingCapacity;
        resData.productReturnApplicable = shop.productReturnApplicable;
        resData.productReturnPolicy = shop.productReturnPolicy;
        resData.discounts = shop.discounts;
        resData.discountTag = shop.discountTag;
        resData.showableDiscountTag = shop.showableDiscountTag;
        resData.photos = shop.photos;
        resData.category = shop.category;
        resData.subcategory = shop.subcategory;

        if(!shop.ratingCount) {
            adjustRatingCount(shop);
            await shop.save();
        }
        resData.ratingOverview = prepareRatingOverview(shop);

        adModel.find(
            {
                shopID: shop.id,
                isDeleted: false
            },
            {
                name: 1,
                category: 1,
                subcategory: 1,
                condition: 1,
                for: 1,
                price: 1,
                originalPrice: 1,
                showableDiscountTag: 1,
                pricePer: 1,
                description: 1,
                avgRating: 1,
                shopName: 1,
                address: 1,
                location: 1,
                coordinate: 1,
                contactNo: 1,
                shopID: 1,
                photos: 1
            }
        )
        .exec((err,results) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            results.forEach(item => {
                resData.ads.push({
                    adID: item._id,
                    adName: item.name,
                    category: item.category,
                    subcategory: item.subcategory,
                    condition: item.condition,
                    for: item.for,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    showableDiscountTag: item.showableDiscountTag,
                    pricePer: item.pricePer,
                    description: item.description,
                    rating: item.avgRating,
                    photo: item.photos ? item.photos[0] : null
                });
            });

            const shuffle = require('shuffle-array');
            resData.ads = shuffle(resData.ads);

            resData.status = "success";
            isAuthenticated(req,res,resData,(user) => {
                let userID = "";
                if(user) {
                    var item = shop.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                    if(item)
                        resData.userRating = item.rating;
                    userID = user.id;
                    resData.name = user.name;
                    resData.cartItemNumber = user.cartItemNumber;
                }
                sendComments(shop.id,"shop",req,res,resData,shop.name,userID,(req,res,resData) => {res.json(resData);});
            });
        });
    });
});

router.post('/ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        userRating: 0,
        shopID: "",
        shopName: "",
        midBreaks: "",
        ownerID: "",
        ownerName: "",
        name: "",
        cartItemNumber: "",
        adsFromThisShop: []
    } 

    var adID = req.body.adID;
    if(!validator.isValidObjectID(adID)) {
        resData.errorMessage.contentUnavailable = "Ad was not found!!";
        return res.json(resData);
    }

    adModel.findById(adID)
    .populate('userID','name phoneNumber countryCode')
    .populate('shopID','urlName discounts showableDiscountTag processingCapacity productReturnApplicable productReturnPolicy name openingHours midBreaks instruction extraCharge extraChargeDescription governmentCharge governmentChargeDescription governmentChargeRegNo active forceOpen contactNo preOrderPermission preOrder')
    .exec(async (err,ad) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else if(!ad || ad.isDeleted) {
            resData.errorMessage.contentUnavailable = "Ad was not found!!";
            return res.json(resData);
        }

        resData.extraChargeApplicable = ad.extraChargeApplicable;
        resData.governmentChargeApplicable = ad.governmentChargeApplicable;
        resData.productReturnApplicable = ad.productReturnApplicable;
        let shop = null;
        if(ad.shopID) {
            shop = ad.shopID;
            if(ad.sameAsShopOpeningHours) {
                resData.availableHours = shop.openingHours;
            }
            else {
                resData.availableHours = ad.availableHours;
            }
            resData.midBreaks = shop.midBreaks;
            resData.instruction = shop.instruction;
            resData.contactNo = shop.contactNo;
            resData.shopID = shop._id;
            resData.urlName = shop.urlName;
            resData.shopName = shop.name;
            resData.processingCapacity = shop.processingCapacity;
            resData.productReturnPolicy = shop.productReturnPolicy;
            resData.extraCharge = shop.extraCharge;
            resData.extraChargeDescription = shop.extraChargeDescription;
            resData.governmentCharge = shop.governmentCharge;
            resData.governmentChargeDescription = shop.governmentChargeDescription;
            resData.governmentChargeRegNo = shop.governmentChargeRegNo;
            resData.shopDiscounts = shop.discounts;
            resData.showableShopDiscountTag = shop.showableDiscountTag;

            const preOrderCheck = require('../helper/preOrderCheck');
            resData.preOrder = preOrderCheck(ad,shop);

            let adsOfSameShop = await adModel.find(
                {
                    shopID: shop.id,
                    isDeleted: false
                },
                {
                    name: 1,
                    category: 1,
                    subcategory: 1,
                    condition: 1,
                    for: 1,
                    price: 1,
                    originalPrice: 1,
                    showableDiscountTag: 1,
                    pricePer: 1,
                    description: 1,
                    avgRating: 1,
                    shopName: 1,
                    address: 1,
                    location: 1,
                    coordinate: 1,
                    contactNo: 1,
                    shopID: 1,
                    photos: 1
                }
            );
            if(adsOfSameShop) {
                adsOfSameShop.forEach(item => {
                    if(item.id.toString() === adID.toString()) return;

                    resData.adsFromThisShop.push({
                        adID: item._id,
                        adName: item.name,
                        category: item.category,
                        subcategory: item.subcategory,
                        condition: item.condition,
                        for: item.for,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        showableDiscountTag: item.showableDiscountTag,
                        pricePer: item.pricePer,
                        description: item.description,
                        rating: item.avgRating,
                        photo: item.photos ? item.photos[0] : null
                    });
                });
            }
        }
        else {
            resData.availableHours = ad.availableHours;
            resData.midBreaks = ad.midBreaks;
            resData.instruction = ad.instruction;
            resData.contactNo = ad.contactNo;
            resData.extraCharge = ad.extraCharge;
            resData.extraChargeDescription = ad.extraChargeDescription;
            resData.governmentCharge = ad.governmentCharge;
            resData.governmentChargeDescription = ad.governmentChargeDescription;
            resData.governmentChargeRegNo = ad.governmentChargeRegNo;
            resData.processingCapacity = ad.processingCapacity;
            resData.productReturnPolicy = ad.productReturnPolicy;
            resData.preOrder = false;
        }

        resData.available = getPublicAvailableStatus(ad,shop);
        if(ad.userID) {
            resData.ownerID = ad.userID._id;
            resData.ownerName = ad.userID.name;
        }
        resData.adName = ad.name;
        resData.brandName = ad.brandName;
        resData.price = ad.price;
        resData.priceUnit = ad.priceUnit;
        resData.pricePer = ad.pricePer;
        resData.parcelPrice = ad.parcelPrice;
        resData.parcelPriceUnit = ad.parcelPriceUnit;
        resData.options = ad.options;
        resData.coordinate = {
            lat: ad.coordinate.coordinates[1],
            long: ad.coordinate.coordinates[0]
        },
        resData.address = ad.address;
        resData.location = ad.location;
        resData.category = ad.category;
        resData.subcategory = ad.subcategory;
        resData.description = ad.description;
        resData.condition = ad.condition;
        resData.for = ad.for;
        resData.parcel = ad.parcel;
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
        resData.area = ad.area;
        resData.areaUnit = ad.areaUnit;
        resData.numberOfPhotos = ad.photos.length;
        resData.avgRating = ad.avgRating;
        resData.numberOfRatings = ad.numberOfRatings;
        resData.shoppingCount = ad.shoppingCount;
        resData.createdOn = ad.createdOn;
        resData.specifications = ad.specifications;
        resData.numOfItems = ad.numOfItems;
        resData.numOfItemsPerOrder = ad.numOfItemsPerOrder;
        resData.leadTime = ad.leadTime;
        resData.expiryTime = ad.expiryTime;
        resData.discountTag = ad.discountTag;
        resData.showableDiscountTag = ad.showableDiscountTag;
        resData.originalPrice = ad.originalPrice;
        resData.originalParcelPrice = ad.originalParcelPrice;
        resData.discounts = ad.discounts;
        resData.photos = ad.photos;
        if(!ad.ratingCount) {
            adjustRatingCount(ad);
            await ad.save();
        }
        resData.ratingOverview = prepareRatingOverview(ad);

        resData.status = "success";
        isAuthenticated(req,res,resData,(user) => {
            let userID = "";
            if(user) {
                var item = ad.ratings.find((item) => item.userID.toString() === user.id.toString() && !item.orderID);
                if(item)
                    resData.userRating = item.rating;
                userID = user.id;
                resData.name = user.name;
                resData.cartItemNumber = user.cartItemNumber;
            }
            sendComments(ad.id,"ad",req,res,resData,ad.name,userID,(req,res,resData) => {res.json(resData);});
        });
    });
});

module.exports = router;