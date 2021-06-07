const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const constants = require("../helper/myConstants");
const storePhoto = require('../helper/storePhotos');
const deletePhoto =  require('../helper/deletePhoto');
const isLoggedIn = require('../helper/isLoggedIn');
const validator = require('../helper/validationHelper');
const validatePhotoList = require('../validation/PhotoListValidation');
const demoAdModel = require('../models/demoAdModel');
const compareSpecifications = require('../helper/compareSpecifications');
const compareOptions = require('../helper/compareOptions');
const allHomePageDataModel = require('../models/allHomePageDataModel');
const tempPhotoModel = require('../models/tempPhotoModel');
const shopModel = require('../models/shopModel');
const adModel = require('../models/adModel');
const userModel = require('../models/userModel');
const storedInDatabaseModel = require('../models/storedInDatabaseModel');
const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
const sendSms = require('../helper/sendSms');

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

    ad.searchString = searchString;
}

const CreateNewDemoAd = (req,res,resData) => {
    const newDemoAd = {
        name: req.body.name,
        category: req.body.category,
        subcategory: req.body.subcategory,
        description: req.body.description,
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
        price: req.body.price,
        priceUnit: req.body.priceUnit,
        parcelPrice: req.body.parcelPrice,
        parcelPriceUnit: req.body.parcelPriceUnit,
        photos: req.body.photos,
        brandName: req.body.brandName,
        specifications: req.body.specifications,
        options: req.body.options,
        expiryTime: req.body.expiryTime,
        createdBy: req.body.userID
    };

    prepareSearchString(newDemoAd);

    new demoAdModel(newDemoAd)
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

router.post('/create-demo-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            name: "",
            category: "",
            subcategory: "",
            description: "",
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
            price: "",
            priceUnit: "",
            parcelPrice: "",
            parcelPriceUnit: "",
            photos: "",
            brandName: "",
            specifications: "",
            options: "",
            expiryTime: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        isLoggedIn(req,res,resData,(user) => {
            if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_CREATE_DEMO_AD)) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }
            const validateDemoAdCreateInput = require('../validation/DemoAdCreateValidation');
            var isValid = validateDemoAdCreateInput(req.body,resData.errorMessage,optionData);
            if(!isValid)
                return res.json(resData);

            req.body.userID = user.id;
            validatePhotoList(req,res,resData,'demo-ad',CreateNewDemoAd);
        });
    });
});

