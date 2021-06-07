const validator = require('../helper/validationHelper');
const deletePhoto = require('../helper/deletePhoto');
const bulkStorePhoto = require('../helper/bulkStorePhoto');
const bulkRemove = require('../helper/bulkRemove');

const prepareTopSliderSection = (sectionData,storedSectionData,tempPhotos,resolution,photosToStore) => {
    var i=0;
    while(i < storedSectionData.length) {
        var item = sectionData.old.find(item => item.itemID === storedSectionData[i].id.toString());
        if(item) {
            if(item.smallLine) {
                storedSectionData[i].smallLine = item.smallLine;
            }
            if(item.biggerLine) {
                storedSectionData[i].biggerLine = item.biggerLine;
            }
            if(item.photo) {
                var tempPhoto = tempPhotos.find(tempPhoto => item.photo === tempPhoto.id.toString());
                deletePhoto('photos/homePhotos/'+ storedSectionData[i].photo);
                storedSectionData[i].photo = tempPhoto.name;
                photosToStore.push({
                    name: tempPhoto.name,
                    resolution: resolution
                });
            }
            i++;
        } else {
            deletePhoto('photos/homePhotos/'+ storedSectionData[i].photo);
            storedSectionData.splice(i,1);
        }
    }
    for(var i=0; i<sectionData.new.length; i++) {
        var tempPhoto = tempPhotos.find(item => sectionData.new[i].photo.toString() === item.id.toString());
        sectionData.new[i].photo = tempPhoto.name;
        storedSectionData.push(sectionData.new[i]);
        photosToStore.push({
            name: tempPhoto.name,
            resolution: resolution
        });
    }
}

const prepareSection = (sectionData,storedSectionData,tempPhotos,resolution,photosToStore) => {
    var i=0;
    while(i < storedSectionData.length) {
        var item = sectionData.old.find(item => item.itemID === storedSectionData[i].id.toString());
        if(item) {
            if(item.photo) {
                var tempPhoto = tempPhotos.find(tempPhoto => item.photo === tempPhoto.id.toString());
                deletePhoto('photos/homePhotos/'+ storedSectionData[i].photo);
                storedSectionData[i].photo = tempPhoto.name;
                photosToStore.push({
                    name: tempPhoto.name,
                    resolution: resolution
                });
            }
            i++;
        } else {
            deletePhoto('photos/homePhotos/'+ storedSectionData[i].photo);
            storedSectionData.splice(i,1);
        }
    }
    for(var i=0; i<sectionData.new.length; i++) {
        var tempPhoto = tempPhotos.find(item => sectionData.new[i].photo.toString() === item.id.toString());
        sectionData.new[i].photo = tempPhoto.name;
        storedSectionData.push(sectionData.new[i]);
        photosToStore.push({
            name: tempPhoto.name,
            resolution: resolution
        });
    }
}

const validateAdIDsAndTempPhotoIDs = (adIDs,tempPhotoIDs,data,errorMessage,section) => {
    for(var i=0; i < data[section].new.length; i++) {
        if(validator.isValidObjectID(data[section].new[i].adID)) {
            if(!adIDs.includes(data[section].new[i].adID))
                adIDs.push(data[section].new[i].adID);
        } else {
            errorMessage[section] = 'Invalid Ad ID';
            return true;
        }

        if(validator.isValidObjectID(data[section].new[i].photo)) {
            tempPhotoIDs.push(data[section].new[i].photo);
        } else {
            errorMessage[section] = 'Invalid Photo ID';
            return true;
        }
    }
    for(var i=0; i < data[section].old.length; i++) {
        if(data[section].old[i].photo) {
            if(validator.isValidObjectID(data[section].old[i].photo)) {
                tempPhotoIDs.push(data[section].old[i].photo);
            } else {
                errorMessage[section] = 'Invalid Photo ID';
                return true;
            }
        }
    }

    return false;
}

