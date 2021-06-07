

module.exports = (item,ad,shop,shopUpdated,forceUpdate) => {
    let itemUpdated = shopUpdated;
    if(ad.version !== item.adVersion) {
        itemUpdated = true;
        item.adVersion = ad.version;
        item.basePrice = ad.price + ad.parcelPrice
        item.unitPrice = item.basePrice + item.optionPrice;
    }
    if(forceUpdate || itemUpdated) {
        if(shop) {
            ad.governmentCharge = shop.governmentCharge;
            ad.extraCharge = ad.extraChargeApplicable ? shop.extraCharge : 0;
        }
        item.totalPrice = item.unitPrice * item.quantity;
        item.governmentCharge = Math.round(item.totalPrice * ad.governmentCharge)/100;
        item.extraCharge = Math.round(item.totalPrice * ad.extraCharge)/100;
        item.netPrice = Math.round((item.totalPrice + item.governmentCharge + item.extraCharge)*100)/100;
        item.weight = Math.round((ad.parcelWeightInKg + item.optionWeight) * item.quantity * 100)/100;
    }

    return itemUpdated;
}