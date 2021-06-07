const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const deletePhoto = require('../helper/deletePhoto');
const saltRounds = 15;

router.post('/details',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        categories: [],
        name: "",
        phoneNumber: "",
        email: "",
        createdOn: "",
        cartItemNumber: "",
        photo: ""
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const storedInDatabaseModel = require('../models/storedInDatabaseModel');
        storedInDatabaseModel.findOne({},(err,optionData) => {
            if(err || optionData === null) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            resData.categories = optionData.categories;
            resData.name = user.name;
            resData.phoneNumber = user.countryCode + user.phoneNumber;
            resData.email = user.email;
            resData.createdOn = user.createdOn;
            resData.cartItemNumber = user.cartItemNumber;

            if(user.photo) {
                resData.photo = user.photo;
            }

            resData.status = "success"
            return res.json(resData);
        });
    });
});

router.post('/details-for-app',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        },
        name: "",
        phoneNumber: "",
        email: "",
        createdOn: "",
        photo: ""
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        resData.name = user.name;
        resData.phoneNumber = user.phoneNumber;
        resData.email = user.email;
        resData.isDeliveryPerson = user.deliveryPersonInfo ? true : false;

        if(user.photo) {
            resData.photo = user.photo;
        }

        resData.status = "success"
        return res.json(resData);
    });
});

router.post('/update-photo',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const validator = require('../helper/validationHelper');
        if(!validator.isValidObjectID(req.body.photo)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        const tempPhotoModel = require('../models/tempPhotoModel');
        tempPhotoModel.findById(req.body.photo,(err,photo) => {
            if(err || photo === null || photo.userID.toString() !== user.id.toString() || photo.type !== "profile") {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            const storePhoto = require('../helper/storePhotos');
            storePhoto(photo.name,"photos/",null,
                () => {
                    user.photo = photo.name;
                    user
                    .save()
                    .then(user => {
                        deletePhoto("photos/temp/" + photo.name);
                        photo.remove();
                        resData.photo = user.photo;
                        resData.status = "success"
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                },
                () => {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
            );
        });
    });
});

router.post('/update-details',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            name: "",
            email: ""
        }
    }

    const validator = require('../helper/validationHelper');
    let error = false;
    if(!req.body.name) {
        error = true;
        resData.errorMessage.name = 'Name is required';
    }
    else if(req.body.name.length < 2) {
        error = true;
        resData.errorMessage.name = 'Name must be at least 2 characters';
    }
    else if(req.body.name.length > 200) {
        error = true;
        resData.errorMessage.name = 'Name must be within 2 to 200 characters';
    }

    if(req.body.email && !validator.isValidEmail(req.body.email)) {
        error = true;
        resData.errorMessage.email = 'Enter a valid email';
    }
    if(error)
        return res.json(resData);

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        user.name = req.body.name;
        user.email = req.body.email;

        user
        .save()
        .then(user => {
            resData.status = "success"
            res.json(resData);
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    });
});

router.post('/change-password',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            password: "",
            newPassword: "",
            reEnterNewPassword: ""
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        const encryption = require('../helper/Encryption');
        if(!encryption.verifySignature(req.body.password, req.body.passwordSign)) {
            resData.errorMessage.password = 'Wrong password!! Try again';
        }
        else {
            req.body.password = encryption.decrypt(req.body.password);
        }

        bcrypt.compare(req.body.password,user.password).then(function(result) {
            if(result) {
                if(!encryption.verifySignature(req.body.newPassword, req.body.newPasswordSign)) {
                    resData.errorMessage.newPassword = 'Enter a valid password';
                }

                if(!encryption.verifySignature(req.body.reEnterNewPassword, req.body.reEnterNewPasswordSign)) {
                    resData.errorMessage.reEnterNewPassword = 'Passwords must match';
                }

                if(resData.errorMessage.password || resData.errorMessage.reEnterNewPassword) {
                    return res.json(resData);
                }
                else {
                    req.body.newPassword = encryption.decrypt(req.body.newPassword);
                    req.body.reEnterNewPassword = encryption.decrypt(req.body.reEnterNewPassword);
                }

                const validator = require('../helper/validationHelper');
                let msg = validator.isValidPassword(req.body.newPassword);
                if(msg !== "true") {
                    resData.errorMessage.newPassword = msg;
                    return res.json(resData);
                }

                if(!req.body.reEnterNewPassword || (req.body.reEnterNewPassword.length > 200) || (req.body.newPassword !== req.body.reEnterNewPassword)) {
                    resData.errorMessage.reEnterNewPassword = 'Passwords must match';
                    return res.json(resData);
                }

                bcrypt.hash(req.body.newPassword,saltRounds).then(function(hashedPassword) {

                    user.password = hashedPassword;
                    user
                    .save()
                    .then(user => {
                        resData.status = 'success';
                        return res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            }
            else {
                resData.errorMessage.password = "Wrong password!! Try again";
                res.json(resData);
            }
        })
        .catch(err => {
            console.log("ERROR: "+err);
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        });
    });
});

module.exports = router;