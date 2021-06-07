const validator = require('../helper/validationHelper');
const mongoose = require('mongoose');
const bulkRemove = require('../helper/bulkRemove');
const bultStorePhoto = require('../helper/bulkStorePhoto');
const deletePhoto = require('../helper/deletePhoto');

const validatePhotoList = (req,res,resData,type,cb) => {
    let photoList = req.body.photos;
    if(!photoList)
        return cb(req,res,resData);

    for(var i=0; i<photoList.length; i++) {
        if(!validator.isValidObjectID(photoList[i])) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else {
            photoList[i] = mongoose.Types.ObjectId(photoList[i]);
        }
    }

    const tempPhotoModel = require('../models/tempPhotoModel');
    tempPhotoModel.find({"$and":[{userID: req.body.userID},{ _id: { $in : photoList }},{type: type}]},(err,photos) => {
        if(err || photos === null || photoList.length !== photos.length) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        let outputBasePath = "photos/";
        if(type === "demo-ad")
            outputBasePath = "photos/demoPhotos/";

        bultStorePhoto(photos,outputBasePath,
            () => {
                for(var i=0;i<photos.length;i++) {
                    photoList[i] = photos[i].name;
                    deletePhoto("photos/temp/" + photoList[i])
                }
                bulkRemove(photos,() => {
                    cb(req,res,resData);
                });
            },
            () => {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
        );
    });
}

module.exports = validatePhotoList;