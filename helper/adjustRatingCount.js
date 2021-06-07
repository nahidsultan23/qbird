
const adjustRatingCount = (item,newRating,previousRating) => {
    let keys = ['one','two','three','four','five'];
    if(!item.ratingCount) {
        item.ratingCount = { one: 0, two: 0, three: 0, four: 0, five: 0 };
        item.ratings.forEach(element => {
            item.ratingCount[keys[element.rating-1]] += 1;
        });
    }
    else if(newRating) {
        item.ratingCount[keys[newRating-1]] += 1;
        if(previousRating)
            item.ratingCount[keys[previousRating-1]] -= 1;
    }
}

module.exports = adjustRatingCount;




