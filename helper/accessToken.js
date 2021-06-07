const jwt = require('jsonwebtoken');
const keyString = "eyJvYmplY3QiOnsidXNlcklEIjoiaSBhbSBnb29kIiwic2Vzc2lvbklEIjoib2sgZmluZSJ9LCJpYXQiOjE1Nzc4OTY0MzEsImV4cCI6MTU3Nzk4MjgzMX0";
// Access token creation
const generateAccessToken = (object) => {
    return jwt.sign({object}, keyString, {expiresIn: '1y', algorithm: 'HS256'});
}

// Access token verification
const verifyAccessToken = (accessToken) => {
    let decoded = undefined;
    
    if(!accessToken)
        return decoded;

    try {
        decoded = jwt.verify(accessToken, keyString).object;
    } catch(err) {
        console.log(err);
    }
    return decoded;
}

module.exports = {
       generateAccessToken: generateAccessToken,
       verifyAccessToken: verifyAccessToken
};