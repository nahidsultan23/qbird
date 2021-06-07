const mongoose = require('mongoose');

const schema = mongoose.Schema;

const contactUsSchema = new schema({
    userName: String,
    email: String,
    message: String
});

module.exports = mongoose.model('contactUs',contactUsSchema,'contactUs');
