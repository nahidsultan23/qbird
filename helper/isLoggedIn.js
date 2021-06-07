
const isLoggedIn = (req,res,resData,cb) => {
    const accessTokenManager = require('../helper/accessToken');
    var decoded = accessTokenManager.verifyAccessToken(req.session.accessToken);

    if(!decoded || !decoded.userID || decoded.sessionID !== req.sessionID) {
        resData.errorMessage.authError = 'Authentication failed';
        return res.json(resData);
    }

    const userModel = require('../models/userModel');
    userModel.findById(decoded.userID,(err,user) => {
        if(err || !user) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        else if(!user.loggedInInstances) {
            resData.errorMessage.authError = 'Authentication failed';
            return res.json(resData);
        }
        else {
            cb(user);
        }
    });
}

module.exports = isLoggedIn;