const mongoose = require('mongoose');

const schema = mongoose.Schema;

const tempPhotoSchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const tempPhotoModel = mongoose.model('tempPhoto',tempPhotoSchema,'tempPhoto');

module.exports = tempPhotoModel;