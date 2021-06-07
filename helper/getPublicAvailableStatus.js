const getCurrentDateTime = require('./getCurrentDateTime');
const getShopPublicStatus = require('./getShopPublicStatus');

const getPublicAvailableStatus = (ad,shop) => {
    if(!ad.available) return "Unavailable";

    let openingHours = ad.availableHours;
    let midBreaks = ad.midBreaks;

    if(shop) {
        let shopStatus = getShopPublicStatus(shop);
        if(shopStatus === "Unavailable") return "Shop Unavailable";
        if(shopStatus === "Closed") return "Shop Closed";
        if(shopStatus !== "Open") return shopStatus;

        if(ad.sameAsShopOpeningHours) {
            if(shop.forceOpen) return "Available";
            openingHours = shop.openingHours;
            midBreaks = shop.midBreaks;
        }
        else {
            midBreaks = shop.forceOpen ? undefined : shop.midBreaks;
        }
    }

    if(ad.parcel && !ad.numOfItems) return "Out of Stock";

    const {currentTime,dayOfWeek} = getCurrentDateTime();

    if(openingHours) {
        const todayOpenningHour = openingHours['everyday'] ? openingHours['everyday'] : openingHours[dayOfWeek];
        if(!todayOpenningHour || currentTime < todayOpenningHour.from || currentTime > todayOpenningHour.to)
            return "Unavailable";
    }

    if(midBreaks) {
        const todayMidBreak = midBreaks['everyday'] ? midBreaks['everyday'] : midBreaks[dayOfWeek];
        if(todayMidBreak && (currentTime >= todayMidBreak.from && currentTime <= todayMidBreak.to))
            return "Unavailable";
    }

    return "Available";
}

module.exports = getPublicAvailableStatus;