const getCurrentDateTime = () => {
    const dateTime = new Date();

    const keys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    let dateKey = keys[dateTime.getUTCDay()];
    console.log(dateKey);

    let hour = (dateTime.getUTCHours() + 6) % 24;
    let min = dateTime.getUTCMinutes();
    if(hour < 10)
        hour = "0" + hour;
    if(min < 10)
        min = "0" + min;

    const currentTime = hour+":"+min;
    console.log(currentTime);

    return {
        currentTime: currentTime,
        dayOfWeek: dateKey
    }
}

module.exports = getCurrentDateTime;