router.post('/update-demo-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            name: "",
            category: "",
            subcategory: "",
            description: "",
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
            parcelPrice: "",
            parcelPriceUnit: "",
            photos: "",
            brandName: "",
            specifications: "",
            options: "",
            expiryTime: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        isLoggedIn(req,res,resData,(user) => {
            if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_CREATE_DEMO_AD)) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            const validateDemoAdCreateInput = require('../validation/DemoAdCreateValidation');
            var isValid = validateDemoAdCreateInput(req.body,resData.errorMessage,optionData);
            if(!isValid)
                return res.json(resData);

            if(!validator.isValidObjectID(req.body.adID)) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            demoAdModel.findById(req.body.adID,(err,ad) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(!ad) {
                    resData.errorMessage.contentUnavailable = "Ad was not found!!";
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
                validatePhotoList(req,res,resData,'demo-ad',(req,res,resData) => {
                    let modified = false;
                    let currentVersion = {
                        photos: ad.photos,
                        dimension: ad.dimension,
                        parcelDimension: ad.parcelDimension,
                        options: ad.options,
                        specifications: ad.specifications
                    };

                    if(req.body.photos.length > 0 || photosToStore.length !== ad.photos.length) {
                        modified = true;
                        req.body.photos.forEach(photo => {
                            photosToStore.push(photo);
                        });
                        ad.photos = photosToStore;
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

                    let keys = ['name','category','subcategory','description','weight','weightUnit','parcelWeight','price','parcelPrice','expiryTime',
                        'brandName','parcelWeightUnit','volume','volumeUnit','dimensionUnit','parcelDimensionUnit','priceUnit','parcelPriceUnit']

                    keys.forEach(key => {
                        currentVersion[key] = ad[key];
                        if(ad[key] != req.body[key]) {
                            ad[key] = req.body[key];
                            modified = true;
                        }
                    })

                    ad.parcelWeightInKg = req.body.parcelWeightInKg;
                    if(modified) {
                        currentVersion.verson = ad.version;
                        currentVersion.editedBy = mongoose.Types.ObjectId(user.id);
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

const createAds = (ads,index,res,resData) => {
    if(index < 0) {
        resData.status = 'success';
        res.json(resData);
    } else {
        const attachDemoPhoto = require('../helper/attachDemoPhoto');
        attachDemoPhoto(ads[index].photos,res,resData,(res,resData) => {

            ads[index]
            .save()
            .then(ad => {
                createAds(ads,index-1,res,resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    }
}

router.post('/delete-demo-ad',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_CREATE_DEMO_AD)) {
            resData.errorMessage.fatalError = "Access denied";
            return res.json(resData);
        }
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.contentUnavailable = "Ad was not found!!";
            return res.json(resData);
        }

        demoAdModel.findById(req.body.adID,(err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad || ad.isDeleted) {
                resData.errorMessage.contentUnavailable = "Ad was not found!!";
                return res.json(resData);
            }

            ad.isDeleted = true;
            ad.deletedBy = user.id;

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
        });
    });
});

router.post('/add-demo-ad-to-user-account',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            phoneNumber: "",
            shopID: "",
            adID: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_ATTACH_DEMO_AD)) {
            resData.errorMessage.fatalError = "Access denied";
            return res.json(resData);
        }

        let error = false;
        if(!validator.isValidCountryCode(req.body.countryCode) || !validator.isValidPhoneNumber(req.body.phoneNumber)) {
            error = true;
            resData.errorMessage.phoneNumber = 'No user exists with this Phone Number';
        } else {
            req.body.phoneNumber = req.body.phoneNumber.replace(/^0/,'');
        }

        if(error) {
            return res.json(resData);
        }

        let adIDs = req.body.adID;
        for(var i=0; i < adIDs.length; i++) {
            if(!validator.isValidObjectID(adIDs[i])) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            else {
                adIDs[i] = mongoose.Types.ObjectId(adIDs[i]);
            }
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!user) {
                resData.errorMessage.phoneNumber = 'No user exists with this Phone Number';
                return res.json(resData);
            }

            shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!shop || user.id.toString() !== shop.userID.toString()) {
                    resData.errorMessage.shopID = "Incorrect Shop ID";
                    return res.json(resData);
                }

                shop.numberOfAds += adIDs.length;

                shop
                .save()
                .then(shop => {
                    demoAdModel.find({ _id: { $in : adIDs }},(err,demoAds) => {
                        if(err || demoAds === null) {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        let radFactor = Math.PI / 180;
                        const newAds = [];
                        demoAds.forEach(demoAd => {
                            let newAd = {
                                userID: user.id,
                                shopID: shop.id,
                                name: demoAd.name,
                                category: demoAd.category,
                                subcategory: demoAd.subcategory,
                                options: demoAd.options,
                                description: demoAd.description,
                                contactNo: shop.contactNo,
                                coordinate: shop.coordinate,
                                coordinateRad: [shop.coordinate.coordinates[1] * radFactor, shop.coordinate.coordinates[0] * radFactor],
                                location: shop.location,
                                address: shop.address,
                                instruction: shop.instruction,
                                condition: "New",
                                for: "Sale",
                                parcel: true,
                                availableHours: shop.openingHours,
                                weight: demoAd.weight,
                                weightUnit: demoAd.weightUnit,
                                parcelWeight: demoAd.parcelWeight,
                                parcelWeightInKg: demoAd.parcelWeightInKg,
                                parcelWeightUnit: demoAd.parcelWeightUnit,
                                volume: demoAd.volume,
                                volumeUnit: demoAd.volumeUnit,
                                dimension: demoAd.dimension,
                                dimensionUnit: demoAd.dimensionUnit,
                                parcelDimension: demoAd.parcelDimension,
                                parcelDimensionUnit: demoAd.parcelDimensionUnit,
                                price: demoAd.price,
                                priceUnit: demoAd.priceUnit,
                                parcelPrice: demoAd.parcelPrice,
                                parcelPriceUnit: demoAd.parcelPriceUnit,
                                governmentChargeApplicable: true,
                                extraChargeApplicable: true,
                                photos: demoAd.photos,
                                shopName: shop.name,
                                midBreakApplicable: shop.midBreakApplicable,
                                midBreaks: shop.midBreaks,
                                specifications: demoAd.specifications,
                                numOfItems: 100,
                                numOfItemsPerOrder: 100,
                                expiryTime: demoAd.expiryTime,
                                searchString: demoAd.searchString
                            }

                            newAds.push(new adModel(newAd));
                        });
                        createAds(newAds,newAds.length-1,res,resData);
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

router.post('/update-homepage',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            topSlider: "",
            secondSlider: "",
            latest: "",
            special: "",
            featured: "",
            spanA: "",
            spanB: "",
            spanC: "",
            trending: "",
            bestseller: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        const homePageDataModel = require('../models/homePageDataModel');
        homePageDataModel.findOne({},(err,homePageData) => {
            if(err) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(homePageData === null) {
                homePageData = new homePageDataModel({});
            }

            const HomePageDataValidateAndUpdate = require('../validation/HomePageDataValidateAndUpdate');
            HomePageDataValidateAndUpdate(req.body,res,resData,homePageData);
        });
    });
});

router.post('/add-demo-ad-to-list',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        },
        listedDemoAds: []
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Ad was not found!!";
            return res.json(resData);
        }
        if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_ATTACH_DEMO_AD)) {
            resData.errorMessage.permissionError = "You don't have permissions to do it";
            return res.json(resData);
        }

        demoAdModel.findById(req.body.adID,(err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad) {
                resData.errorMessage.fatalError = "Ad was not found!!";
                return res.json(resData);
            }

            if(!req.session.listedDemoAds) {
                req.session.listedDemoAds = [req.body.adID];
            }
            else if(!req.session.listedDemoAds.includes(req.body.adID)) {
                req.session.listedDemoAds.push(req.body.adID);
            }

            resData.listedDemoAds = req.session.listedDemoAds;
            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/remove-demo-ad-from-list',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        },
        listedDemoAds: []
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Ad was not found!!";
            return res.json(resData);
        }
        if(!constants.USER_PERMISSIONS[user.userType].includes(constants.PERMISSION_ATTACH_DEMO_AD)) {
            resData.errorMessage.permissionError = "You don't have permissions to do it";
            return res.json(resData);
        }

        demoAdModel.findById(req.body.adID,(err,ad) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad) {
                resData.errorMessage.fatalError = "Ad was not found!!";
                return res.json(resData);
            }
            if(req.session.listedDemoAds) {
                let index = req.session.listedDemoAds.findIndex(adID => adID === req.body.adID);
                if(index !== -1) {
                    req.session.listedDemoAds.splice(index,1);
                }
            }

            resData.listedDemoAds = req.session.listedDemoAds;
            resData.status = "success";
            res.json(resData);
        });
    });
});

