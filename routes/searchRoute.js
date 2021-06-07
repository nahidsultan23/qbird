const express = require('express');
const shopModel = require('../models/shopModel');
const isAuthenticated = require('../helper/isAuthenticated');
const fetchAdCategories = require('../helper/fetchAddCategories');
const router = express.Router();
const maxDistance = 50000000000000000;

const attachShopInfo = (items,index,cb) => {
    if(index < 0)
        return cb();

    if(!items[index].shopID)
        return attachShopInfo(items,index-1,cb);

    shopModel.findById(items[index].shopID,{showableDiscountTag:1,urlName: 1},(err,shop) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!*";
            return res.json(resData);
        }
        if(shop) {
            items[index].showableShopDiscountTag = shop.showableDiscountTag;
            items[index].urlName = shop.urlName;
        }

        attachShopInfo(items,index-1,cb);
    })
}

router.post('/search-result/ads',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        ads:[],
        numberOfAds: 0,
        name: "",
        cartItemNumber: ""
    }

    
    isAuthenticated(req,res,resData,(user) => {
        if(user) {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
        }
        if((typeof req.body.searchString) !== 'string') {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        var token = req.body.searchString.split(" ");
        var query = [{ isDeleted: false },{ available: true }];
        token.forEach(element => {
            query.push({searchString: new RegExp(element,'i')});
        });

        if(req.body.for === 'Rent' || req.body.for === 'Sale' )
            query.push({ for: req.body.for });

        if(req.body.category && req.body.category !== "All")
            query.push({ category: req.body.category });

        if(req.body.condition && req.body.condition !== "All")
            query.push({ condition: req.body.condition });

        if(!/Best Match and Distance|Shop and Distance|Best Match|Shop/.test(req.body.sortBy))
            req.body.sortBy = "Shop and Distance";

        const adModel = require('../models/adModel');
        let aggregate = adModel.aggregate();
        const validator = require('../helper/validationHelper');
        if(req.body.coordinate && validator.isValidLattitude(req.body.coordinate.lat) && validator.isValidLongitude(req.body.coordinate.long)) {
            var coordinate = {
                type: "Point",
                coordinates:[parseFloat(req.body.coordinate.long), parseFloat(req.body.coordinate.lat)]
            };
            aggregate = aggregate.near({
                near: coordinate,
                query: {
                    $and: query
                },
                maxDistance: maxDistance,
                distanceField: "distance",
                spherical: true
            });
        }
        else {
            req.body.coordinate = undefined;
            aggregate = aggregate.match({
                $and: query 
            });
        }

        if(req.body.sortBy.startsWith("Shop")) {
            aggregate = aggregate.group({
                _id : {shopID: "$shopID",coordinate: "$coordinate",shopName: "$shopName"},
                distance: { $first: "$distance" },
                createdOn: { $first: "$createdOn"},
                adID: { $first: "$_id" },
                adName: { $first: "$name" },
                condition: { $first: "$condition"},
                photo: { $first: {$arrayElemAt:["$photos",0]}},
                for: { $first: "$for"},
                price: { $first: "$price" },
                originalPrice: {$first: "$originalPrice" },
                showableDiscountTag: {$first: "$showableDiscountTag" },
                pricePer: { $first: "$pricePer" },
                description: { $first: "$description"},
                rating: { $first: "$avgRating"},
                matchingAdsNumber: { $sum: 1 }
            })
            .addFields({
                shopID: "$_id.shopID",
                shopName: "$_id.shopName",
                matchingAdsNumber: { $subtract:["$matchingAdsNumber",1]}
            })
            .project({
                _id: 0
            })
        }
        else {
            aggregate = aggregate.project({
                _id: 0,
                shopID: 1,
                shopName: 1,
                distance: 1,
                createdOn: 1,
                adID: "$_id",
                adName: "$name",
                condition: 1,
                photo: {$arrayElemAt:["$photos",0]},
                for: 1,
                price: 1,
                originalPrice: 1,
                showableDiscountTag: 1,
                pricePer: 1,
                description: 1,
                rating: "$avgRating",
            })
        }

        let sortOrder = req.body.sortBy.endsWith("Distance") ? {distance: 1, createdOn: 1} : { createdOn: 1};

        aggregate.sort(sortOrder)
        .exec((err,results) => {
            if(err || results === null) {
                resData.errorMessage.fatalError = "Something went wrong!!*";
                return res.json(resData);
            }

            attachShopInfo(results,results.length-1,() => {
                resData.ads = results;
                resData.numberOfAds = results.length;
                resData.status = "success";
                res.json(resData);
            })
        });
    });
});

