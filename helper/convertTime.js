const convertTime = (dateObject,offset) => {
    if(!dateObject)
        return dateObject;
    if(offset !== 0 && !offset)
        offset = 6;
    let timestamp = dateObject.getTime();
    let newTimestamp = timestamp + Number(offset) * 3600 * 1000;
    return new Date(newTimestamp);
}

module.exports = convertTime;