router.post('/add-to-homepage-top-slider',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(user.userType !== "Admin") {
            resData.errorMessage.permissionError= "Access denied!";
            return res.json(resData);
        }

        if(!req.body.urlName || !validator.isValidObjectID(req.body.photo)) {
            resData.errorMessage.fatalError = "Invalid request!";
            return res.json(resData);
        }

        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!shop || shop.isDeleted) {
                resData.errorMessage.fatalError = "The Shop was not found! You may have entered a wrong Shop ID or the Shop has been deleted";
                return res.json(resData);
            }

            tempPhotoModel.findById(req.body.photo,(err,tempPhoto) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!tempPhoto) {
                    resData.errorMessage.fatalError = "Photo was not found!";
                    return res.json(resData);
                }

                allHomePageDataModel.findOne({},(err,allHomePageData) => {
                    if(err) {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    if(!allHomePageData) {
                        allHomePageData = new allHomePageDataModel({});
                    }

                    storePhoto(tempPhoto.name,'photos/homePhotos/',{w:1920,h:600},
                        () => {
                            deletePhoto("photos/temp/" + tempPhoto.name);

                            allHomePageData["topSlider"].push({
                                shopID: shop.id,
                                smallLine: req.body.smallLine,
                                biggerLine: req.body.biggerLine,
                                photo: tempPhoto.name
                            })

                            allHomePageData
                            .save()
                            .then(r => {
                                resData.status = 'success';
                                res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        },
                        () => {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }
                    );
                });
            });
        });
    });
});

