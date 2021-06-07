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

const compressPhoto = (inputPhoto,outputPath,size,targetSize,cb,ecb) => {
    let reSize = {};
  
    if(size.w > targetSize.w && size.h < targetSize.h) {
        reSize.width = targetSize.w;
    }
    else if(size.w < targetSize.w && size.h > targetSize.h) {
        reSize.height = targetSize.h;
    }
    else if(size.w > targetSize.w && size.h > targetSize.h) {
        if((size.h / size.w) * targetSize.w <= targetSize.h) {
            reSize.width = targetSize.w;
        }
        else if((size.w / size.h) * targetSize.h <= targetSize.w) {
            reSize.height = targetSize.h;
        }
        else {
            console.log("Photo does not fit");
            return ecb();
        }
    }
    else {
        console.log("Photo automatically fits without compression");
    }
    
    sharp(inputPhoto)
    .resize(reSize)
    .toBuffer()
    .then((outputBuffer) => {
        sharp({
            create: {
              width: targetSize.w,
              height: targetSize.h,
              channels: 3,
              background: { r: 250, g: 250, b: 250 }
            }
        })
        .jpeg({quality: 80})
        .composite([{ input: outputBuffer}])
        .toBuffer()
        .then(buffer => {
            s3.putObject({
                Body: buffer,
                Bucket: s3config.bucket,
                Key: outputPath
            }).promise()
            .then(() => {
                cb();
            })
            .catch(err => {
                console.log("Can not resize");
                console.log(err);
                ecb();
            });
        })
        .catch(err => {
            console.log("Can not resize");
            console.log(err);
            ecb();
        });
    })
    .catch(err => {
        console.log("Can not resize");
        console.log(err);
        ecb();
    });
}

module.exports = compressPhoto;