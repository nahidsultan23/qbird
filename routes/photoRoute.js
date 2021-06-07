const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3config = require('../config/s3Config');

aws.config.update({
    accessKeyId: s3config.accessKeyId,
    secretAccessKey: s3config.secretAccessKey,
    region: s3config.region
});

const s3 = new aws.S3();

const storage = multerS3({
    s3: s3,
    bucket: s3config.bucket,
    metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        const { v4: uuidv4 } = require('uuid');
        const path = require('path');
        const sequenceModel = require('../models/sequenceModel');
        sequenceModel.findOne({},(err,seq) => {
            let seqNo = 0;

            if(seq === null) {
                new sequenceModel({}).save();
            }
            else if(!err) {
                seqNo = seq.seqNo + 1;
                seq.seqNo = seqNo;
                seq.save();
            }

            var imgPath = "photos/temp/" + uuidv4() + '#' + seqNo.toString(16) + path.extname(file.originalname);
            cb(null,imgPath);
        });
    }
});
 
const upload = multer({
    storage: storage,
    limits:{fileSize: 50000000},
    fileFilter: (req,file,cb) => {
        const checkImage = require('../helper/checkImage');
        if(checkImage(file)) {
            cb(null,true);
        }
        else {
            cb('Upload a valid image');
        }
    }
}).single('myPhoto');

router.post('/upload-photo',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            clientPhotoID: ""
        },
        tempPhotoID: "",
        clientPhotoID: "",
        photo: ""
    }

    upload(req, res, (err) => {
        if (err || !req.file) {
            console.log('Error: ' + err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const isLoggedIn = require('../helper/isLoggedIn');
        isLoggedIn(req,res,resData,(user) => {
            const tempPhotoModel = require('../models/tempPhotoModel');
            new tempPhotoModel({
                userID: user.id,
                name: req.file.key.replace("photos/temp/", ""),
                type: req.body.type
            }).save()
            .then((tempPhoto) => {
                resData.tempPhotoID = tempPhoto.id;
                resData.clientPhotoID = req.body.clientPhotoID;
                resData.localPhotoUrl= req.body.localPhotoUrl;
                resData.status = "success";
                res.json(resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

module.exports = router;