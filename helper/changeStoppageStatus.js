
const calculateEstimatedDistance = require('./calculateEstimatedDistance');
const calculateShippingCharge = require('./calculateShippingCharge');
const calculateExtraStoppageCharge = require('./calculateExtraStoppageCharge');
const getShippingClass = require('./getShippingClass');
const calculateExtraDistanceCharge = require('./calculateExtraDistanceCharge');
const calculateExtraWeightCharge = require('./calculateExtraWeightCharge');
const calculateFinalDiscount = require('./calculateFinalDiscount');
const calculateStoppageWaitingCharge = require('./calculateStoppageWaitingCharge');
const calculateItemDiscounts = require('./calculateItemDiscounts');
const calculateShippingDiscounts = require('./calculateShippingDiscounts');
const adModel = require('../models/adModel');

const setStopageDataResponse = (stoppage,resData) => {
    resData.stoppageStatus = stoppage.stoppageStatus;
    resData.initialization = stoppage.initialization;
    resData.numberOfItems = stoppage.numberOfItems;
    resData.coordinate = stoppage.coordinate;
    resData.total = stoppage.total;
    resData.discount = stoppage.discount;
    resData.stoppageTotal = stoppage.stoppageTotal;
    resData.items = [];
    stoppage.items.forEach(item => {
        resData.items.push({
            itemID: item.id,
            name: item.name,
            photo: item.photo,
            available: item.available,
            options: item.options,
            quantity: item.quantity,
            price: item.netPrice,
            totalQuantity: item.quantity + item.numberOfUnavailableQuantity
        })
    })
}

const makeItemUnavailable = (stoppage,item) => {
    if(!item.available) return;
    item.available = false;

    stoppage.subtotal -= item.totalPrice;
    stoppage.governmentCharge -= item.governmentCharge;
    stoppage.extraCharge -= item.extraCharge;
    stoppage.total -= item.netPrice;
    stoppage.totalWeight -= item.netWeight;

    if(item.numberOfUnavailableQuantity) {
        let factor = (item.quantity + item.numberOfUnavailableQuantity) / item.quantity;
        item.quantity += item.numberOfUnavailableQuantity;
        item.numberOfUnavailableQuantity = 0;
        item.totalPrice *= factor;
        item.governmentCharge *= factor;
        item.extraCharge *= factor;
        item.netPrice *= factor;
        item.netWeight *= factor;
    }
}

const makeItemAvailable = (stoppage,item) => {
    if(item.available) return;
    item.available = true;

    stoppage.subtotal += item.totalPrice;
    stoppage.governmentCharge += item.governmentCharge;
    stoppage.extraCharge += item.extraCharge;
    stoppage.total += item.netPrice;
    stoppage.totalWeight += item.netWeight;
}

const adjustStoppageDataAsync = (stoppage,cb,ecb) => {
    let adData = {};
    stoppage.items.forEach(item => {
        if(!item.available) return;

        let key = item.adID.toString();
        if(!adData[key]) {
            adData[key] = {quantity: item.quantity};
        }
        else {
            adData[key].quantity += item.quantity;
        }
    })
    let adIDs = Object.keys(adData);
    adModel.find({_id: { $in: adIDs}}, {leadTime: 1, discounts: 1, processingCapacity: 1})
    .populate('shopID','discounts processingCapacity')
    .exec((err,ads) => {
        if(err || !ads || ads.length !== adIDs.length) {
            return ecb();
        }

        ads.forEach(ad => {
            let key = ad.id.toString();
            adData[key].ad = ad;
        })
        let shopDiscounts = null;
        if(stoppage.type === "Shop") {
            calculateStoppageWaitingCharge(stoppage,adData,ads[0].shopID.processingCapacity,0);
            shopDiscounts = ads[0].shopID.discounts;
        }
        else {
            calculateStoppageWaitingCharge(stoppage,adData,ads[0].processingCapacity,0);
        }

        calculateItemDiscounts(stoppage,adData,shopDiscounts);
        let pointShippingClass = getShippingClass(stoppage.userDistance,stoppage.totalWeight);
        let stoppageWaitingCharge = stoppage.stoppageWaitingTime > 60 ? stoppage.stoppageWaitingTime - 60 : 0;
        stoppage.stoppageShippingCharge = stoppageWaitingCharge + calculateExtraDistanceCharge(pointShippingClass,stoppage.userDistance,stoppage.totalWeight)
            + calculateShippingCharge(stoppage.total - stoppage.itemDiscount) + calculateExtraWeightCharge(stoppage.items,pointShippingClass,stoppage.totalWeight);

        calculateShippingDiscounts(stoppage,shopDiscounts);
        cb();
    });
}