const addItemToHompageData = (req,res,type,resolution) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(user.userType !== "Admin") {
            resData.errorMessage.permissionError= "Access denied!";
            return res.json(resData);
        }

        if(!validator.isValidObjectID(req.body.adID) || !validator.isValidObjectID(req.body.photo)) {
            resData.errorMessage.fatalError = "Invalid request!";
            return res.json(resData);
        }

        adModel.findById(req.body.adID,(err,ad) => {
            if(err) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ad || ad.isDeleted) {
                resData.errorMessage.fatalError = "The Ad was not found! You may have entered a wrong ad ID or the Ad has been deleted";
                return res.json(resData);
            }

            tempPhotoModel.findById(req.body.photo,(err,tempPhoto) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!tempPhoto) {
                    resData.errorMessage.fatalError = "Photo was not found!";
                    return res.json(resData);
                }

                allHomePageDataModel.findOne({},(err,allHomePageData) => {
                    if(err) {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    if(!allHomePageData) {
                        allHomePageData = new allHomePageDataModel({});
                    }

                    storePhoto(tempPhoto.name,'photos/homePhotos/',resolution,
                        () => {
                            deletePhoto("photos/temp/" + tempPhoto.name);

                            allHomePageData[type].push({
                                adID: req.body.adID,
                                photo: tempPhoto.name
                            })

                            allHomePageData
                            .save()
                            .then(r => {
                                resData.status = 'success';
                                res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        },
                        () => {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }
                    );
                });
            });
        });
    });
}

router.post('/add-to-homepage-latest',(req,res) => {
    addItemToHompageData(req,res,"latest",{w:262,h:320});
});

router.post('/add-to-homepage-special',(req,res) => {
    addItemToHompageData(req,res,"special",{w:262,h:320});
});

router.post('/add-to-homepage-featured',(req,res) => {
    addItemToHompageData(req,res,"featured",{w:262,h:320});
});

router.post('/add-to-homepage-spanA',(req,res) => {
    addItemToHompageData(req,res,"spanA",{w:359,h:430});
});

router.post('/add-to-homepage-spanB',(req,res) => {
    addItemToHompageData(req,res,"spanB",{w:359,h:220});
});

router.post('/add-to-homepage-spanC',(req,res) => {
    addItemToHompageData(req,res,"spanC",{w:750,h:180});
});

router.post('/add-to-homepage-trending',(req,res) => {
    addItemToHompageData(req,res,"trending",{w:262,h:320});
});

router.post('/add-to-homepage-bestseller',(req,res) => {
    addItemToHompageData(req,res,"bestseller",{w:262,h:320});
});

router.post('/add-to-homepage-second-slider',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(user.userType !== "Admin") {
            resData.errorMessage.permissionError= "Access denied!";
            return res.json(resData);
        }
        if(!validator.isValidObjectID(req.body.photo)) {
            resData.errorMessage.fatalError = "Invalid request!";
            return res.json(resData);
        }

        tempPhotoModel.findById(req.body.photo,(err,tempPhoto) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(!tempPhoto) {
                resData.errorMessage.fatalError = "Photo was not found!";
                return res.json(resData);
            }

            storedInDatabaseModel.findOne({},(err,optionData) => {
                if(err || !optionData) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!optionData.categories.find(c => c.categoryName === req.body.categoryName)) {
                    resData.errorMessage.fatalError = "Category is unknown";
                    return res.json(resData);
                }

                const allHomePageDataModel = require('../models/allHomePageDataModel');
                allHomePageDataModel.findOne({},(err,allHomePageData) => {
                    if(err) {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }
                    if(allHomePageData === null) {
                        allHomePageData = new allHomePageDataModel({});
                    }

                    storePhoto(tempPhoto.name,'photos/homePhotos/',{w:262,h:262},
                        () => {
                            deletePhoto("photos/temp/" + tempPhoto.name);

                            let itemIndex = allHomePageData.secondSlider.findIndex(e => e.categoryName === req.body.categoryName)
                            if(itemIndex === -1) {
                                allHomePageData.secondSlider.push({
                                    categoryName: req.body.categoryName,
                                    photo: tempPhoto.name
                                })
                            }
                            else {
                                let previousPhoto = allHomePageData.secondSlider[itemIndex].photo;
                                allHomePageData.secondSlider[itemIndex].categoryName = req.body.categoryName;
                                allHomePageData.secondSlider[itemIndex].photo = tempPhoto.name;
                                deletePhoto("photos/homePhotos/" + previousPhoto);
                            }

                            allHomePageData
                            .save()
                            .then(r => {
                                resData.status = 'success';
                                res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        },
                        () => {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }
                    );
                });
            });
        });
    });
});

