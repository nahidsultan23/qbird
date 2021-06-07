module.exports = (period1,period2) => {
    if(!period1 && !period2)
        return true;
    else if(!period1 && period2)
        return false;
    else if(period1 && !period2)
        return false;

    if(period1["everyday"] && period2["everyday"] && period1["everyday"].from === period2["everyday"].from && period1["everyday"].to === period2["everyday"].to)
        return true;
    let keys = Object.keys(period1);
    if(keys.length !== Object.keys(period2).length)
        return false;
    for(var i=0; i < keys.length; i++) {
        if(!period2[keys[i]] || period1[keys[i]].from !== period2[keys[i]].from || period1[keys[i]].to !== period2[keys[i]].to)
            return false;
    }

    return true;
}