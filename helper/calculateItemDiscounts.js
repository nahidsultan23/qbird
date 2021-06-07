

const calculateItemDiscounts = (point,adData,shopDiscounts) => {
    point.itemDiscount = 0;
    let alreadyVisited = {};
    if(point.type === "Shop") {
        shopDiscounts.forEach(discount => {
            let roundedMinOrder = Math.round(discount.minOrder * 100)/100;
            let roundedMaxOrder = Math.round(discount.maxOrder * 100)/100;

            if(discount.discountOn === 'Subtotal') {
                let roundedSubtotal = Math.round(point.subtotal * 100)/100;
                if(roundedSubtotal < roundedMinOrder || roundedSubtotal > roundedMaxOrder) return;
                if(discount.discountType === 'Percentage') {
                    let discountAmount = point.subtotal * discount.discount / 100;
                    point.itemDiscount += discountAmount > discount.maxAmount ? discount.maxAmount : discountAmount;
                }
                else {
                    point.itemDiscount += discount.discount;
                }
            }
            else if(discount.discountOn === 'Total') {
                let roundedTotal = Math.round(point.total * 100)/100;
                if(roundedTotal < roundedMinOrder || roundedTotal > roundedMaxOrder) return;
                if(discount.discountType === 'Percentage') {
                    let discountAmount = point.total * discount.discount / 100;
                    point.itemDiscount += discountAmount > discount.maxAmount ? discount.maxAmount : discountAmount;
                }
                else {
                    point.itemDiscount += discount.discount;
                }
            }
        })
    }

    point.items.forEach(item => {
        if(!item.available) return;

        let key = item.adID.toString();
        if(alreadyVisited[key]) return;

        alreadyVisited[key] = true;
        let ad = adData[key].ad;
        let quantity = adData[key].quantity;
        ad.discounts.forEach(discount => {
            let roundedMinOrder = Math.round(discount.minOrder * 100)/100;
            let roundedMaxOrder = Math.round(discount.maxOrder * 100)/100;
            if(discount.discountOn !== 'Number' || quantity < roundedMinOrder || quantity > roundedMaxOrder) return;
            point.itemDiscount += discount.discount;
        });

    });
}

module.exports = calculateItemDiscounts;