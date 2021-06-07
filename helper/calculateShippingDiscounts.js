

const calculateShippingDiscounts = (point,shopDiscounts) => {
    point.shippingDiscount = 0;
    if(point.type === "Shop") {
        shopDiscounts.forEach(discount => {
            if(discount.discountOn === 'Shipping Charge') {
                let roundedMinOrder = Math.round(discount.minOrder * 100)/100;
                let roundedMaxOrder = Math.round(discount.maxOrder * 100)/100;
                let roundedTotal = Math.round(point.total * 100)/100;
                if(roundedTotal < roundedMinOrder || roundedTotal > roundedMaxOrder) return;
                if(discount.discountType === 'Percentage') {
                    let discountAmount = point.stoppageShippingCharge * discount.discount / 100;
                    point.shippingDiscount += discountAmount > discount.maxAmount ? discount.maxAmount : discountAmount;
                }
                else {
                    point.shippingDiscount += discount.discount;
                }
            }
        })
    }

    if(point.shippingDiscount > point.stoppageShippingCharge) {
        point.shippingDiscount = point.stoppageShippingCharge;
    }

    point.discount = point.shippingDiscount + point.itemDiscount;
    if(point.discount <= point.total) {
        point.stoppageTotal = point.total - point.discount;
    }
    else {
        let exceededDiscountAmount = point.discount - point.total;
        point.discount = point.total;
        point.stoppageTotal = 0;
        point.itemDiscount -= exceededDiscountAmount;
        if(point.itemDiscount < 0) {
            point.shippingDiscount += point.itemDiscount;
            point.itemDiscount = 0;
        }
    }
}

module.exports = calculateShippingDiscounts;