
const adModel = require('../models/adModel');
const bulkSave = require('./bulkSave');

const restoreQuantityOnOrderCancel = (itemsArrangedByStoppages,res,resData) => {
    let adsToAdjust = {};
    itemsArrangedByStoppages.forEach(point => {
        point.items.forEach(item => {
            let adKey = item.adID.toString();
            if(adsToAdjust[adKey])
                adsToAdjust[adKey] += item.quantity;
            else
                adsToAdjust[adKey] = item.quantity;
        });
    });

    let adIDs = Object.keys(adsToAdjust);
    adModel.find({ _id: { $in : adIDs }},(err,ads) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        if(!ads || adIDs.length !== ads.length) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        ads.forEach(ad => {
            let quantity = adsToAdjust[ad.id.toString()];
            ad.numOfItems += quantity;
        });

        bulkSave(ads,() => {
            resData.status = "success";
            res.json(resData);
        });
    });
}

module.exports = restoreQuantityOnOrderCancel;