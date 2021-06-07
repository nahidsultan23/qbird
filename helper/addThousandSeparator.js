
const addThousandSeparator = (value) => {
    value = value.toString();
    value = value.split('.');
    intValue = value[0];
    let length = intValue.length;
    let pivots = [3,2,2];
    let currentPivotIndex = 0;
    let result = "";

    while(length > 0)
    {
        let i=0;
        while(i<pivots[currentPivotIndex] && i<length) {
            result += intValue[length-1-i];
            i++;
        }
        length -= pivots[currentPivotIndex];
        if(length>0)
            result += ',';
        currentPivotIndex = (currentPivotIndex + 1) % 3;
    }
    return result.split('').reverse().join('') + (value[1] ? "." + value[1] : "");
}

module.exports = addThousandSeparator;