const calculateNumOfItemsForCategory = (res,resData,homePageData,index) => {
    if(index < 0) {
        return homePageData
        .save()
        .then(homePageData => {
            resData.status = "success";
            res.json(resData);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    }

    const adModel = require('../models/adModel');
    adModel.count({category: homePageData.secondSlider[index].categoryName}).exec((err,adCount) => {
        if(err) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        homePageData.secondSlider[index].numberOfItems = adCount;
        calculateNumOfItemsForCategory(res,resData,homePageData,index-1);
    });
}

module.exports = function HomePageDataValidateAndUpdate(data,res,resData,homePageData) {
    if(!data.topSlider || !data.secondSlider || !data.latest || !data.special || !data.featured || !data.spanA || !data.spanB || !data.spanC || !data.trending || !data.bestseller
    || !data.topSlider.new || !data.secondSlider.new || !data.latest.new || !data.special.new || !data.featured.new || !data.spanA.new || !data.spanB.new || !data.spanC.new || !data.trending.new || !data.bestseller.new
    || !data.topSlider.old || !data.secondSlider.old || !data.latest.old || !data.special.old || !data.featured.old || !data.spanA.old || !data.spanB.old || !data.spanC.old || !data.trending.old || !data.bestseller.old) {
        resData.errorMessage.fatalError = 'Invalid request';
        return res.json(resData);
    }

    let adIDs = [];
    let shopIDs = [];
    let tempPhotoIDs = [];
    let categoryNames = [];
    console.log(data.topSlider.new);
    for(var i=0; i < data.topSlider.new.length; i++) {
        if(validator.isValidObjectID(data.topSlider.new[i].shopID)) {
            shopIDs.push(data.topSlider.new[i].shopID);
        } else {
            resData.errorMessage.topSlider = 'Invalid Shop ID';
            return res.json(resData);
        }

        if(validator.isValidObjectID(data.topSlider.new[i].photo)) {
            tempPhotoIDs.push(data.topSlider.new[i].photo);
        } else {
            resData.errorMessage.topSlider = 'Invalid Photo ID';
            return res.json(resData);
        }
    }
    for(var i=0; i < data.topSlider.old.length; i++) {
        if(data.topSlider.old[i].photo) {
            if(validator.isValidObjectID(data.topSlider.old[i].photo)) {
                tempPhotoIDs.push(data.topSlider.old[i].photo);
            } else {
                resData.errorMessage.topSlider = 'Invalid Photo ID';
                return res.json(resData);
            }
        }
    }

    for(var i=0; i < data.secondSlider.new.length; i++) {
        categoryNames.push(data.secondSlider.new[i].categoryName);

        if(validator.isValidObjectID(data.secondSlider.new[i].photo)) {
            tempPhotoIDs.push(data.secondSlider.new[i].photo);
        } else {
            resData.errorMessage.secondSlider = 'Invalid Photo ID';
            return res.json(resData);
        }
    }
    for(var i=0; i < data.secondSlider.old.length; i++) {
        if(data.secondSlider.old[i].photo) {
            if(validator.isValidObjectID(data.secondSlider.old[i].photo)) {
                tempPhotoIDs.push(data.secondSlider.old[i].photo);
            } else {
                resData.errorMessage.secondSlider = 'Invalid Photo ID';
                return res.json(resData);
            }
        }
    }

    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'latest'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'special'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'featured'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'spanA'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'spanB'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'spanC'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'trending'))
        return res.json(resData);
    if(validateAdIDsAndTempPhotoIDs(adIDs,tempPhotoIDs,data,resData.errorMessage,'bestseller'))
        return res.json(resData);

    const storedInDatabaseModel = require('../models/storedInDatabaseModel');
    storedInDatabaseModel.findOne({},{categories: 1},(err,storedData) => {
        if(err || storedData === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        for(var i=0; i < categoryNames.length; i++) {
            var item = storedData.categories.find(item => item.categoryName === categoryNames[i]);
            if(!item) {
                resData.errorMessage.secondSlider = 'Invalid Category Name';
                return res.json(resData);
            }
        }

        const shopModel = require('../models/shopModel');
        shopModel.find({ _id: { $in : shopIDs }},(err,shops) => {
            if(err || shops === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(shops.length !== shopIDs.length) {
                resData.errorMessage.topSlider = 'Invalid Shop ID';
                return res.json(resData);
            }

            const adModel = require('../models/adModel');
            adModel.count({ _id: { $in : adIDs }}).exec((err,adCount) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(adCount !== adIDs.length) {
                    resData.errorMessage.latest
                    = resData.errorMessage.special
                    = resData.errorMessage.featured
                    = resData.errorMessage.spanA
                    = resData.errorMessage.spanB
                    = resData.errorMessage.spanC
                    = resData.errorMessage.trending
                    = resData.errorMessage.bestseller
                    = 'Invalid adID';
                    return res.json(resData);
                }

                const tempPhotoModel = require('../models/tempPhotoModel');
                tempPhotoModel.find({ _id: { $in : tempPhotoIDs }},(err,tempPhotos) => {
                    if(err || tempPhotos === null) {
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    }

                    if(tempPhotos.length !== tempPhotoIDs.length) {
                        resData.errorMessage.topSlider
                        = resData.errorMessage.secondSlider
                        = resData.errorMessage.latest
                        = resData.errorMessage.special
                        = resData.errorMessage.featured
                        = resData.errorMessage.spanA
                        = resData.errorMessage.spanB
                        = resData.errorMessage.spanC
                        = resData.errorMessage.trending
                        = resData.errorMessage.bestseller
                        = 'Invalid Photo ID';
                        return res.json(resData);
                    }
                    //start data input
                    let photosToStore = [];
                    prepareTopSliderSection(data.topSlider,homePageData.topSlider,tempPhotos,{w:1920,h:600},photosToStore);
                    prepareSection(data.secondSlider,homePageData.secondSlider,tempPhotos,{w:262,h:262},photosToStore);
                    prepareSection(data.latest,homePageData.latest,tempPhotos,{w:262,h:320},photosToStore);
                    prepareSection(data.special,homePageData.special,tempPhotos,{w:262,h:320},photosToStore);
                    prepareSection(data.featured,homePageData.featured,tempPhotos,{w:262,h:320},photosToStore);
                    prepareSection(data.spanA,homePageData.spanA,tempPhotos,{w:359,h:430},photosToStore);
                    prepareSection(data.spanB,homePageData.spanB,tempPhotos,{w:359,h:220},photosToStore);
                    prepareSection(data.spanC,homePageData.spanC,tempPhotos,{w:750,h:180},photosToStore);
                    prepareSection(data.trending,homePageData.trending,tempPhotos,{w:262,h:320},photosToStore);
                    prepareSection(data.bestseller,homePageData.bestseller,tempPhotos,{w:262,h:320},photosToStore);

                    bulkStorePhoto(photosToStore,'photos/homePhotos/',
                        () => {
                            tempPhotos.forEach(photo => deletePhoto("photos/temp/" + photo.name));
                            bulkRemove(tempPhotos,() => {
                                calculateNumOfItemsForCategory(res,resData,homePageData,homePageData.secondSlider.length-1);
                            });
                        },
                        () => {
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        }
                    );
                });
            });
        });
    });
}