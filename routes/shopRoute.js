const express = require('express');
const router = express.Router();
const shopModel = require('../models/shopModel');
const adModel = require('../models/adModel');
const isLoggedIn = require('../helper/isLoggedIn');
const validator = require('../helper/validationHelper');
const compareWeeklyPeriod = require('../helper/compareWeeklyPeriod');
const compareDiscountData = require('../helper/compareDiscountData');
const validatePhotoList = require('../validation/PhotoListValidation');
const storedInDatabaseModel = require('../models/storedInDatabaseModel');
const getShopPublicStatus = require('../helper/getShopPublicStatus');
const fetchShopCategories = require('../helper/fetchShopCategories');
const addThousandSeparator = require('../helper/addThousandSeparator');
const adjustRatingCount = require('../helper/adjustRatingCount');
const prepareRatingOverview = require('../helper/prepareRatingOverview');

const prepareDiscountTag = (shop) => {
    if(shop.discountTag) {
        shop.showableDiscountTag = shop.discountTag;
    }
    else if(shop.discounts.length > 0) {
        let discount = shop.discounts[0];
        if(discount.discountOn === 'Shipping Charge') {
            if(discount.discountType === 'Percentage') {
                shop.showableDiscountTag = 'Shipping Charge ' + discount.discount + '% off';
            }
            else {
                shop.showableDiscountTag = 'Shipping Charge BDT ' + addThousandSeparator(discount.discount) + ' off';
            }
        }
        else {
            if(discount.discountType === 'Percentage') {
                shop.showableDiscountTag = discount.discount + '% off';
            }
            else {
                shop.showableDiscountTag = 'BDT ' + addThousandSeparator(discount.discount) + ' off';
            }
        }
    }
    else {
        shop.showableDiscountTag = undefined;
    }
}

const prepareSearchString = (shop) => {
    var searchString = "";
    if(shop.name)
        searchString += shop.name;
    if(shop.description)
        searchString += " " +  shop.description;
    if(shop.address)
        searchString += " " +  shop.address;
    if(shop.instruction)
        searchString += " " +  shop.instruction;
    if(shop.category)
        searchString += " " +  shop.category;
    if(shop.subcategory)
        searchString += " " +  shop.subcategory;

    shop.searchString = searchString;
}

