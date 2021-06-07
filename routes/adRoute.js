const express = require('express');
const router = express.Router();
const isLoggedIn = require('../helper/isLoggedIn');
const validator = require('../helper/validationHelper');
const validatePhotoList = require('../validation/PhotoListValidation');
const storedInDatabaseModel = require('../models/storedInDatabaseModel');
const attachDemoPhoto = require('../helper/attachDemoPhoto');
const adModel = require('../models/adModel');
const shopModel = require('../models/shopModel');
const compareOptions = require('../helper/compareOptions');
const compareWeeklyPeriod = require('../helper/compareWeeklyPeriod');
const compareDiscountData = require('../helper/compareDiscountData');
const compareSpecifications = require('../helper/compareSpecifications');
const fetchLocation = require('../helper/fetchLocation');
const getPublicAvailableStatus = require('../helper/getPublicAvailableStatus');
const fetchAdCategories = require('../helper/fetchAddCategories');
const addThousandSeparator = require('../helper/addThousandSeparator');
const adjustRatingCount = require('../helper/adjustRatingCount');
const prepareRatingOverview = require('../helper/prepareRatingOverview');

const prepareDiscountData = (ad) => {
    let originalPrice = ad.price;
    let originalParcelPrice = ad.parcelPrice;
    let showableDiscountTag = '';

    ad.discounts.forEach(discount => {
        if(discount.discountOn === 'Price') {
            if(discount.discountType === 'Percentage') {
                ad.price *= (100 - discount.discount)/100;

                if(!showableDiscountTag)
                    showableDiscountTag = discount.discount + '% off';
            }
            else {
                ad.price -= discount.discount;
                if(ad.price < 0)
                    ad.price = 0;

                if(!showableDiscountTag)
                    showableDiscountTag = 'BDT ' + addThousandSeparator(discount.discount) + ' off';
            }
        }
        else if(discount.discountOn === 'Shippable Product Price') {
            if(discount.discountType === 'Percentage') {
                ad.price *= (100 - discount.discount)/100;
                ad.parcelPrice *= (100 - discount.discount)/100;

                if(!showableDiscountTag)
                    showableDiscountTag = discount.discount + '% off';
            }
            else {
                ad.price -= discount.discount;
                if(ad.price < 0) {
                    ad.parcelPrice += ad.price;
                    ad.price = 0;
                }
                if(ad.parcelPrice < 0)
                    ad.parcelPrice = 0;

                if(!showableDiscountTag)
                    showableDiscountTag = 'BDT ' + addThousandSeparator(discount.discount) + ' off';
            }
        }
    })

    ad.originalPrice = ad.price !== originalPrice ? originalPrice : undefined;
    ad.originalParcelPrice = ad.parcelPrice !== originalParcelPrice ? originalParcelPrice : undefined;
    ad.showableDiscountTag = ad.discountTag ? ad.discountTag : showableDiscountTag;
}

const prepareSearchString = (ad) => {
    var searchString = "";
    if(ad.name)
        searchString += ad.name;
    if(ad.category)
        searchString += " " + ad.category;
    if(ad.subcategory)
        searchString += " " + ad.subcategory;
    if(ad.description)
        searchString += " " +  ad.description;
    if(ad.weight)
        searchString += " " +  ad.weight;
    if(ad.weightUnit)
        searchString += " " +  ad.weightUnit;
    if(ad.volume)
        searchString += " " +  ad.volume;
    if(ad.volumeUnit)
        searchString += " " +  ad.volumeUnit;
    if(ad.area)
        searchString += " " +  ad.area;
    if(ad.areaUnit)
        searchString += " " +  ad.areaUnit;
    if(ad.price)
        searchString += " " +  ad.price;
    if(ad.priceUnit)
        searchString += " " +  ad.priceUnit;
    if(ad.brandName)
        searchString += " " +  ad.brandName;
    if(ad.specifications) {
        ad.specifications.forEach(item => {
            searchString += " " +  item.specificationName + " " + item.specification;
        });
    }
    if(ad.shopName)
        searchString += " " +  ad.shopName;

    ad.searchString = searchString;
}

