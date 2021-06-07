const sendbuyNowItem = (res,buyNowItem,resData) => {
    let itemUpdated = false;

    resData.adID = buyNowItem.adID.id;
    resData.adName = buyNowItem.adID.name;
    if(buyNowItem.shopID) {
        resData.shopID = buyNowItem.shopID.id;
        resData.shopName = buyNowItem.shopID.name;
        buyNowItem.adID.governmentCharge = buyNowItem.shopID.governmentCharge;
        buyNowItem.adID.governmentChargeDescription = buyNowItem.shopID.governmentChargeDescription;
        buyNowItem.adID.extraCharge = buyNowItem.shopID.extraCharge;
        buyNowItem.adID.extraChargeDescription = buyNowItem.shopID.extraChargeDescription;

        if(buyNowItem.shopVersion !== buyNowItem.shopID.version) {
            buyNowItem.shopVersion = buyNowItem.shopID.version;
            itemUpdated = true;
        }
    }
    resData.governmentChargePercentage = buyNowItem.adID.governmentCharge;
    resData.governmentChargeDescription = buyNowItem.adID.governmentChargeDescription;
    resData.extraChargePercentage = buyNowItem.adID.extraCharge;
    resData.extraChargeDescription = buyNowItem.adID.extraChargeDescription;
    resData.photo = buyNowItem.adID.photos ? buyNowItem.adID.photos[0] : null;

    if(buyNowItem.adID.version !== buyNowItem.adVersion) {
        buyNowItem.adVersion = buyNowItem.adID.version;
        buyNowItem.basePrice = buyNowItem.adID.price + buyNowItem.adID.parcelPrice
        buyNowItem.unitPrice = buyNowItem.basePrice + buyNowItem.optionPrice;
        itemUpdated = true;
    }
    if(itemUpdated) {
        buyNowItem.totalPrice = buyNowItem.unitPrice * buyNowItem.quantity;
        buyNowItem.governmentCharge = Math.round(buyNowItem.totalPrice * buyNowItem.adID.governmentCharge)/100;
        buyNowItem.extraCharge = Math.round(buyNowItem.totalPrice * buyNowItem.adID.extraCharge)/100;
        buyNowItem.netPrice = Math.round((buyNowItem.totalPrice + buyNowItem.governmentCharge + buyNowItem.extraCharge)*100)/100;
        buyNowItem.weight = Math.round((buyNowItem.adID.parcelWeightInKg + buyNowItem.optionWeight) * buyNowItem.quantity * 100)/100;
    }
    let keys = ['basePrice','unitPrice','totalPrice','governmentCharge','extraCharge','netPrice','weight','options','quantity']
    keys.forEach(key => resData[key] = buyNowItem[key]);

    resData.otherCharges = resData.governmentCharge + resData.extraCharge;
    resData.netPayable = resData.netPrice;

    if(resData.buyNowErrorMessage) {
        resData.governmentCharge = 0;
        resData.extraCharge = 0;
        resData.totalPrice = 0;
        resData.netPayable = 0;
    }
    if(itemUpdated) {
        buyNowItem.save()
        .then(buyNowItem => {
            res.json(resData);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.status = "failure";
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    }
    else {
        res.json(resData);
    }
}

module.exports = sendbuyNowItem;