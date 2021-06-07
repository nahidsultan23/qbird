const calculateExtraWeightCharge = (items,Class,totalWeight) => {
    if(totalWeight <= 5) return 0;

    let extraWeightCharge = 0;
    if(Class === 'C') {
        extraWeightCharge = totalWeight * 1.5;
    }
    else if(Class === 'R') {
        extraWeightCharge = totalWeight;
        items.forEach(item => {
            if(!item.available) return;
            if(item.weight > 10 * item.quantity) {
                extraWeightCharge += 0.5 * item.weight;
            }
        })
    }
    else if(Class === 'V') {
        extraWeightCharge = 200 + 0.2 * totalWeight;
        items.forEach(item => {
            if(!item.available) return;
            let individualWeight = item.weight / item.quantity;
            if(individualWeight > 50) {
                extraWeightCharge += item.weight;
            }
            else if(individualWeight > 20) {
                extraWeightCharge += 0.8 * item.weight;
            }
            else if(individualWeight > 10) {
                extraWeightCharge += 0.5 * item.weight;
            }
        })
    }
    else if(Class === 'T') {
        extraWeightCharge = Math.floor(totalWeight / 40000) * 21000;
        let remainder = totalWeight % 40000;
        if(remainder > 0) {
            extraWeightCharge += 1000 + remainder * 0.5;
        }
        items.forEach(item => {
            if(!item.available) return;
            let individualWeight = item.weight / item.quantity;
            if(individualWeight > 50) {
                extraWeightCharge += item.weight;
            }
            else if(individualWeight > 20) {
                extraWeightCharge += 0.8 * item.weight;
            }
            else if(individualWeight > 10) {
                extraWeightCharge += 0.5 * item.weight;
            }
        })
    }
    else {// Class = BR
        extraWeightCharge = 100 + totalWeight;
        items.forEach(item => {
            if(!item.available) return;
            if(item.weight > 10 * item.quantity) {
                extraWeightCharge += 0.5 * item.weight;
            }
        })
    }

    return Math.round(extraWeightCharge * 100)/100;
}

module.exports = calculateExtraWeightCharge;