const CreateNewAd = (req,res,resData) => {
    let radFactor = Math.PI / 180;
    req.body.demoPhotos.push(...req.body.photos);
    var ad = {
        userID: req.body.userID,
        shopID: req.body.shopID,
        name: req.body.name,
        category: req.body.category,
        subcategory: req.body.subcategory,
        options: req.body.options,
        description: req.body.description,
        contactNo: req.body.contactNo,
        coordinate: req.body.coordinate,
        coordinateRad: [req.body.coordinate.coordinates[1] * radFactor, req.body.coordinate.coordinates[0] * radFactor],
        location: req.body.location,
        address: req.body.address,
        instruction: req.body.instruction,
        condition: req.body.condition,
        for: req.body.for,
        parcel: req.body.parcel,
        sameAsShopOpeningHours: req.body.sameAsShopOpeningHours,
        availableHours: req.body.availableHours,
        weight: req.body.weight,
        weightUnit: req.body.weightUnit,
        parcelWeight: req.body.parcelWeight,
        parcelWeightInKg: req.body.parcelWeightInKg,
        parcelWeightUnit: req.body.parcelWeightUnit,
        volume: req.body.volume,
        volumeUnit: req.body.volumeUnit,
        dimension: req.body.dimension,
        dimensionUnit: req.body.dimensionUnit,
        parcelDimension: req.body.parcelDimension,
        parcelDimensionUnit: req.body.parcelDimensionUnit,
        area: req.body.area,
        areaUnit: req.body.areaUnit,
        price: req.body.price,
        priceUnit: req.body.priceUnit,
        pricePer: req.body.pricePer,
        parcelPrice: req.body.parcelPrice,
        parcelPriceUnit: req.body.parcelPriceUnit,
        governmentChargeApplicable: req.body.governmentChargeApplicable,
        governmentCharge: req.body.governmentCharge,
        governmentChargeDescription: req.body.governmentChargeDescription,
        governmentChargeRegNo: req.body.governmentChargeRegNo,
        extraChargeApplicable: req.body.extraChargeApplicable,
        extraCharge: req.body.extraCharge,
        extraChargeDescription: req.body.extraChargeDescription,
        photos: req.body.demoPhotos,
        shopName: req.body.shopName,
        midBreakApplicable: req.body.midBreakApplicable,
        midBreaks: req.body.midBreaks,
        brandName: req.body.brandName,
        specifications: req.body.specifications,
        numOfItems: req.body.numOfItems,
        numOfItemsPerOrder: req.body.numOfItemsPerOrder,
        leadTime: req.body.leadTime,
        expiryTime: req.body.expiryTime,
        processingCapacity: req.body.processingCapacity,
        productReturnApplicable: req.body.productReturnApplicable,
        productReturnPolicy: req.body.productReturnPolicy,
        discounts: req.body.discounts,
        discountTag: req.body.discountTag,
    };

    prepareDiscountData(ad);
    prepareSearchString(ad);

    new adModel(ad)
    .save()
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

router.post('/create-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            type: "",
            shopID: "",
            name: "",
            category: "",
            subcategory: "",
            options: "",
            description: "",
            contactNo: "",
            condition: "",
            for: "",
            weight: "",
            weightUnit: "",
            parcelWeight: "",
            parcelWeightUnit: "",
            volume: "",
            volumeUnit: "",
            dimension: "",
            dimensionUnit: "",
            parcelDimension: "",
            parcelDimensionUnit: "",
            area: "",
            areaUnit: "",
            price: "",
            priceUnit: "",
            pricePer: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            governmentCharge: "",
            governmentChargeDescription: "",
            governmentChargeRegNo: "",
            extraCharge: "",
            extraChargeDescription: "",
            coordinate: "",
            address: "",
            instruction: "",
            availableHours: "",
            photos: "",
            midBreaks: "",
            specifications: "",
            numOfItems: "",
            numOfItemsPerOrder: "",
            leadTime: "",
            expiryTime: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const validateAdCreateInput = require('../validation/AdCreateValidation');
        var isValid = validateAdCreateInput(req.body,resData.errorMessage,optionData);
        if(!isValid)
            return res.json(resData);

        isLoggedIn(req,res,resData,(user) => {
            req.body.userID = user.id;

            if(req.body.type === "Shop Ad") {
                shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
                    if(err) {
                        console.log(err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    if(!shop) {
                        resData.errorMessage.contentUnavailable = "Shop was not found!!";
                        return res.json(resData);
                    }
                    if(shop.userID.toString() !== user.id.toString()) {
                        resData.errorMessage.fatalError = "Access denied";
                        return res.json(resData);
                    }

                    const checkAvailablePeriodConflict = require('../helper/checkAvailablePeriodConflict');
                    if(checkAvailablePeriodConflict(shop.openingHours, req.body.availableHours)) {
                        resData.errorMessage.availableHours = "Conflicts with shop opening hours!!";
                        return res.json(resData);
                    }

                    req.body.shopID = shop.id;
                    req.body.coordinate = shop.coordinate;
                    req.body.location = shop.location;
                    req.body.address = shop.address; 
                    req.body.shopName = shop.name;

                    attachDemoPhoto(req.body.demoPhotos,res,resData,(res,resData) => {
                        validatePhotoList(req,res,resData,'ad',(req,res,resData) => {
                            shop.numberOfAds += 1;
                            shop
                            .save()
                            .then(shop => {
                                CreateNewAd(req,res,resData)
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        });
                    });
                });
            } else {
                req.body.shopID = undefined;
                fetchLocation(req,(outsideBD) => {
                    if(outsideBD) {
                        resData.errorMessage.coordinate = "Location must be within the area of Bangladesh";
                        return res.json(resData);
                    }
                    req.body.coordinate =  {
                        type: "Point",
                        coordinates: [
                            req.body.coordinate.long,
                            req.body.coordinate.lat
                        ]
                    };

                    attachDemoPhoto(req.body.demoPhotos,res,resData,(res,resData) => {
                        validatePhotoList(req,res,resData,'ad',CreateNewAd);
                    });
                });
            }
        });
    });
});

