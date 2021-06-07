module.exports = (options1,options2) => {
    if(options1.length !== options2.length)
        return false;
    for(var i=0; i<options1.length; i++) {
        let option1 = options1[i];
        let option2 = options2.find(o => o.optionName === option1.optionName && o.optionType === option1.optionType)
        if(!option2 || option1.options.length !== option2.options.length)
            return false;
        for(var j=0; j<option1.options.length; j++) {
            let index = option2.options.findIndex(o => o.option === option1.options[j].option && o.extraPrice == option1.options[j].extraPrice && o.extraPriceUnit === option1.options[j].extraPriceUnit && o.extraWeight == option1.options[j].extraWeight && o.extraWeightUnit === option1.options[j].extraWeightUnit);
            if(index === -1)
                return false;
        }
    }

    return true;
}