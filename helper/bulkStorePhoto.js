const storePhoto = require('./storePhotos');

const bulkStorePhoto = (photosToStore,index,outputBasePath,cb,ecb) => {
    if(index < 0) {
        return cb();
    }

    storePhoto(photosToStore[index].name,outputBasePath,photosToStore[index].resolution,
        () => {
            bulkStorePhoto(photosToStore,index-1,outputBasePath,cb,ecb);
        },
        ecb
    );
}

module.exports = (photosToStore,outputBasePath,cb,ecb) => {
    bulkStorePhoto(photosToStore,photosToStore.length-1,outputBasePath,cb,ecb);
};