router.post('/attach-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            shopID: "",
            name: "",
            category: "",
            subcategory: "",
            options: "",
            description: "",
            contactNo: "",
            condition: "",
            for: "",
            weight: "",
            weightUnit: "",
            parcelWeight: "",
            parcelWeightUnit: "",
            volume: "",
            volumeUnit: "",
            dimension: "",
            dimensionUnit: "",
            parcelDimension: "",
            parcelDimensionUnit: "",
            area: "",
            areaUnit: "",
            price: "",
            priceUnit: "",
            pricePer: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            availableHours: "",
            photos: "",
            specifications: "",
            numOfItems: "",
            numOfItemsPerOrder: "",
            leadTime: "",
            expiryTime: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        req.body.type = "Shop Ad";
        const validateAdCreateInput = require('../validation/AdCreateValidation');
        var isValid = validateAdCreateInput(req.body,resData.errorMessage,optionData);
        if(!isValid)
            return res.json(resData);

        isLoggedIn(req,res,resData,(user) => {
            req.body.userID = user.id;

            shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!shop) {
                    resData.errorMessage.contentUnavailable = "Shop was not found!!";
                    return res.json(resData);
                }
                if(shop.isDeleted) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(shop.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Access denied";
                    return res.json(resData);
                }

                const checkAvailablePeriodConflict = require('../helper/checkAvailablePeriodConflict');
                if(checkAvailablePeriodConflict(shop.openingHours, req.body.availableHours)) {
                    resData.errorMessage.availableHours = "Conflicts with shop opening hours!!";
                    return res.json(resData);
                }

                req.body.shopID = shop.id;
                req.body.coordinate = shop.coordinate;
                req.body.location = shop.location;
                req.body.address = shop.address;
                req.body.shopName = shop.name;

                attachDemoPhoto(req.body.demoPhotos,res,resData,(res,resData) => {
                    validatePhotoList(req,res,resData,'ad',(req,res,resData) => {
                        shop.numberOfAds += 1;
                        shop
                        .save()
                        .then(shop => {
                            CreateNewAd(req,res,resData)
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

router.post('/create-individual-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            name: "",
            category: "",
            subcategory: "",
            options: "",
            description: "",
            contactNo: "",
            condition: "",
            for: "",
            weight: "",
            weightUnit: "",
            parcelWeight: "",
            parcelWeightUnit: "",
            volume: "",
            volumeUnit: "",
            dimension: "",
            dimensionUnit: "",
            parcelDimension: "",
            parcelDimensionUnit: "",
            area: "",
            areaUnit: "",
            price: "",
            priceUnit: "",
            pricePer: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            governmentCharge: "",
            governmentChargeDescription: "",
            governmentChargeRegNo: "",
            extraCharge: "",
            extraChargeDescription: "",
            coordinate: "",
            address: "",
            instruction: "",
            availableHours: "",
            photos: "",
            midBreaks: "",
            specifications: "",
            numOfItems: "",
            numOfItemsPerOrder: "",
            leadTime: "",
            expiryTime: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        req.body.type = "Individual Ad";
        const validateAdCreateInput = require('../validation/AdCreateValidation');
        var isValid = validateAdCreateInput(req.body,resData.errorMessage,optionData);
        if(!isValid)
            return res.json(resData);

        isLoggedIn(req,res,resData,(user) => {
            fetchLocation(req,(outsideBD) => {
                if(outsideBD) {
                    resData.errorMessage.coordinate = "Location must be within the area of Bangladesh";
                    return res.json(resData);
                }
                req.body.userID = user.id;
                req.body.shopID = undefined;
                req.body.coordinate =  {
                    type: "Point",
                    coordinates: [
                        req.body.coordinate.long,
                        req.body.coordinate.lat
                    ]
                };

                attachDemoPhoto(req.body.demoPhotos,res,resData,(res,resData) => {
                    validatePhotoList(req,res,resData,'ad',CreateNewAd);
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
            authError: ""
        },
        name: "",
        cartItemNumber: ""
    };
    
    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        resData.categories = optionData.categories;
        isLoggedIn(req,res,resData,(user) => {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;

            var adID = req.body.adID;
            if(!validator.isValidObjectID(adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            adModel.findById(adID).populate('shopID', 'urlName discounts showableDiscountTag processingCapacity productReturnApplicable productReturnPolicy name instruction openingHours midBreaks extraCharge extraChargeDescription governmentCharge governmentChargeDescription governmentChargeRegNo active forceOpen contactNo').exec(async (err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "No ad found!!";
                    return res.json(resData);
                }
                if(!ad || ad.isDeleted || ad.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.contentUnavailable = "Ad was not found!!";
                    return res.json(resData);
                }

                resData.type = ad.type;
                resData.adName = ad.name;
                resData.brandName = ad.brandName;
                resData.price = ad.price;
                resData.priceUnit = ad.priceUnit;
                resData.pricePer = ad.pricePer;
                resData.parcelPrice = ad.parcelPrice;
                resData.parcelPriceUnit = ad.parcelPriceUnit;
                resData.options = ad.options;
                resData. coordinate = {
                    lat: ad.coordinate.coordinates[1],
                    long: ad.coordinate.coordinates[0]
                };
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
                resData.numberOfPhotos = ad.numberOfPhotos;
                resData.avgRating = ad.avgRating;
                resData.numberOfRatings = ad.numberOfRatings;
                resData.shoppingCount = ad.shoppingCount;
                resData.createdOn = ad.createdOn;
                resData.specifications = ad.specifications;
                resData.numOfItems = ad.numOfItems;
                resData.numOfItemsPerOrder = ad.numOfItemsPerOrder;
                resData.leadTime = ad.leadTime;
                resData.expiryTime = ad.expiryTime;
                resData.extraChargeApplicable = ad.extraChargeApplicable;
                resData.governmentChargeApplicable = ad.governmentChargeApplicable;
                resData.productReturnApplicable = ad.productReturnApplicable;
                resData.discountTag = ad.discountTag;
                resData.showableDiscountTag = ad.showableDiscountTag;
                resData.originalPrice = ad.originalPrice;
                resData.originalParcelPrice = ad.originalParcelPrice;
                resData.discounts = ad.discounts;
                resData.photos = ad.photos;
                resData.available = ad.available;
                let shop = null;
                if(ad.shopID) {
                    shop = ad.shopID;
                    resData.availableHours = ad.sameAsShopOpeningHours ? shop.openingHours : ad.availableHours;
                    resData.midBreaks = shop.midBreaks;
                    resData.instruction = shop.instruction;
                    resData.contactNo = shop.contactNo;
                    resData.extraCharge = shop.extraCharge;
                    resData.extraChargeDescription = shop.extraChargeDescription;
                    resData.governmentCharge = shop.governmentCharge;
                    resData.governmentChargeDescription = shop.governmentChargeDescription;
                    resData.governmentChargeRegNo = shop.governmentChargeRegNo;
                    resData.shopID = shop._id;
                    resData.urlName = shop.urlName;
                    resData.shopName = shop.name;
                    resData.shopDiscounts = shop.discounts;
                    resData.showableShopDiscountTag = shop.showableDiscountTag;

                    resData.processingCapacity = shop.processingCapacity;
                    resData.productReturnPolicy = shop.productReturnPolicy;
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
                }
                resData.publicAvailableStatus = getPublicAvailableStatus(ad,shop);
                if(!ad.ratingCount) {
                    adjustRatingCount(ad);
                    await ad.save();
                }
                resData.ratingOverview = prepareRatingOverview(ad);

                const sendComments = require('../helper/sendComments');
                sendComments(ad.id,"ad",req,res,resData,ad.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/all-ads-of-account-shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        ads: [],
        name: "",
        cartItemNumber: ""
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;

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

            let query = [{isDeleted: false},{userID: user.id},{shopID: shop.id}];

            if(typeof req.body.searchString === "string") {
                var token = req.body.searchString.split(" ");
                token.forEach(element => {
                    query.push({searchString: new RegExp(element,'i')});
                });
            }
            if(req.body.for === 'Rent' || req.body.for === 'Sale' )
                query.push({ for: req.body.for });

            if(req.body.category && req.body.category !== "All")
                query.push({ category: req.body.category });

            if(req.body.subcategory && req.body.subcategory !== "All")
                query.push({ subcategory: req.body.subcategory });

            if(req.body.condition && req.body.condition !== "All")
                query.push({ condition: req.body.condition });

            adModel.find({$and: query},(err,ads) => {
                if(err || ads === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                fetchAdCategories(res,resData,{shopID: shop.id,isDeleted: false},() => {
                    resData.shopName = shop.name;
                    resData.shopAddress = shop.address;
                    resData.showableShopDiscountTag = shop.showableDiscountTag;
                    resData.coordinate = {
                        lat: shop.coordinate.coordinates[1],
                        long: shop.coordinate.coordinates[0]
                    },
                    resData.numberOfAds = shop.numberOfAds;

                    for(var i = ads.length-1; i >= 0; i--) {
                        resData.ads.push({
                            adID: ads[i]._id,
                            adName: ads[i].name,
                            category: ads[i].category,
                            subcategory: ads[i].subcategory,
                            condition: ads[i].condition,
                            for: ads[i].for,
                            price: ads[i].price,
                            originalPrice: ads[i].originalPrice,
                            showableDiscountTag: ads[i].showableDiscountTag,
                            pricePer: ads[i].pricePer,
                            description: ads[i].description,
                            rating: ads[i].avgRating,
                            photo: ads[i].photos ? ads[i].photos[0] : null
                        });
                    }

                    resData.status = "success";
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/all-ads',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        ads: [],
        name: "",
        cartItemNumber: ""
    } 

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;

        shopModel.count({userID: user.id,isDeleted: false}).exec((err,shopCount) => {
            if(err) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            adModel.count({userID: user.id,isDeleted: false,shopID: null}).exec((err,individualAdCount) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                let query = [{isDeleted: false},{userID: user.id}];

                if(typeof req.body.searchString === "string") {
                    var token = req.body.searchString.split(" ");
                    token.forEach(element => {
                        query.push({searchString: new RegExp(element,'i')});
                    });
                }
                if(req.body.for === 'Rent' || req.body.for === 'Sale' )
                    query.push({ for: req.body.for });

                if(req.body.category && req.body.category !== "All")
                    query.push({ category: req.body.category });

                if(req.body.subcategory && req.body.subcategory !== "All")
                    query.push({ subcategory: req.body.subcategory });

                if(req.body.condition && req.body.condition !== "All")
                    query.push({ condition: req.body.condition });

                adModel.find({$and: query})
                .populate('shopID','showableDiscountTag')
                .exec((err,ads) => {
                    if(err || ads === null) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    fetchAdCategories(res,resData,{userID: user.id,isDeleted: false},() => {
                        resData.numberOfShops = shopCount;
                        resData.numberOfIndividualAds = individualAdCount;

                        for(var i = ads.length-1; i >= 0; i--) {
                            resData.ads.push({
                                adID: ads[i]._id,
                                adName: ads[i].name,
                                condition: ads[i].condition,
                                for: ads[i].for,
                                price: ads[i].price,
                                originalPrice: ads[i].originalPrice,
                                showableDiscountTag: ads[i].showableDiscountTag,
                                showableShopDiscountTag: ads[i].shopID ? ads[i].shopID.showableDiscountTag : '',
                                pricePer: ads[i].pricePer,
                                description: ads[i].description,
                                rating: ads[i].avgRating,
                                photo: ads[i].photos ? ads[i].photos[0] : null
                            });
                        }

                        resData.status = "success";
                        return res.json(resData);
                    });
                });
            });
        });
    });
});

router.post('/individual-ads',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        ads: [],
        name: "",
        cartItemNumber: ""
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;

        let query = [{isDeleted: false},{userID: user.id},{shopID: null}];

        if(typeof req.body.searchString === "string") {
            var token = req.body.searchString.split(" ");
            token.forEach(element => {
                query.push({searchString: new RegExp(element,'i')});
            });
        }
        if(req.body.for === 'Rent' || req.body.for === 'Sale' )
            query.push({ for: req.body.for });

        if(req.body.category && req.body.category !== "All")
            query.push({ category: req.body.category });

        if(req.body.subcategory && req.body.subcategory !== "All")
            query.push({ subcategory: req.body.subcategory });

        if(req.body.condition && req.body.condition !== "All")
            query.push({ condition: req.body.condition });

        adModel.find({$and: query},(err,ads) => {
            if(err || ads === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            fetchAdCategories(res,resData,{userID: user.id,shopID: null,isDeleted: false},() => {
                for(var i = ads.length-1; i >= 0; i--) {
                    resData.ads.push({
                        adID: ads[i]._id,
                        adName: ads[i].name,
                        condition: ads[i].condition,
                        for: ads[i].for,
                        price: ads[i].price,
                        originalPrice: ads[i].originalPrice,
                        showableDiscountTag: ads[i].showableDiscountTag,
                        pricePer: ads[i].pricePer,
                        description: ads[i].description,
                        rating: ads[i].avgRating,
                        photo: ads[i].photos ? ads[i].photos[0] : null
                    });
                }

                resData.status = "success";
                return res.json(resData);
            });
        });
    });
});

router.post('/update-shop-ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            shopID: "",
            category: "",
            subcategory: "",
            options: "",
            description: "",
            contactNo: "",
            condition: "",
            for: "",
            weight: "",
            weightUnit: "",
            parcelWeight: "",
            parcelWeightUnit: "",
            volume: "",
            volumeUnit: "",
            dimension: "",
            dimensionUnit: "",
            parcelDimension: "",
            parcelDimensionUnit: "",
            area: "",
            areaUnit: "",
            price: "",
            priceUnit: "",
            pricePer: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            availableHours: "",
            photos: "",
            specifications: "",
            numOfItems: "",
            numOfItemsPerOrder: "",
            leadTime: "",
            expiryTime: ""

        }
    } 

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const validateShopAdUpdateInput = require('../validation/ShopAdUpdateValidation');
        var isValid = validateShopAdUpdateInput(req.body,resData.errorMessage,optionData);
        if(!isValid) {
            return res.json(resData);
        }

        isLoggedIn(req,res,resData,(user) => {
            adModel.findById(req.body.adID,(err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad) {
                    resData.errorMessage.contentUnavailable = "Ad was not found!!";
                    return res.json(resData);
                }
                if(ad.isDeleted) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(ad.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Access denied";
                    return res.json(resData);
                }

                let photosToStore = req.body.oldPhotos;
                for(var i = 0; i < photosToStore.length; i++) {
                    var index = ad.photos.findIndex(e => e === photosToStore[i])
                    if(index === -1) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                }

                photosToStore.sort();
                req.body.userID = user.id;
                validatePhotoList(req,res,resData,'ad',(req,res,resData) => {
                    let modified = false;
                    let currentVersion = {
                        photos: ad.photos,
                        sameAsShopOpeningHours: ad.sameAsShopOpeningHours,
                        availableHours: ad.availableHours,
                        dimension: ad.dimension,
                        parcelDimension: ad.parcelDimension,
                        options: ad.options,
                        specifications: ad.specifications,
                        discounts: ad.discounts,
                        price: ad.price,
                        parcelPrice: ad.parcelPrice,
                        originalPrice: ad.originalPrice,
                        originalParcelPrice: ad.originalParcelPrice
                    };

                    if(req.body.photos.length > 0 || photosToStore.length !== ad.photos.length) {
                        modified = true;
                        req.body.photos.forEach(photo => {
                            photosToStore.push(photo);
                        });
                        ad.photos = photosToStore;
                    }

                    if(ad.sameAsShopOpeningHours !== req.body.sameAsShopOpeningHours) {
                        modified = true;
                        ad.sameAsShopOpeningHours = req.body.sameAsShopOpeningHours;
                        if(ad.sameAsShopOpeningHours) {
                            ad.availableHours = {};
                        }
                        else {
                            ad.availableHours = req.body.availableHours;
                        }
                    }
                    else if(!req.body.sameAsShopOpeningHours) {
                        if(!compareWeeklyPeriod(ad.availableHours,req.body.availableHours)) {
                            modified = true;
                            ad.availableHours = req.body.availableHours;
                        }
                    }

                    if(ad.dimension.length !== req.body.dimension.length || ad.dimension[0] != req.body.dimension[0] || ad.dimension[1] != req.body.dimension[1] || ad.dimension[2] != req.body.dimension[2]) {
                        modified = true;
                        ad.dimension = req.body.dimension;
                    }
                    if(ad.parcelDimension.length !== req.body.parcelDimension.length || ad.parcelDimension[0] != req.body.parcelDimension[0] || ad.parcelDimension[1] != req.body.parcelDimension[1] || ad.parcelDimension[2] != req.body.parcelDimension[2]) {
                        modified = true;
                        ad.parcelDimension = req.body.parcelDimension;
                    }
                    if(!compareOptions(ad.options,req.body.options)) {
                        modified = true;
                        ad.options = req.body.options;
                        ad.optionVersion = ad.version + 1;
                    }
                    if(!compareSpecifications(ad.specifications,req.body.specifications)) {
                        modified = true;
                        ad.specifications = req.body.specifications;
                    }

                    let keys = ['category','subcategory','description','contactNo','condition','for','parcel','weight','weightUnit','parcelWeight',
                        'parcelWeightUnit','volume','volumeUnit','dimensionUnit','parcelDimensionUnit','area','areaUnit','priceUnit',
                        'pricePer','parcelPriceUnit','governmentChargeApplicable','extraChargeApplicable',
                        'numOfItemsPerOrder','leadTime','expiryTime','productReturnApplicable','discountTag'];

                    keys.forEach(key => {
                        currentVersion[key] = ad[key];
                        if(ad[key] != req.body[key]) {
                            ad[key] = req.body[key];
                            modified = true;
                        }
                    })

                    ad.numOfItems = req.body.numOfItems;
                    ad.parcelWeightInKg = req.body.parcelWeightInKg;

                    let needToCalculateDiscount = false;
                    if(!compareDiscountData(ad.discounts,req.body.discounts,false)) {
                        needToCalculateDiscount = true;
                        ad.discounts = req.body.discounts;
                    }
                    if((ad.originalPrice && ad.originalPrice != req.body.price) || (!ad.originalPrice && ad.price != req.body.price)) {
                        needToCalculateDiscount = true;
                    }
                    if((ad.originalParcelPrice && ad.originalParcelPrice != req.body.parcelPrice) || (!ad.originalParcelPrice && ad.parcelPrice != req.body.parcelPrice)) {
                        needToCalculateDiscount = true;
                    }
                    if(ad.discountTag !== ad.showableDiscountTag) {
                        needToCalculateDiscount = true;
                    }
                    if(needToCalculateDiscount) {
                        modified = true;
                        ad.price = req.body.price;
                        ad.parcelPrice = req.body.parcelPrice;
                        prepareDiscountData(ad);
                    }

                    if(modified) {
                        currentVersion.verson = ad.version;
                        currentVersion.time = new Date();
                        ad.versionRecords.push(currentVersion);
                        ad.version += 1;

                        prepareSearchString(ad);

                        ad
                        .save()
                        .then(ad => {
                            resData.status = 'success';
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    }
                    else {
                        resData.status = 'success';
                        res.json(resData);
                    }
                });
            });
        });
    });
});

router.post('/update-individual-ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            category: "",
            subcategory: "",
            options: "",
            description: "",
            contactNo: "",
            condition: "",
            for: "",
            weight: "",
            weightUnit: "",
            parcelWeight: "",
            parcelWeightUnit: "",
            volume: "",
            volumeUnit: "",
            dimension: "",
            dimensionUnit: "",
            parcelDimension: "",
            parcelDimensionUnit: "",
            area: "",
            areaUnit: "",
            price: "",
            priceUnit: "",
            pricePer: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            governmentCharge: "",
            governmentChargeDescription: "",
            governmentChargeRegNo: "",
            extraCharge: "",
            extraChargeDescription: "",
            instruction: "",
            availableHours: "",
            photos: "",
            midBreaks: "",
            specifications: "",
            numOfItems: "",
            numOfItemsPerOrder: "",
            leadTime: "",
            expiryTime: ""

        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const validateIndividualAdUpdateInput = require('../validation/IndividualAdUpdateValidation');
        var isValid = validateIndividualAdUpdateInput(req.body,resData.errorMessage,optionData);
        if(!isValid) {
            return res.json(resData);
        }

        isLoggedIn(req,res,resData,(user) => {
            adModel.findById(req.body.adID,(err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad) {
                    resData.errorMessage.contentUnavailable = "Ad was not found!!";
                    return res.json(resData);
                }
                if(ad.isDeleted) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(ad.userID.toString() !== user.id.toString()) {
                    resData.errorMessage.fatalError = "Access denied";
                    return res.json(resData);
                }

                let photosToStore = req.body.oldPhotos;
                for(var i = 0; i < photosToStore.length; i++) {
                    var index = ad.photos.findIndex(e => e === photosToStore[i])
                    if(index === -1) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                }

                photosToStore.sort();

                req.body.userID = user.id;
                validatePhotoList(req,res,resData,'ad',(req,res,resData) => {
                    let modified = false;
                    let currentVersion = {
                        photos: ad.photos,
                        availableHours: ad.availableHours,
                        midBreaks: ad.midBreaks,
                        dimension: ad.dimension,
                        parcelDimension: ad.parcelDimension,
                        options: ad.options,
                        specifications: ad.specifications,
                        discounts: ad.discounts,
                        price: ad.price,
                        parcelPrice: ad.parcelPrice,
                        originalPrice: ad.originalPrice,
                        originalParcelPrice: ad.originalParcelPrice
                    };

                    if(req.body.photos.length > 0 || photosToStore.length !== ad.photos.length) {
                        modified = true;
                        req.body.photos.forEach(photo => {
                            photosToStore.push(photo);
                        });
                        ad.photos = photosToStore;
                    }
                    if(!compareWeeklyPeriod(ad.availableHours,req.body.availableHours)) {
                        modified = true;
                        ad.availableHours = req.body.availableHours;
                    }
                    if(!compareWeeklyPeriod(ad.midBreaks,req.body.midBreaks)) {
                        modified = true;
                        ad.midBreaks = req.body.midBreaks;
                    }
                    if(ad.dimension.length !== req.body.dimension.length || ad.dimension[0] != req.body.dimension[0] || ad.dimension[1] != req.body.dimension[1] || ad.dimension[2] != req.body.dimension[2]) {
                        modified = true;
                        ad.dimension = req.body.dimension;
                    }
                    if(ad.parcelDimension.length !== req.body.parcelDimension.length || ad.parcelDimension[0] != req.body.parcelDimension[0] || ad.parcelDimension[1] != req.body.parcelDimension[1] || ad.parcelDimension[2] != req.body.parcelDimension[2]) {
                        modified = true;
                        ad.parcelDimension = req.body.parcelDimension;
                    }
                    if(!compareOptions(ad.options,req.body.options)) {
                        modified = true;
                        ad.options = req.body.options;
                        ad.optionVersion = ad.version + 1;
                    }
                    if(!compareSpecifications(ad.specifications,req.body.specifications)) {
                        modified = true;
                        ad.specifications = req.body.specifications;
                    }

                    let keys = ['category','subcategory','description','contactNo','condition','for','parcel','weight','weightUnit','parcelWeight',
                        'parcelWeightUnit','volume','volumeUnit','dimensionUnit','parcelDimensionUnit','area','areaUnit','priceUnit','pricePer',
                        'parcelPriceUnit','governmentChargeApplicable','extraChargeApplicable','productReturnPolicy','numOfItemsPerOrder',
                        'leadTime','expiryTime','productReturnApplicable','discountTag','governmentCharge','governmentChargeDescription',
                        'governmentChargeRegNo','extraCharge','extraChargeDescription','instruction','midBreakApplicable','processingCapacity'];

                    keys.forEach(key => {
                        currentVersion[key] = ad[key];
                        if(ad[key] != req.body[key]) {
                            ad[key] = req.body[key];
                            modified = true;
                        }
                    })

                    ad.numOfItems = req.body.numOfItems;
                    ad.parcelWeightInKg = req.body.parcelWeightInKg;

                    let needToCalculateDiscount = false;
                    if(!compareDiscountData(ad.discounts,req.body.discounts,false)) {
                        needToCalculateDiscount = true;
                        ad.discounts = req.body.discounts;
                    }
                    if((ad.originalPrice && ad.originalPrice != req.body.price) || (!ad.originalPrice && ad.price != req.body.price)) {
                        needToCalculateDiscount = true;
                    }
                    if((ad.originalParcelPrice && ad.originalParcelPrice != req.body.parcelPrice) || (!ad.originalParcelPrice && ad.parcelPrice != req.body.parcelPrice)) {
                        needToCalculateDiscount = true;
                    }
                    if(ad.discountTag !== ad.showableDiscountTag) {
                        needToCalculateDiscount = true;
                    }
                    if(needToCalculateDiscount) {
                        modified = true;
                        ad.price = req.body.price;
                        ad.parcelPrice = req.body.parcelPrice;
                        prepareDiscountData(ad);
                    }

                    if(modified) {
                        currentVersion.verson = ad.version;
                        currentVersion.time = new Date();
                        ad.versionRecords.push(currentVersion);
                        ad.version += 1;

                        prepareSearchString(ad);

                        ad
                        .save()
                        .then(ad => {
                            resData.status = 'success';
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    }
                    else {
                        resData.status = 'success';
                        res.json(resData);
                    }
                });
            });
        });
    });
});

router.post('/delete-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.contentUnavailable = "Ad was not found!!";
            return res.json(resData);
        }

        adModel.findById(req.body.adID).populate('shopID').exec((err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad || ad.isDeleted) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }
            if(ad.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            ad.isDeleted = true;

            let shop = null;
            if(ad.shopID)
                shop = ad.shopID;

            ad
            .save()
            .then(ad => {
                if(shop) {
                    if(shop.numberOfAds > 0)
                        shop.numberOfAds -= 1;
                    else
                        shop.numberOfAds = 0;

                    shop
                    .save()
                    .then(shop => {
                        resData.status = 'success';
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                }
                else {
                    resData.status = 'success';
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

router.post('/toggle-available-status',(req,res) => {
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

        adModel.findById(req.body.adID).populate('shopID', 'openingHours midBreaks active forceOpen').exec((err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }
            if(ad.userID.toString() !== user.id.toString() || ad.isDeleted) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            ad.available = ad.available ? false : true;
            ad
            .save()
            .then(ad => {
                resData.publicAvailableStatus = getPublicAvailableStatus(ad,ad.shopID);
                resData.status = 'success';
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

module.exports = router;