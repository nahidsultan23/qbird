const prepareRatingOverview = (item) => {
    if(!item.numberOfRatings)
        return item.ratingCount;

    let ratingOverview = {
        one: Math.round(item.ratingCount.one * 100 / item.numberOfRatings),
        two: Math.round(item.ratingCount.two * 100 / item.numberOfRatings),
        three: Math.round(item.ratingCount.three * 100 / item.numberOfRatings),
        four: Math.round(item.ratingCount.four * 100 / item.numberOfRatings),
        five: Math.round(item.ratingCount.five * 100 / item.numberOfRatings)
    }

    let sum = ratingOverview.one + ratingOverview.two + ratingOverview.three + ratingOverview.four + ratingOverview.five;
    let keys = ['one','two','three','four','five'];
    if(sum < 100) {
        let key = 'one';
        for(var i=1; i<5; i++) {
            if(ratingOverview[keys[i]] < ratingOverview[key]) {
                key = keys[i];
            }
        }
        ratingOverview[key] += 1;
    }

    return ratingOverview;
}

module.exports = prepareRatingOverview;