const wishListModel = require('../models/wishListModel');

module.exports = (res,resData,userID) => {
    wishListModel.aggregate([
        { $match: {userID: userID}},
        { $lookup:{from: 'ads', localField: 'adID', foreignField: '_id', as: 'my_ads'} },
        { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$my_ads", 0 ] }, "$$ROOT" ] }}},
        { $addFields: {wishlistErrorMessage: {$cond: ['$isDeleted',"Item is not available",""]}}},
        { $project: {adID:1,shopID:1,shopName:1,name:1,description:1,price:1,pricePer:1,wishlistErrorMessage:1,photos:1,_id:0}}
    ])
    .exec( function (err, wishList) {
        if(err || wishList === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        wishList.forEach(wli => {
            wli.photo = wli.photos ? wli.photos[0] : null;
            wli.photos = undefined;
        })
        resData.wishlist = wishList;
        resData.status = 'success';
        res.json(resData);
    });
}