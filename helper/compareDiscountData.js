const isSame = (d1,d2,withMaxAmmount) => {
    if(d1.discountOn !== d2.discountOn || d1.discountType !== d2.discountType || d1.discount != d2.discount || d1.discountUnit !== d2.discountUnit
        || d1.minOrder != d2.minOrder || d1.minOrderUnit !== d2.minOrderUnit || d1.maxOrder != d2.maxOrder || d1.maxOrderUnit !== d2.maxOrderUnit)

        return false;

    if(withMaxAmmount && (d1.maxAmount != d2.maxAmount || d1.maxAmountUnit !== d2.maxAmountUnit))
        return false;

    return true;     
}

module.exports = (discounts1,discounts2,withMaxAmmount) => {
    if(discounts1.length !== discounts2.length)
        return false;

    for(var i=0; i<discounts1.length; i++) {
        if(discounts2.findIndex(d => isSame(d,discounts1[i]),withMaxAmmount) === -1)
            return false;
    }

    return true;
}