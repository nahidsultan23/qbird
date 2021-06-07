
const calculateStoppageWaitingCharge = (point,adData,processingCapacity,totalWaitingTime) => {
    let adsExceedTimeLimit = [];
    let alreadyVisited = {};
    let tuples = []

    point.items.forEach(item => {
        if(!item.available) return;

        let key = item.adID.toString();
        if(alreadyVisited[key]) return;

        alreadyVisited[key] = true;
        let ad = adData[key].ad;
        let quantity = adData[key].quantity;
        let waitingTime =  0
        switch(ad.leadTime) {
            case "Less than 10 minutes":
                waitingTime = 0;
                break;
            case "10 minutes to 30 minutes":
                waitingTime = 30;
                break;
            case "30 minutes to 1 hour":
                waitingTime = 60;
                break;
        }

        tuples.push([waitingTime,quantity,key]);
    })
    tuples.sort((a,b) => {
        if(a[0] > b[0])
            return 1
        else
            return -1
    })

    point.stoppageWaitingTime = 0;
    while(tuples.length != 0) {
        if(tuples[tuples.length - 1][1] > 0) {
            tuples[tuples.length - 1][1] -= processingCapacity;
            point.stoppageWaitingTime += tuples[tuples.length - 1][0];
            totalWaitingTime += tuples[tuples.length - 1][0];
            if(totalWaitingTime > 180) {
                adsExceedTimeLimit.push(tuples[tuples.length - 1][2])
            }
        }
        if(tuples[tuples.length - 1][1] <= 0) {
            if(tuples.length > 1)
                tuples[tuples.length - 2][1] += tuples[tuples.length - 1][1]
            tuples.pop()
        }
    }

    point.items.forEach(item => {
        if(!item.checkoutErrorMessage && adsExceedTimeLimit.find(adID => adID === item.adID.toString())) {
            item.checkoutErrorMessage = "Waiting time cannot be more than 180 minutes";
            item.errorCode = 7;
        }
    })

    return totalWaitingTime;
}


module.exports = calculateStoppageWaitingCharge;