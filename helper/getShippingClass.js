const getShippingClass = (distance,totalWeight) => {
    let Class = "";

    if(distance <= 30) {
        if(totalWeight <= 10)
            Class = "C";
        else if(totalWeight <= 100)
            Class = "R";
        else if(totalWeight <= 500)
            Class = "V";
        else
            Class = "T";
    }
    else {
        if(totalWeight <= 20)
            Class = "BR";
        else
            Class = "T";
    }

    return Class;
}

module.exports = getShippingClass;