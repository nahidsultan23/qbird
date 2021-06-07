
module.exports = (item,adOptions) => {
    let error = false;
    item.optionPrice = 0;
    item.optionWeight = 0;
    for(var i = 0; i < item.options.length; i++) {
        var a = adOptions.find((adOption) => adOption.optionName === item.options[i].optionName);

        if(a) {
            var b = a.options.find((adOption) => adOption.option === item.options[i].option);
            if(b) {
                item.options[i].extraPrice = b.extraPrice;
                item.options[i].extraPriceUnit = b.extraPriceUnit;
                item.options[i].extraWeight = b.extraWeight;
                item.options[i].extraWeightUnit = b.extraWeightUnit;

                item.optionPrice += b.extraPrice;
                item.optionWeight += b.extraWeightInKg;
                item.options[i].available = true;
            }
            else {
                item.options[i].available = false;
                error = true;
            }
        }
        else {
            item.options[i].available = false;
            error = true;
        }
    }

    return error;
}

