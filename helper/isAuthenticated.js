
const isAuthenticated = (req,res,resData,cb) => {
    const accessTokenManager = require('../helper/accessToken');
    var decoded = accessTokenManager.verifyAccessToken(req.session.accessToken);

    if(!decoded || !decoded.userID || decoded.sessionID !== req.sessionID) {
        resData.errorMessage.authError = 'Authentication failed';
        return cb();
    }

    const userModel = require('../models/userModel');
    userModel.findById(decoded.userID,(err,user) => {
        if(err || !user) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            resData.status = "failure";
            return res.json(resData);
        }
        else if(!user.loggedInInstances) {
            resData.errorMessage.authError = 'Authentication failed';
        }
        cb(user);
    });
}

module.exports = isAuthenticated;