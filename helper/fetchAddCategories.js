const adModel = require('../models/adModel');

const fetchAdCategories = (res,resData,query,cb) => {
    resData.categories = [];
    adModel.find(query,{category: 1,subcategory:1},(err,ads) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        ads.forEach(item => {
            var index = resData.categories.findIndex(element => element.categoryName === item.category);
            if(index != -1) {
                if(item.subcategory && !resData.categories[index].subcategories.includes(item.subcategory)) {
                    resData.categories[index].subcategories.push(item.subcategory);
                }
            } else {
                resData.categories.push({
                    categoryName: item.category,
                    subcategories: item.subcategory ? [item.subcategory] : []
                })
            }
        })

        resData.categories.sort((a,b) => a.categoryName > b.categoryName);
        resData.categories.forEach(c => c.subcategories.sort());

        cb();
    });
}

module.exports = fetchAdCategories;