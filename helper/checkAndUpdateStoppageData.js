
const checkItemPriceUpdate = require('./checkItemPriceUpdate');
const calculateStoppageWaitingCharge = require('./calculateStoppageWaitingCharge');
const getShippingClass = require('./getShippingClass');
const calculateExtraDistanceCharge = require('./calculateExtraDistanceCharge');
const calculateExtraWeightCharge = require('./calculateExtraWeightCharge');
const calculateShippingCharge = require('./calculateShippingCharge');
const calculateItemDiscounts = require('./calculateItemDiscounts');
const calculateShippingDiscounts = require('./calculateShippingDiscounts');
const calculateFinalDiscount = require('./calculateFinalDiscount');

const checkAndUpdateStoppageData = (checkout,adData,preOrder) => {
    let stoppageUpdated = false;
    checkout.itemsArrangedByStoppages.forEach(point => {
        let itemUpdated = false;
        let shop = adData[point.items[0].adID.toString()].ad.shopID;
        if(shop && point.version !== shop.version) {
            itemUpdated = true;
            point.version = shop.version
        }
        point.items.forEach(item => {
            let key = item.adID.toString();
            let ad = adData[key].ad;
            if(checkItemPriceUpdate(item,ad,shop,itemUpdated) && !itemUpdated) {
                itemUpdated = true;
            }
        });
        if(itemUpdated) {
            stoppageUpdated = true;
            point.subtotal = point.governmentCharge = point.extraCharge = point.total = point.totalWeight = 0;
            point.items.forEach(item => {
                point.subtotal += item.totalPrice;
                point.governmentCharge += item.governmentCharge;
                point.extraCharge += item.extraCharge;
                point.total += item.netPrice;
                point.totalWeight += item.netWeight;
            })
        }
    })

    if(stoppageUpdated) {
        checkout.subtotal = checkout.totalGovernmentCharge = checkout.totalExtraCharge = checkout.total = checkout.totalWeight = 0;
        let distanceUpdated = checkout.distance && checkout.location && checkout.userCoordinate;
        let totalWaitingTime = 0;
        let totalItemDiscount = 0;
        let totalShippingDiscount = 0;
        let items = [];
        checkout.itemsArrangedByStoppages.forEach(point => {
            checkout.subtotal += point.subtotal;
            checkout.totalGovernmentCharge += point.governmentCharge;
            checkout.totalExtraCharge += point.extraCharge;
            checkout.total += point.total;
            checkout.totalWeight += point.totalWeight;

            let shopDiscounts = point.type === "Shop" ? ad.shopID.discounts : null;
            let ad = adData[point.items[0].adID.toString()].ad;

            if(!preOrder) {
                let processingCapacity = point.type === "Shop" ? ad.shopID.processingCapacity : ad.processingCapacity;
                totalWaitingTime = calculateStoppageWaitingCharge(point,adData,processingCapacity,totalWaitingTime);
            }

            calculateItemDiscounts(point,adData,shopDiscounts);
            totalItemDiscount += point.itemDiscount;
            if(distanceUpdated) {
                let pointShippingClass = getShippingClass(point.userDistance,point.totalWeight);
                let stoppageWaitingCharge = point.stoppageWaitingTime > 60 ? point.stoppageWaitingTime - 60 : 0;
                point.stoppageShippingCharge = stoppageWaitingCharge + calculateShippingCharge(point.total - point.itemDiscount)
                    + calculateExtraDistanceCharge(pointShippingClass,point.userDistance,point.totalWeight)
                    + calculateExtraWeightCharge(point.items,pointShippingClass,point.totalWeight);

                calculateShippingDiscounts(point,shopDiscounts);
                totalShippingDiscount += point.shippingDiscount;
                point.items.forEach(item => {
                    items.push(item);
                });
            }
        });

        if(!preOrder) checkout.totalWaitingTime = totalWaitingTime;
        checkout.shippingCharge = calculateShippingCharge(checkout.total - totalItemDiscount);
        if(distanceUpdated) {
            let Class = getShippingClass(checkout.distance,checkout.totalWeight);
            console.log(Class);
            checkout.extraDistanceCharge = calculateExtraDistanceCharge(Class,checkout.distance,checkout.totalWeight);
            checkout.extraWeightCharge = calculateExtraWeightCharge(items,Class,checkout.totalWeight);
            calculateFinalDiscount(checkout,totalItemDiscount,totalShippingDiscount);
            let deliveryTime = (10 + checkout.totalWaitingTime + checkout.distance * 5) * 60;
            checkout.deliveryTime = deliveryTime > 1800 ? deliveryTime : 1800;
        }
    }

    return stoppageUpdated;
}

module.exports = checkAndUpdateStoppageData;