const adjustOrderData = (order,updateDistance,cb) => {
    order.total = order.grossTotal = order.subtotal + order.totalExtraCharge + order.totalGovernmentCharge;
    if(updateDistance) {
        calculateEstimatedDistance(order,order.shippingLocation.coordinate, () => {
            order.extraStoppageCharge = calculateExtraStoppageCharge(order.itemsArrangedByStoppages);
            let totalItemDiscount = 0;
            let totalShippingDiscount = 0;
            let items = [];
            order.itemsArrangedByStoppages.forEach(point => {
                if(point.stoppageStatus === "Unavailable") return;

                totalItemDiscount += point.itemDiscount;
                totalShippingDiscount += point.shippingDiscount;
                point.items.forEach(item => {
                    items.push(item);
                });
            })
            order.shippingCharge = calculateShippingCharge(order.total - totalItemDiscount);
            let Class = getShippingClass(order.distance,order.totalWeight);
            order.extraDistanceCharge = calculateExtraDistanceCharge(Class,order.distance,order.totalWeight);
            order.extraWeightCharge = calculateExtraWeightCharge(items,Class,order.totalWeight);
            calculateFinalDiscount(order,totalItemDiscount,totalShippingDiscount);
            let deliveryTime = (10 + order.totalWaitingTime + order.distance * 5) * 60;
            order.deliveryTime = deliveryTime > 1800 ? deliveryTime : 1800;

            return cb();
        });
    }
    else {
        let totalItemDiscount = 0;
        let totalShippingDiscount = 0;
        let items = [];
        order.itemsArrangedByStoppages.forEach(point => {
            if(point.stoppageStatus === "Unavailable") return;

            totalItemDiscount += point.itemDiscount;
            totalShippingDiscount += point.shippingDiscount;
            point.items.forEach(item => {
                items.push(item);
            });
        })
        order.shippingCharge = calculateShippingCharge(order.total - totalItemDiscount);
        let Class = getShippingClass(order.distance,order.totalWeight);
        order.extraDistanceCharge = calculateExtraDistanceCharge(Class,order.distance,order.totalWeight);
        order.extraWeightCharge = calculateExtraWeightCharge(items,Class,order.totalWeight);
        calculateFinalDiscount(order,totalItemDiscount,totalShippingDiscount);
        let deliveryTime = (10 + order.totalWaitingTime + order.distance * 5) * 60;
        order.deliveryTime = deliveryTime > 1800 ? deliveryTime : 1800;

        return cb();
    }
}

const makeUnavailable = (order,stoppageIndex,cb) => {
    let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
    order.totalWeight -= stoppage.totalWeight;
    order.subtotal -= stoppage.subtotal;
    order.totalGovernmentCharge -= stoppage.governmentCharge;
    order.totalExtraCharge -= stoppage.extraCharge;
    order.totalWaitingTime -= stoppage.stoppageWaitingTime;

    stoppage.items.forEach(item => makeItemUnavailable(stoppage,item));
    stoppage.stoppageStatus = "Unavailable";
    stoppage.discount = 0;
    stoppage.stoppageTotal = 0;
    order.unavailableStoppages.push(stoppage);
    order.itemsArrangedByStoppages[stoppageIndex] = order.itemsArrangedByStoppages[order.itemsArrangedByStoppages.length -1];
    order.itemsArrangedByStoppages.pop();
    adjustOrderData(order,true, () => {
        return cb();
    });
}