router.post('/delivery-person-details',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(reqUser) => {
        if(!constants.USER_PERMISSIONS[reqUser.userType].includes(constants.PERMISSION_VERIFY_ACCOUNT)) {
            resData.errorMessage.fatalError = "Access denied";
            return res.json(resData);
        }

        if(!validator.isValidPhoneNumber(req.body.phoneNumber)) {
            resData.errorMessage.phoneNumber = 'A valid phone number is required';
            return res.json(resData);
        }

        req.body.phoneNumber = req.body.phoneNumber.replace(/^0/,'');
        userModel.findOne({phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!user) {
                resData.errorMessage.phoneNumber = "No user exists with this Phone Number";
                return res.json(resData);
            }
            if(!user.deliveryPersonInfo) {
                resData.errorMessage.fatalError = "This user is not a delivery person!!";
                return res.json(resData);
            }

            resData.deliveryPersonStatus = user.deliveryPersonInfo.accountStatus.status;
            resData.deliveryPersonStatusMessage = user.deliveryPersonInfo.accountStatus.message;
            resData.countryCode = user.countryCode;
            resData.phoneNumber = user.phoneNumber;
            resData.deliveryPersonName = user.name;
            resData.deliveryMedium = user.deliveryPersonInfo.deliveryMedium;

            resData.name = reqUser.name;
            resData.cartItemNumber = reqUser.cartItemNumber;

            resData.status = 'success';
            res.json(resData);
        });
    });
})

router.post('/delivery-person-change-status',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(reqUser) => {
        if(!constants.USER_PERMISSIONS[reqUser.userType].includes(constants.PERMISSION_VERIFY_ACCOUNT)) {
            resData.errorMessage.fatalError = "Access denied";
            return res.json(resData);
        }

        let error = false;
        if(!validator.isValidPhoneNumber(req.body.phoneNumber)) {
            resData.errorMessage.phoneNumber = 'A valid phone number is required';
            error = true;
        }
        if(req.body.deliveryPersonStatus !== "Pending" && req.body.deliveryPersonStatus !== "Approved" && req.body.deliveryPersonStatus !== "Rejected" && req.body.deliveryPersonStatus !== "Blocked") {
            resData.errorMessage.deliveryPersonStatus = 'A valid status is required';
            error = true;
        }
        if(req.body.deliveryPersonStatus !== "Approved" && !req.body.deliveryPersonStatusMessage) {
            resData.errorMessage.deliveryPersonStatusMessage = "Message is required";
            error = true;
        }
        else if(req.body.deliveryPersonStatusMessage && req.body.deliveryPersonStatusMessage.length > 500) {
            resData.errorMessage.deliveryPersonStatusMessage = "Message cannot be more than 500 characters";
            error = true;
        }

        if(error) {
            return res.json(resData);
        }

        if(req.body.deliveryPersonStatus === "Approved") {
            req.body.deliveryPersonStatusMessage = "";
        }

        if(req.body.deliveryMedium && req.body.deliveryMedium !== "Bicycle") {
            req.body.deliveryMedium = "Motorcycle";
        }

        req.body.phoneNumber = req.body.phoneNumber.replace(/^0/,'');
        userModel.findOne({phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!user) {
                resData.errorMessage.phoneNumber = "No user exists with this Phone Number";
                return res.json(resData);
            }
            if(!user.deliveryPersonInfo) {
                resData.errorMessage.fatalError = "This user is not a delivery person!!";
                return res.json(resData);
            }

            let deliveryPersonCurrentAccountStatus = user.deliveryPersonInfo.accountStatus.status;

            user.deliveryPersonInfo.accountStatus = {
                status: req.body.deliveryPersonStatus,
                message: req.body.deliveryPersonStatusMessage
            }

            user.deliveryPersonInfo.deliveryMedium = req.body.deliveryMedium;

            user
            .save()
            .then(user => {
                let allowReq = req.body.deliveryPersonStatus === "Approved";
                if(user.activeDeliveryPersonID) {
                    activeDeliveryPersonModel.findOne({_id: user.activeDeliveryPersonID},(err, activeDeliveryPerson) => {
                        if(err || !activeDeliveryPerson) {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        activeDeliveryPerson.allowRequest = allowReq;
                        
                        activeDeliveryPerson
                        .save()
                        .then(adp => {
                            if((deliveryPersonCurrentAccountStatus !== "Approved") && allowReq) {
                                let message = "Congratulations!! Your Qbird Delivery account has been approved. From now on, you can deliver with Qbird.\nFollow the video url below for demonstration\nhttps://drive.google.com/file/d/1oAzqiTNn3wLA40M0jR4h_BQn_uq3M5iU/view?usp=sharing";
                                sendSms(res,resData,message,user.phoneNumber,() => {
                                    resData.status = 'success';
                                    res.json(resData);
                                });
                            }
                            else {
                                resData.status = 'success';
                                res.json(resData);
                            }
                        })
                        .catch(err => {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    })
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
})

module.exports = router;