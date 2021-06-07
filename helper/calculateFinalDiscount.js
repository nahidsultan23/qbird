const calculateFinalDiscount = (checkout,totalItemDiscount,totalShippingDiscount) => {
    let extraWaitingCharge = checkout.totalWaitingTime > 60 ? checkout.totalWaitingTime - 60 : 0;
    let totalShippingCharge = checkout.shippingCharge + extraWaitingCharge + checkout.extraStoppageCharge + checkout.extraDistanceCharge + checkout.extraWeightCharge;

    //This portion is making the "qbirdCharge" zero

    let qbirdCharge = 0;

    //The above portion is making the "qbirdCharge" zero

    /************** Uncomment this portion to apply "qbirdCharge"
    
    let qbirdCharge = totalShippingCharge * 0.1;

    **************/
    
    let waiver = 0;
    
    checkout.calculationsForDeliveryPerson = {shippingCharge: totalShippingCharge - qbirdCharge, qbirdCharge: qbirdCharge, waiver: waiver};

    if(totalShippingDiscount > totalShippingCharge) {
        checkout.calculationsForDeliveryPerson.qbirdCharge += totalShippingDiscount - totalShippingCharge;
        totalShippingDiscount = totalShippingCharge;
    }

    checkout.calculationsForUser = {discount: Math.round((totalShippingDiscount + totalItemDiscount)*100)/100};

    checkout.total = checkout.subtotal + checkout.totalGovernmentCharge + checkout.totalExtraCharge + totalShippingCharge - checkout.calculationsForUser.discount;
}

module.exports = calculateFinalDiscount;