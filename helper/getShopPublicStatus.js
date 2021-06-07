const getCurrentDateTime = require('./getCurrentDateTime');

const getShopPublicStatus = (shop) => {
    if(shop.forceOpen) return "Open";
    if(!shop.active) return "Unavailable";

    const {currentTime,dayOfWeek} = getCurrentDateTime();

    if(shop.openingHours) {
        const todayOpenningHour = shop.openingHours['everyday'] ? shop.openingHours['everyday'] : shop.openingHours[dayOfWeek];
        if(!todayOpenningHour || currentTime < todayOpenningHour.from || currentTime > todayOpenningHour.to)
            return "Closed";
    }

    if(shop.midBreaks) {
        const todayMidBreak = shop.midBreaks['everyday'] ? shop.midBreaks['everyday'] : shop.midBreaks[dayOfWeek];
        if(todayMidBreak && (currentTime >= todayMidBreak.from && currentTime <= todayMidBreak.to))
            return "Mid Break";
    }

    return "Open";
}

module.exports = getShopPublicStatus;