const CreateNewShop = (req,res,resData) => {
    var shop = {
        userID: req.body.userID,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        contactNo: req.body.contactNo,
        coordinate: {
            type: "Point",
            coordinates: [
                req.body.coordinate.long,
                req.body.coordinate.lat
            ]
        },
        address: req.body.address,
        location: req.body.location,
        instruction: req.body.instruction,
        openingHours: req.body.openingHours,
        extraCharge: req.body.extraCharge,
        extraChargeDescription: req.body.extraChargeDescription,
        governmentCharge: req.body.governmentCharge,
        governmentChargeDescription: req.body.governmentChargeDescription,
        governmentChargeRegNo: req.body.governmentChargeRegNo,
        photos: req.body.photos,
        midBreakApplicable: req.body.midBreakApplicable,
        midBreaks: req.body.midBreaks,
        processingCapacity: req.body.processingCapacity,
        productReturnApplicable: req.body.productReturnApplicable,
        productReturnPolicy: req.body.productReturnPolicy,
        discounts: req.body.discounts,
        discountTag: req.body.discountTag,
        dealWithShop: [{
            minOrder: 0,
            dealType: "Percentage",
            dealQuantity: 20
        }]
    };

    prepareDiscountTag(shop);
    prepareSearchString(shop);

    let newShop = new shopModel(shop);
    newShop.urlName = req.body.urlName ? req.body.urlName : newShop.name.replace(/[^a-zA-Z0-9 ]+/g,"").replace(/ +/g,"-").toLowerCase() + "-" + newShop._id;

    newShop
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

router.post('/create-shop',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            name: "",
            description: "",
            contactNo: "",
            coordinate: "",
            address: "",
            instruction: "",
            openingHours: "",
            midBreaks: "",
            governmentCharge: "",
            governmentChargeDescription: "",
            governmentChargeRegNo: "",
            extraCharge: "",
            extraChargeDescription: "",
            photos: ""
        }
    }

    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const validateShopCreateInput = require('../validation/ShopCreateValidation');
        var isValid = validateShopCreateInput(req.body,resData.errorMessage,optionData);
        if(!isValid) {
            return res.json(resData);
        }

        if(req.body.urlName) {
            shopModel.count({urlName: req.body.urlName}).exec((err,shopCount) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(shopCount > 0) {
                    resData.errorMessage.urlName = "The URL Name already exists. Please try a different one";
                    return res.json(resData);
                }

                if(/[^a-zA-z0-9-]/.test(req.body.urlName)) {
                    resData.errorMessage.urlName = "URL Name can only have letters, numbers and hyphens (-)";
                    return res.json(resData);
                }

                isLoggedIn(req,res,resData,(user) => {
                    const fetchLocation = require('../helper/fetchLocation');
                    fetchLocation(req,(outsideBD) => {
                        if(outsideBD) {
                            resData.errorMessage.coordinate = "Location must be within the area of Bangladesh";
                            return res.json(resData);
                        }
                        req.body.userID = user.id;
                        validatePhotoList(req,res,resData,'shop',CreateNewShop);
                    });
                });
            });
        }
        else {
            isLoggedIn(req,res,resData,(user) => {
                const fetchLocation = require('../helper/fetchLocation');
                fetchLocation(req,(outsideBD) => {
                    if(outsideBD) {
                        resData.errorMessage.coordinate = "Location must be within the area of Bangladesh";
                        return res.json(resData);
                    }
                    req.body.userID = user.id;
                    validatePhotoList(req,res,resData,'shop',CreateNewShop);
                });
            });
        }
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
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;

        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "No shop found!!";
                return res.json(resData);
            }
            if(!shop || shop.isDeleted || shop.userID.toString() !== user.id.toString()) {
                resData.errorMessage.contentUnavailable = "Shop was not found!!";
                return res.json(resData);
            }

            storedInDatabaseModel.findOne({},async (err,optionData) => {
                if(err || optionData === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                resData.categories = optionData.categories;
                resData.shopName = shop.name;
                resData.description = shop.description,
                resData.contactNo = shop.contactNo,
                resData.coordinate = {
                    lat: shop.coordinate.coordinates[1],
                    long: shop.coordinate.coordinates[0]
                };
                resData.active = shop.active;
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
                resData.active = shop.active;
                resData.processingCapacity = shop.processingCapacity;
                resData.productReturnApplicable = shop.productReturnApplicable;
                resData.productReturnPolicy = shop.productReturnPolicy;
                resData.photos = shop.photos;
                resData.discounts = shop.discounts;
                resData.discountTag = shop.discountTag;
                resData.showableDiscountTag = shop.showableDiscountTag;
                resData.category = shop.category;
                resData.subcategory = shop.subcategory;
                resData.forceOpen = shop.forceOpen;
                resData.publicActiveStatus = getShopPublicStatus(shop);

                if(!shop.ratingCount) {
                    adjustRatingCount(shop);
                    await shop.save();
                }
                resData.ratingOverview = prepareRatingOverview(shop);

                const sendComments = require('../helper/sendComments');
                sendComments(shop.id,"shop",req,res,resData,shop.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    return res.json(resData);
                });
            });
        });
    });
});

router.post('/all-shops',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        shops: [],
        name: "",
        cartItemNumber: ""
    }

    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.cartItemNumber = user.cartItemNumber;
        let query = [{isDeleted: false},{userID: user.id}];

        if(typeof req.body.searchString === "string") {
            var token = req.body.searchString.split(" ");
            token.forEach(element => {
                query.push({searchString: new RegExp(element,'i')});
            });
        }
        shopModel.find({$and: query},(err,shops) => {
            if(err || shops === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            storedInDatabaseModel.findOne({},(err,optionData) => {
                if(err || optionData === null) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                fetchShopCategories(res,resData,{userID: user.id,isDeleted: false},() => {
                    resData.categories = optionData.categories;
                    for(var i = shops.length-1; i >= 0; i--) {
                        resData.shops.push({
                            shopID: shops[i].id,
                            urlName: shops[i].urlName,
                            shopName: shops[i].name,
                            description: shops[i].description,
                            rating: shops[i].avgRating,
                            numberOfAds: shops[i].numberOfAds,
                            photo: shops[i].photos ? shops[i].photos[0] : null,
                            showableDiscountTag: shops[i].showableDiscountTag,
                        });
                    }

                    resData.status = "success";
                    return res.json(resData);
                });
            });
        });
    });
});

