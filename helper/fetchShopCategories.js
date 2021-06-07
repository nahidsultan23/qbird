const shopModel = require('../models/shopModel');

const fetchShopCategories = (res,resData,query,cb) => {
    resData.shopCategories = [];
    shopModel.find(query,{category:1,subcategory:1},(err,shops) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        shops.forEach(item => {
            var index = resData.shopCategories.findIndex(element => element.categoryName === item.category);
            if(index != -1) {
                if(item.subcategory && !resData.shopCategories[index].subcategories.includes(item.subcategory)) {
                    resData.shopCategories[index].subcategories.push(item.subcategory);
                }
            } else {
                resData.shopCategories.push({
                    categoryName: item.category,
                    subcategories: item.subcategory ? [item.subcategory] : []
                })
            }
        })

        resData.shopCategories.sort((a,b) => a.categoryName > b.categoryName);
        resData.shopCategories.forEach(c => c.subcategories.sort());

        cb();
    });
}

module.exports = fetchShopCategories;