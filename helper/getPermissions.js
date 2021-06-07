const constants = require("./myConstants");

module.exports = (userType) => {
    let permissions = {
        attachDemoAd: false,
        userInfo: false,
        shopAndAdInfo: false,
        verifyAccount: false,
        createDemoAd: false,
        changeAccountNumber: false,
        updateHomepageData: false
    };

    constants.USER_PERMISSIONS[userType].forEach(index => {
        permissions[constants.PERMISSION_TYPES[index]] = true;
    })

    return permissions;    
}