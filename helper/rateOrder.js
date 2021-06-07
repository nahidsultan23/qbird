
const adModel = require('../models/adModel');
const adCommentModel = require('../models/adCommentModel');
const shopModel = require('../models/shopModel');
const shopCommentModel = require('../models/shopCommentModel');
const adjustRatingCount = require('./adjustRatingCount');
const deliveryPersonCommentModel = require('../models/deliveryPersonCommentModel');

const rateDeliveryPersonForOrder = (deliveryPersonRating,deliveryPerson,cb) => {
    if(deliveryPersonRating.rating && (deliveryPersonRating.rating > 0) && (deliveryPersonRating.rating <= 5)) {
        deliveryPerson.deliveryPersonInfo.ratings.push(deliveryPersonRating);
        deliveryPerson.deliveryPersonInfo.avgRating = (deliveryPerson.deliveryPersonInfo.avgRating * deliveryPerson.deliveryPersonInfo.numberOfRatings + parseInt(deliveryPersonRating.rating))/(deliveryPerson.deliveryPersonInfo.numberOfRatings + 1);
        deliveryPerson.deliveryPersonInfo.numberOfRatings += 1;

        deliveryPerson
        .save()
        .then(deliveryPerson => {
            new deliveryPersonCommentModel(deliveryPersonRating)
            .save()
            .then(comment => {
                cb();
            })
            .catch(err => {
                console.log("ERROR: "+err);
                cb();
            });
        })
        .catch(err => {
            console.log("ERROR: "+err);
            cb();
        });
    }
    else {
        cb();
    }
}

const rateShopsForOrder = (shopRatings,index,finalCb) => {
    if(index < 0)
        return finalCb();

    shopModel.findById(shopRatings[index].shopID,(err,shop) => {
        if(err) {
            console.log(err);
            rateShopsForOrder(shopRatings,index-1,finalCb);
        }
        else if(!shop) {
            rateShopsForOrder(shopRatings,index-1,finalCb);
        }
        else {
            shopRatings[index].rating = parseInt(shopRatings[index].rating);
            shop.ratings.push(shopRatings[index]);
            shop.avgRating = (shop.avgRating * shop.numberOfRatings + shopRatings[index].rating)/(shop.numberOfRatings + 1);
            shop.numberOfRatings += 1;
            adjustRatingCount(shop,shopRatings[index].rating);

            shop
            .save()
            .then(shop => {
                if(!shopRatings[index].comment)
                    return rateShopsForOrder(shopRatings,index-1,finalCb);

                new shopCommentModel(shopRatings[index])
                .save()
                .then(comment => {
                    rateShopsForOrder(shopRatings,index-1,finalCb);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    rateShopsForOrder(shopRatings,index-1,finalCb);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                rateShopsForOrder(shopRatings,index-1,finalCb);
            });
        }
    });
}

const rateAdsForOrder = (adRatings,index,finalCb) => {
    if(index < 0)
        return finalCb();

    adModel.findById(adRatings[index].adID,(err,ad) => {
        if(err) {
            console.log(err);
            rateAdsForOrder(adRatings,index-1,finalCb);
        }
        else if(!ad) {
            rateAdsForOrder(adRatings,index-1,finalCb);
        }
        else {
            ad.ratings.push(adRatings[index]);
            ad.avgRating = (ad.avgRating * ad.numberOfRatings + parseInt(adRatings[index].rating))/(ad.numberOfRatings + 1);
            ad.numberOfRatings += 1;
            adjustRatingCount(ad,adRatings[index].rating);

            ad
            .save()
            .then(ad => {
                if(!adRatings[index].comment)
                    return rateAdsForOrder(adRatings,index-1,finalCb);

                new adCommentModel(adRatings[index])
                .save()
                .then(comment => {
                    rateAdsForOrder(adRatings,index-1,finalCb);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    rateAdsForOrder(adRatings,index-1,finalCb);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                rateAdsForOrder(adRatings,index-1,finalCb);
            });
        }
    });
}

module.exports = {
    rateDeliveryPersonForOrder: rateDeliveryPersonForOrder,
    rateShopsForOrder: rateShopsForOrder,
    rateAdsForOrder: rateAdsForOrder
}