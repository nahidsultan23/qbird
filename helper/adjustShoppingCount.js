
const adModel = require('../models/adModel');
const shopModel = require('../models/shopModel');
const bulkSave = require('./bulkSave');

const adjustShoppingCount = (itemsArrangedByStoppages,res,resData) => {
    const mongoose = require('mongoose');
    let myAds = {};
    let myShops = {};
    itemsArrangedByStoppages.forEach(point => {
        point.items.forEach(item => {
            var adID = mongoose.Types.ObjectId(item.adID);
            if(myAds[adID])
                myAds[adID] += item.quantity;
            else
                myAds[adID] = item.quantity;
        })
        if(point.type === 'Shop') {
            var shopID = mongoose.Types.ObjectId(point.stoppageID);
            myShops[shopID] = point.stoppageTotal;
        }
    })

    let shopIDs = Object.keys(myShops);
    shopModel.find({_id: {$in : shopIDs}},(err,shops) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        if(!shops || shopIDs.length !== shops.length) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        let adIDs = Object.keys(myAds);
        adModel.find({_id: {$in : adIDs}},(err,ads) => {
            if(err) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!ads || adIDs.length !== ads.length) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            shops.forEach(shop => {
                shop.shoppingCount += 1;

                var sale = myShops[shop.id];
                var currentDate = new Date(Date.now() + 21600000);
                var currentYear = currentDate.getFullYear();
                var monthIndex = currentDate.getMonth();
                var length = shop.yearlySale.length;

                if(length < 1 || shop.yearlySale[length-1].year !== currentYear) {
                    var monthlySale = new Array(12).fill(0);
                    monthlySale[monthIndex] = sale;
                    shop.yearlySale.push({
                        year: currentYear,
                        sale: sale,
                        monthlySale: monthlySale
                    })
                }
                else {
                    shop.yearlySale[length-1].sale += sale;
                    shop.yearlySale[length-1].monthlySale[monthIndex] += sale;
                    
                    //This portion has been added because the sale is not being added with the monthly sale
                    let firstMonthSale = shop.yearlySale[length-1].monthlySale[0];
                    shop.yearlySale[length-1].monthlySale.shift();
                    shop.yearlySale[length-1].monthlySale.unshift(firstMonthSale);
                    //The above portion has been added because the sale is not being added with the monthly sale
                }

                var todayDate = currentDate.getDate();
                if(shop.dailySale.length === 0 || shop.dailySale[0].length > todayDate) {
                    var currentMonthSale = new Array(todayDate).fill(0);
                    currentMonthSale[todayDate-1] = sale;
                    shop.dailySale.unshift(currentMonthSale);
                    if(shop.dailySale.length > 4)
                        shop.dailySale.pop();
                }
                else if(shop.dailySale[0].length == todayDate) {
                    var currentMonthSale = shop.dailySale[0];
                    currentMonthSale[todayDate-1] += sale;
                    shop.dailySale.shift();
                    shop.dailySale.unshift(currentMonthSale);
                }
                else {
                    var currentMonthSale = new Array(todayDate).fill(0);
                    let dailySaleCount = shop.dailySale[0].length;
                    for(let i=0; i<dailySaleCount; i++) {
                        currentMonthSale[i] = shop.dailySale[0][i];
                    }
                    
                    currentMonthSale[todayDate - 1] = sale;
                    shop.dailySale.shift();
                    shop.dailySale.unshift(currentMonthSale);
                }
            });
            ads.forEach(ad => {
                ad.shoppingCount += myAds[ad.id];
            });
            bulkSave(shops,() => {
                bulkSave(ads,() => {
                    resData.status = "success";
                    res.json(resData);
                })
            });
        });
    });
}

module.exports = adjustShoppingCount;