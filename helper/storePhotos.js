const compressPhoto = require('./compressPhoto');
const aws = require('aws-sdk');
const sharp = require('sharp');
sharp.cache(false);

const s3config = require('../config/s3Config');

aws.config.update({
  accessKeyId: s3config.accessKeyId,
  secretAccessKey: s3config.secretAccessKey,
  region: s3config.region
});

const s3 = new aws.S3();

const storePhoto = (name,outputBasePath,resolution,cb,ecb) => {
    let photoPath = "photos/temp/" + name;

    s3.getObject({Bucket: s3config.bucket, Key: photoPath}).promise()
    .then(data => {
        console.log("compressing photo...");
        let inputPhoto = data.Body;
        sharp(inputPhoto)
        .metadata()
        .then(info => {
            if(resolution) {
                compressPhoto(inputPhoto, outputBasePath + name, {w:info.width,h:info.height}, resolution,cb,ecb);
            } else {
                compressPhoto(inputPhoto, outputBasePath + 'photo-640/' + name, {w:info.width,h:info.height}, {w:640,h:600},() => {
                    compressPhoto(inputPhoto, outputBasePath + 'photo-320/' + name, {w:info.width,h:info.height}, {w:320,h:300}, () => {
                        compressPhoto(inputPhoto, outputBasePath + 'photo-96/' + name, {w:info.width,h:info.height}, {w:96,h:90},cb,ecb);
                    },ecb);
                },ecb);
            }
        })
    }).catch(err => {
        console.log(err);
        ecb();
    })
}
module.exports = storePhoto;