const isSameCartOptions = (Options1,Options2) => {
    if(Options1.length !== Options2.length)
        return false;
    
    for(var i = 0; i < Options1.length; i++) {
        if(Options1[i].optionName !== Options2[i].optionName || Options1[i].option !== Options2[i].option)
            return false;
    }

    return true;
}

module.exports = isSameCartOptions;