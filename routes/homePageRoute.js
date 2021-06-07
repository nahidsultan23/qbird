const express = require('express');
const isAuthenticated = require('../helper/isAuthenticated');
const adModel = require('../models/adModel');
const router = express.Router();

const prepareItemData = (element,ad) => {
    var itemData = {
        itemID: element.id,
        photo: element.photo
    };
    if(ad) {
        itemData.adID = ad.id;
        itemData.adName = ad.name;
        itemData.condition = ad.condition;
        itemData.for = ad.for;
        itemData.price = ad.price;
        itemData.originalPrice = ad.originalPrice;
        itemData.showableDiscountTag = ad.showableDiscountTag;
        itemData.pricePer = ad.pricePer;
        itemData.description = ad.description;
        itemData.rating = ad.avgRating;
        if(ad.shopID)
            itemData.showableShopDiscountTag = ad.shopID.showableDiscountTag;
    }

    return itemData;
}

router.post('/home',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        },
        topSlider: [],
        secondSlider: [],
        latest: [],
        special: [],
        featured: [],
        spanA: [],
        spanB: [],
        spanC: [],
        trending: [],
        bestseller: [],
        name: "",
        cartItemNumber: ""
    } 

    isAuthenticated(req,res,resData,(user) => {
        if(user) {
            resData.name = user.name;
            resData.cartItemNumber = user.cartItemNumber;
        }

        const homePageDataModel = require('../models/homePageDataModel');
        homePageDataModel.findOne({})
        .populate("topSlider.shopID",'urlName name showableDiscountTag')
        .exec((err,homePageData) => {
            if(err) {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(homePageData) {
                homePageData.topSlider.forEach(element => {
                    resData.topSlider.push({
                        itemID: element.id,
                        shopID: element.shopID ? element.shopID._id : undefined,
                        urlName: element.shopID ? element.shopID.urlName : undefined,
                        shopName: element.shopID ? element.shopID.name : undefined,
                        smallLine: element.smallLine,
                        biggerLine: element.biggerLine,
                        photo: element.photo,
                        showableDiscountTag: element.shopID ? element.shopID.showableDiscountTag : undefined
                    });
                });
                homePageData.secondSlider.slice(0,15).forEach(element => {
                    resData.secondSlider.push({
                        itemID: element.id,
                        categoryName: element.categoryName,
                        numberOfItems: element.numberOfItems,
                        photo: element.photo
                    });
                });

                let keys = ['latest','special','featured','spanA','spanB','spanC','trending','bestseller'];
                let adIDs = [];
                keys.forEach(key => {
                    homePageData[key].slice(0,12).forEach(element => {
                        adIDs.push(element.adID)
                    })
                })

                adModel.find({_id: { $in: adIDs}},{name:1,condition:1,for:1,price:1,originalPrice:1,showableDiscountTag:1,pricePer:1,description:1,avgRating:1}).populate('shopID','showableDiscountTag').exec((err,ads) => {
                    if(err) {
                        console.log(err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    keys.forEach(key => {
                        homePageData[key].forEach(element => {
                            let ad = ads.find(ad => ad.id.toString() === element.adID.toString());
                            if(ad)
                                resData[key].push(prepareItemData(element,ad));
                        });
                    })
    
                    resData.status = 'success';
                    res.json(resData);
                })
            }
            else {
                resData.status = 'success';
                res.json(resData);
            }   
        });
    });
});

module.exports = router;