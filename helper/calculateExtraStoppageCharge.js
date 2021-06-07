
const calculateExtraStoppageCharge = (itemsArrangedByStoppages) => {
    if(itemsArrangedByStoppages.length > 10) {
        for(var i = 10; i<itemsArrangedByStoppages.length; i++) {
            itemsArrangedByStoppages[i].items.forEach(item => {
                if(!item.checkoutErrorMessage) {
                    item.checkoutErrorMessage = "An order cannot have more than 10 stoppages";
                    item.errorCode = 8;
                }
            })
        }
    }

    var i = 0;
    totalDistance = 0;
    while(i < itemsArrangedByStoppages.length && i < 10 && totalDistance <= 10) {
        totalDistance += itemsArrangedByStoppages[i].distance;
        i++;
    }
    if(totalDistance > 10) {
        i--;
        while(i < itemsArrangedByStoppages.length && i < 10) {
            itemsArrangedByStoppages[i].items.forEach(item => {
                if(!item.checkoutErrorMessage) {
                    item.checkoutErrorMessage = "Total distance among the stoppages cannot be more than 10 km";
                    item.errorCode = 9;
                }
            })
            i++;
        }
    }

    let extraStoppageCharge = 0;
    itemsArrangedByStoppages.forEach(point => {
        if(point.distance < 0.1)
            return;

        // calculate extraStoppageCharge
        if(point.distance <= 1) {
            extraStoppageCharge += 5;
        }
        else {
            let roundedDistance = Math.round(point.distance);
            switch(roundedDistance) {
                case 1:
                    extraStoppageCharge += 5;
                    break;
                case 2:
                    extraStoppageCharge += 10;
                    break;
                case 3:
                    extraStoppageCharge += 15;
                    break;
                case 4:
                    extraStoppageCharge += 20;
                    break;
                case 5:
                    extraStoppageCharge += 25;
                    break;
                default:
                    point.items.forEach(item => {
                        if(!item.checkoutErrorMessage) {
                            item.checkoutErrorMessage = "Distance between two nearest stoppages cannot be more than 5 km";
                            item.errorCode = 10;
                        }
                    });
            }
        }
    });

    return extraStoppageCharge;
}

module.exports = calculateExtraStoppageCharge;