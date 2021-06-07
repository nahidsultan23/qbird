const isConflict = (shopPeriod,adPeriod) => {
    if(adPeriod.from < shopPeriod.from || adPeriod.to > shopPeriod.to)
        return true;
    return false;
}

const checkAvailablePeriodConflict = (shopHour,adHour) => {
    var conflict = false;
    if(shopHour.everyday && adHour.everyday) {
        if(isConflict(shopHour.everyday,adHour.everyday))
            conflict = true;
    }
    else if(shopHour.everyday && !adHour.everyday) {
        for(var key of Object.keys(adHour)) {
            if(isConflict(shopHour.everyday,adHour[key])) {
                conflict = true;
                break;
            }
        }
    }
    else if(!shopHour.everyday && adHour.everyday) {
        var keys = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];
        for(var key of keys) {
            if(shopHour[key]) {
                if(isConflict(shopHour[key],adHour.everyday)) {
                    conflict = true;
                    break;
                }
                adHour[key] = adHour.everyday;
            } else {
                adHour[key] = undefined;
            }
        }
        adHour.everyday = undefined;
    }
    else {
        for(var key of Object.keys(adHour)) {
            if(shopHour[key]) {
                if(isConflict(shopHour[key],adHour[key])) {
                    conflict = true;
                    break;
                }
            } else {
                adHour[key] = undefined;
            }
        }
    }

    return conflict;
}

module.exports = checkAvailablePeriodConflict;