router.post('/search-result/shops',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        shops:[],
        numberOfShops: 0,
        name: "",
        cartItemNumber: ""
    }

    if(!req.body.coordinate || (typeof req.body.searchString) !== 'string') {
        resData.errorMessage.fatalError = "Something went wrong!!";
        return res.json(resData);
    }

    var token = req.body.searchString.split(" ");
    var query = [{isDeleted: false}];

    if(req.body.category && req.body.category !== "All")
        query.push({ category: req.body.category });

    token.forEach(element => {
        query.push({searchString: new RegExp(element,'i')});
    });

    const shopModel = require('../models/shopModel');
    let aggregate = shopModel.aggregate();

    const validator = require('../helper/validationHelper');
    if(req.body.coordinate && validator.isValidLattitude(req.body.coordinate.lat) && validator.isValidLongitude(req.body.coordinate.long)) {
        var coordinate = {
            type: "Point",
            coordinates:[parseFloat(req.body.coordinate.long), parseFloat(req.body.coordinate.lat)]
        };
        aggregate = aggregate.near({
            near: coordinate,
            query: { 
                $and: query 
            },
            maxDistance: maxDistance,
            distanceField: "distance",
            spherical: true
        });
    }
    else {
        req.body.coordinate = undefined;
        aggregate = aggregate.match({
            $and: query 
        });
    }


    aggregate.sort(
        {distance: 1, createdOn: 1}
    ).exec((err,results) => {
        if(err || results === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        results.forEach(r => {
            resData.shops.push({
                shopID: r._id,
                urlName: r.urlName,
                shopName: r.name,
                description: r.description,
                photo: r.photos ? r.photos[0] : null,
                distance: req.body.coordinate ? r.distance : "",
                rating: r.avgRating,
                showableDiscountTag: r.showableDiscountTag
            });
        });

        resData.numberOfShops = results.length;

        const storedInDatabaseModel = require('../models/storedInDatabaseModel');
        storedInDatabaseModel.findOne({},(err,data) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            resData.shopCategories = data ? data.shopCategories : [];
            resData.status = "success";
            isAuthenticated(req,res,resData,(user) => {
                if(user) {
                    resData.name = user.name;
                    resData.cartItemNumber = user.cartItemNumber;
                }
                res.json(resData);
            });
        })
    });
});

router.post('/search-result-of-shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        ads:[],
        name: "",
        cartItemNumber: ""
    }

    const shopModel = require('../models/shopModel');
    shopModel.findOne({urlName: req.body.urlName},{
        contactNo: 1,
        name: 1,
        address: 1,
        location: 1,
        coordinate: 1,
        isDeleted: 1,
        showableDiscountTag: 1,
        category: 1,
        subcategory: 1,
        avgRating: 1,
        numberOfRatings: 1,
        numberOfComments: 1,
        numberOfAds: 1,
        shoppingCount: 1,
        photos: 1
    })
    .exec((err,shop) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else if(!shop || shop.isDeleted) {
            resData.errorMessage.contentUnavailable = "Shop was not found!!";
            return res.json(resData);
        }

        var query = [{ isDeleted: false },{ available: true }];

        if(typeof req.body.searchString === "string") {
            var token = req.body.searchString.split(" ");
            token.forEach(element => {
                query.push({searchString: new RegExp(element,'i')});
            });
        }

        query.push({ shopID: shop.id });
        if(req.body.for === 'Rent' || req.body.for === 'Sale' )
            query.push({ for: req.body.for });

        if(req.body.category && req.body.category !== "All")
            query.push({ category: req.body.category });

        if(req.body.subcategory && req.body.subcategory !== "All")
            query.push({ subcategory: req.body.subcategory });

        if(req.body.condition && req.body.condition !== "All")
            query.push({ condition: req.body.condition });

        const adModel = require('../models/adModel');
        adModel.find(
            {$and: query},
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

            resData.contactNo = shop.contactNo;
            resData.shopName = shop.name;
            resData.shopAddress = shop.address;
            resData.showableShopDiscountTag = shop.showableDiscountTag;
            resData.shopLocation = shop.location;
            resData.coordinate = {
                lat: shop.coordinate.coordinates[1],
                long: shop.coordinate.coordinates[0]
            }
            resData.numberOfAds = results.length;

            resData.category = shop.category;
            resData.subcategory = shop.subcategory;
            resData.rating = shop.avgRating;
            resData.numberOfRatings = shop.numberOfRatings;
            resData.numberOfComments = shop.numberOfComments;
            resData.totalNumberOfAds = shop.numberOfAds;
            resData.shoppingCount = shop.shoppingCount;
            resData.photo = shop.photos[0];

            fetchAdCategories(res,resData,{shopID: shop.id,isDeleted: false},() => {
                resData.status = "success";
                isAuthenticated(req,res,resData,(user) => {
                    if(user) {
                        resData.name = user.name;
                        resData.cartItemNumber = user.cartItemNumber;
                    }
                    res.json(resData);
                });
            });
        });
    });
});

module.exports = router;