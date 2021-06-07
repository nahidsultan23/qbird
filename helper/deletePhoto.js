const aws = require('aws-sdk');
const s3config = require('../config/s3Config');
aws.config.update({
    accessKeyId: s3config.accessKeyId,
    secretAccessKey: s3config.secretAccessKey,
    region: s3config.region
});
const s3 = new aws.S3();

const deletePhoto = url => {
    s3.deleteObject({
        Bucket: s3config.bucket,
        Key: url
    },function (err,data){
        console.log('Photo delete complete');
    })
}

module.exports = deletePhoto;