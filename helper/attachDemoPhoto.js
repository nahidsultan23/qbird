const aws = require('aws-sdk');
const s3config = require('../config/s3Config');
aws.config.update({
    accessKeyId: s3config.accessKeyId,
    secretAccessKey: s3config.secretAccessKey,
    region: s3config.region
});
const s3 = new aws.S3();

const transferPhoto = (location,index,res,resData,cb) => {
    if(index < 0) {
        cb(res,resData);
    } else {
        let inputPhotoPath = 'photos/demoPhotos/' + location[index].in;
        let outputPhotoPath = 'photos/' + location[index].out;
        s3.getObject({Bucket: s3config.bucket, Key: inputPhotoPath}).promise()
        .then(data => {
            console.log("transfering demo photo...");
            s3.putObject({
                Body: data.Body,
                Bucket: s3config.bucket,
                Key: outputPhotoPath
            })
            .promise()
            .then(() => {
                transferPhoto(location,index-1,res,resData,cb);
            })
            .catch(err => {
                console.log(err);
                transferPhoto(location,index-1,res,resData,cb);
            });
        })
        .catch(err => {
            console.log(err);
            transferPhoto(location,index-1,res,resData,cb);
        });
    }
}

const attachDemoPhoto = (names,res,resData,cb) => {
    const sequenceModel = require('../models/sequenceModel');
    sequenceModel.findOne({},(err,seq) => {
        if(err) {
            console.log(err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        const { v4: uuidv4 } = require('uuid');
        const path = require('path');

        if(seq === null) {
            seq = new sequenceModel({});
        }

        let seqNo = seq.seqNo;

        let location = [];
        for(var i=0; i<names.length; i++) {
            seqNo += 1;
            var imgPath = uuidv4() + '#' + seqNo.toString(16) + path.extname(names[i]);
            location.push({in:'photo-640/' + names[i], out:'photo-640/' + imgPath});
            location.push({in:'photo-320/' + names[i], out:'photo-320/' + imgPath});
            location.push({in:'photo-96/' + names[i], out:'photo-96/' + imgPath});
            names[i] = imgPath;
        }

        seq.seqNo = seqNo;
        seq
        .save()
        .then(s => {
            transferPhoto(location,location.length-1,res,resData,cb);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    });
}

module.exports = attachDemoPhoto;