const performShopUpdate = (req,res,resData,shop) => {
    let photosToStore = req.body.oldPhotos;
    for(var i = 0; i < photosToStore.length; i++) {
        var index = shop.photos.findIndex(e => e === photosToStore[i])
        if(index === -1) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
    }

    photosToStore.sort();
    validatePhotoList(req,res,resData,'shop',(req,res,resData) => {
        let modified = false;
        let currentVersion = {
            photos: shop.photos,
            openingHours: shop.openingHours,
            midBreaks: shop.midBreaks,
            discounts: shop.discounts
        };

        if(req.body.photos.length > 0 || photosToStore.length !== shop.photos.length) {
            modified = true;
            req.body.photos.forEach(photo => {
                photosToStore.push(photo);
            });
            shop.photos = photosToStore;
        }

        if(!compareWeeklyPeriod(shop.openingHours,req.body.openingHours)) {
            modified = true;
            shop.openingHours = req.body.openingHours;
        }
        if(!compareWeeklyPeriod(shop.midBreaks,req.body.midBreaks)) {
            modified = true;
            shop.midBreaks = req.body.midBreaks;
        }
        if(!compareDiscountData(shop.discounts,req.body.discounts,true)) {
            modified = true;
            shop.discounts = req.body.discounts;
        }
        let keys = ['urlName','description','subcategory','instruction','midBreakApplicable','governmentCharge','governmentChargeDescription','governmentChargeRegNo',
            'extraCharge','contactNo','extraChargeDescription','processingCapacity','productReturnApplicable','productReturnPolicy','discountTag'];

        keys.forEach(key => {
            currentVersion[key] = shop[key];
            if(shop[key] !== req.body[key]) {
                shop[key] = req.body[key];
                modified = true;
            }
        })

        if(modified) {
            currentVersion.verson = shop.version;
            currentVersion.time = new Date();
            shop.versionRecords.push(currentVersion);
            shop.version += 1;
            prepareDiscountTag(shop);
            prepareSearchString(shop);
            if(!shop.urlName)
                shop.urlName = shop.name.replace(/[^a-zA-Z0-9 ]+/g,"").replace(/ +/g,"-").toLowerCase() + "-" + shop._id;

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
    });
}

router.post('/update-shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            description: "",
            contactNo: "",
            instruction: "",
            openingHours: "",
            midBreaks: "",
            governmentCharge: "",
            governmentChargeDescription: "",
            governmentChargeRegNo: "",
            extraCharge: "",
            extraChargeDescription: "",
            photos: ""
        }
    }
    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err || optionData === null) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const validateShopUpdateInput = require('../validation/ShopUpdateValidation');
        var isValid = validateShopUpdateInput(req.body,resData.errorMessage,optionData);
        if(!isValid) {
            return res.json(resData);
        }

        isLoggedIn(req,res,resData,(user) => {
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

                req.body.userID = user.id;

                if(req.body.urlName) {
                    shopModel.count({urlName: req.body.urlName}).exec((err,shopCount) => {
                        if(err) {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }

                        if(shopCount > 1 || (shopCount === 1 && shop.urlName !== req.body.urlName)) {
                            resData.errorMessage.urlName = "The URL Name already exists. Please try a different one";
                            return res.json(resData);
                        }

                        if(/[^a-zA-z0-9-]/.test(req.body.urlName)) {
                            resData.errorMessage.urlName = "URL Name can only have letters, numbers and hyphens (-)";
                            return res.json(resData);
                        }

                        performShopUpdate(req,res,resData,shop);
                    });
                }
                else {
                    performShopUpdate(req,res,resData,shop);
                }
            });
        });
    });
});

router.post('/delete-shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {

        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!shop || shop.isDeleted) {
                resData.errorMessage.contentUnavailable = "Shop was not found!!";
                return res.json(resData);
            }
            if(shop.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            shop.isDeleted = true;
            shop.urlName = shop._id;
            adModel.updateMany({shopID: shop.id},{$set: {"isDeleted": true}},(err,result) => {
                if(err) {
                    console.log(err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

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
            });
        });
    });
});

router.post('/toggle-active-status',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {

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
            if(shop.userID.toString() !== user.id.toString() || shop.isDeleted) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            shop.active = shop.active ? false : true;
            shop
            .save()
            .then(shop => {
                resData.forceOpen = shop.forceOpen;
                resData.publicActiveStatus = getShopPublicStatus(shop);
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

router.post('/toggle-force-open',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {

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
            if(shop.userID.toString() !== user.id.toString() || shop.isDeleted) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            shop.forceOpen = shop.forceOpen ? false : true;
            shop
            .save()
            .then(shop => {
                resData.active = shop.active;
                resData.forceOpen = shop.forceOpen;
                resData.publicActiveStatus = getShopPublicStatus(shop);
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