const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ReplySchema = new schema({
    userID: {
        type: schema.Types.ObjectId,
        ref: 'users'
    },
    isOwner: Boolean,
    reply: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = ReplySchema;