const makeAvailableAsync = (order,stoppageIndex,res,resData) => {
    let stoppage = order.unavailableStoppages[stoppageIndex];
    stoppage.items.forEach(item => makeItemAvailable(stoppage,item));
    stoppage.stoppageStatus = "Pending";
    order.itemsArrangedByStoppages.push(stoppage);
    order.unavailableStoppages[stoppageIndex] = order.unavailableStoppages[order.unavailableStoppages.length -1];
    order.unavailableStoppages.pop();

    stoppage = order.itemsArrangedByStoppages[order.itemsArrangedByStoppages.length - 1];
    order.totalWeight += stoppage.totalWeight;
    order.subtotal += stoppage.subtotal;
    order.totalGovernmentCharge += stoppage.governmentCharge;
    order.totalExtraCharge += stoppage.extraCharge;

    adjustStoppageDataAsync(stoppage,
        () => {
            order.totalWaitingTime += stoppage.stoppageWaitingTime;
            adjustOrderData(order,true, () => {
                order
                .save()
                .then(order => {
                    setStopageDataResponse(stoppage,resData);
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        },
        () => {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
    );
}

const makeItemUnavailableAsync = (order,stoppageIndex,item,res,resData) => {
    let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
    order.totalWeight -= item.netWeight;
    order.subtotal -= item.totalPrice;
    order.totalGovernmentCharge -= item.governmentCharge;
    order.totalExtraCharge -= item.extraCharge;
    
    order.totalWaitingTime -= stoppage.stoppageWaitingTime;
    makeItemUnavailable(stoppage,item);

    let allUnavailable = true;
    stoppage.items.forEach(item => {
        if(item.available) {
            allUnavailable = false;
            return;
        }
    });

    if(allUnavailable) {
        stoppage.stoppageStatus = "Unavailable";
        stoppage.discount = 0;
        stoppage.stoppageTotal = 0;
        order.unavailableStoppages.push(stoppage);
        order.itemsArrangedByStoppages[stoppageIndex] = order.itemsArrangedByStoppages[order.itemsArrangedByStoppages.length -1];
        order.itemsArrangedByStoppages.pop();
        stoppage = order.unavailableStoppages[order.unavailableStoppages.length - 1];
        adjustOrderData(order,true, () => {
            order
            .save()
            .then(order => {
                setStopageDataResponse(stoppage,resData);
                resData.status = "success";
                res.json(resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    }
    else {
        adjustStoppageDataAsync(stoppage,
            () => {
                order.totalWaitingTime += stoppage.stoppageWaitingTime;
                adjustOrderData(order,false, () => {
                    order
                    .save()
                    .then(order => {
                        setStopageDataResponse(stoppage,resData);
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                });
            },
            () => {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
        );
    }
}

const makeItemAvailableAsync = (order,stoppageIndex,item,res,resData) => {
    let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
    makeItemAvailable(stoppage,item);
    order.totalWeight += item.netWeight;
    order.subtotal += item.totalPrice;
    order.totalGovernmentCharge += item.governmentCharge;
    order.totalExtraCharge += item.extraCharge;

    order.totalWaitingTime -= stoppage.stoppageWaitingTime;
    adjustStoppageDataAsync(stoppage,
        () => {
            order.totalWaitingTime += stoppage.stoppageWaitingTime;
            adjustOrderData(order,false, () => {
                order
                .save()
                .then(order => {
                    setStopageDataResponse(stoppage,resData);
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        },
        () => {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
    );
}

const changeItemQuantityAsync = (order,stoppageIndex,item,quantity,res,resData) => {
    if(!quantity) {
        return makeItemUnavailableAsync(order,stoppageIndex,item,res,resData);
    }
    let stoppage = order.itemsArrangedByStoppages[stoppageIndex];
    let totalQuantity = item.quantity + item.numberOfUnavailableQuantity;
    if(totalQuantity < quantity) {
        resData.errorMessage.fatalError = "Quantity to less exceeds the quantity exist!!";
        return res.json(resData);
    }

    order.totalWeight -= item.netWeight;
    order.subtotal -= item.totalPrice;
    order.totalGovernmentCharge -= item.governmentCharge;
    order.totalExtraCharge -= item.extraCharge;

    stoppage.subtotal -= item.totalPrice;
    stoppage.governmentCharge -= item.governmentCharge;
    stoppage.extraCharge -= item.extraCharge;
    stoppage.total -= item.netPrice;
    stoppage.totalWeight -= item.netWeight;

    let factor = quantity / item.quantity;
    item.quantity = quantity;
    item.numberOfUnavailableQuantity = totalQuantity - quantity;

    item.totalPrice *= factor;
    item.governmentCharge *= factor;
    item.extraCharge *= factor;
    item.netPrice *= factor;
    item.netWeight *= factor;

    stoppage.subtotal += item.totalPrice;
    stoppage.governmentCharge += item.governmentCharge;
    stoppage.extraCharge += item.extraCharge;
    stoppage.total += item.netPrice;
    stoppage.totalWeight += item.netWeight;

    order.totalWeight += item.netWeight;
    order.subtotal += item.totalPrice;
    order.totalGovernmentCharge += item.governmentCharge;
    order.totalExtraCharge += item.extraCharge;

    order.totalWaitingTime -= stoppage.stoppageWaitingTime;
    adjustStoppageDataAsync(stoppage,
        () => {
            order.totalWaitingTime += stoppage.stoppageWaitingTime;
            adjustOrderData(order,true, () => {
                order
                .save()
                .then(order => {
                    setStopageDataResponse(stoppage,resData);
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        },
        () => {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
    );
}

module.exports = {
    makeAvailableAsync: makeAvailableAsync,
    makeUnavailable: makeUnavailable,
    makeItemAvailableAsync: makeItemAvailableAsync,
    makeItemUnavailableAsync: makeItemUnavailableAsync,
    changeItemQuantityAsync: changeItemQuantityAsync,
    setStopageDataResponse: setStopageDataResponse
};