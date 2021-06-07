const adModel = require('../models/adModel');
const mongoose = require('mongoose');

module.exports = (items,from) => {
    let points = {}
    items.forEach(item => {
        let key = (item.shopID ? item.shopID.id : item.adID.id).toString();
        if(points[key]) {
            points[key].numberOfItems += 1;
            points[key].items.push({
                adID: item.adID.id,
                cartItemID: from !== 'buy-now' ? item.id : undefined,
                name: item.adID.name,
                adVersion: item.adVersion,
                photo: item.adID.photos[0],
                options: item.options,
                quantity: item.quantity,
                optionPrice: item.optionPrice,
                optionWeight: item.optionWeight,
                basePrice: item.basePrice,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                governmentCharge: item.governmentCharge,
                extraCharge: item.extraCharge,
                netPrice: item.netPrice,
                netWeight: item.weight
            });
            points[key].subtotal += item.totalPrice;
            points[key].governmentCharge += item.governmentCharge;
            points[key].extraCharge += item.extraCharge;
            points[key].total += item.netPrice;
            points[key].totalWeight += item.weight;
        }
        else {
            points[key] = {
                coordinate: {
                    lat: item.adID.coordinate.coordinates[1],
                    long: item.adID.coordinate.coordinates[0]
                },
                ownerID: item.adID.userID,
                address: item.adID.address,
                numberOfItems: 1,
                items: [
                    {
                        adID: item.adID.id,
                        cartItemID: from !== 'buy-now' ? item.id : undefined,
                        name: item.adID.name,
                        adVersion: item.adVersion,
                        photo: item.adID.photos[0],
                        options: item.options,
                        quantity: item.quantity,
                        optionPrice: item.optionPrice,
                        optionWeight: item.optionWeight,
                        basePrice: item.basePrice,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        governmentCharge: item.governmentCharge,
                        extraCharge: item.extraCharge,
                        netPrice: item.netPrice,
                        netWeight: item.weight
                    }
                ],
                subtotal: item.totalPrice,
                governmentCharge: item.governmentCharge,
                extraCharge: item.extraCharge,
                total: item.netPrice,
                totalWeight: item.weight
            };

            if(item.shopID) {
                points[key].type = "Shop";
                points[key].stoppageID = item.shopID.id;
                points[key].name = item.shopID.name;
                points[key].version = item.shopID.version;
                points[key].photo = item.shopID.photos[0];
            }
            else {
                points[key].type = "Individual Ad";
                points[key].stoppageID = item.adID.id;
                points[key].name = item.adID.name;
                points[key].version = item.adID.version;
                points[key].photo = item.adID.photos[0];
            }
        }
    })

    return Object.values(points)
}