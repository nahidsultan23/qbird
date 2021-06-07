const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 15;
const userModel = require('../models/userModel');
const userTempModel = require('../models/userTempModel');
const sendOtp = require('../helper/sendOtp');
const isAuthenticated = require('../helper/isAuthenticated');
const accessTokenManager = require('../helper/accessToken');
const recoverPasswordModel = require('../models/recoverPasswordModel');
const checkIntervalAndSendOtp = require('../helper/checkIntervalAndSendOtp');

router.post('/register',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            countryCode: "",
            phoneNumber: "",
            password: "",
            reEnterPassword: "",
            name: ""
        }
    }
    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }
        const validateTempRegisterInput = require('../validation/UserTempRegisterValidation');

        var isValid = validateTempRegisterInput(req.body,resData.errorMessage);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(user !== null) {
                resData.errorMessage.phoneNumber = "This phone number is attached to an existing account";
                return res.json(resData);
            }

            userTempModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,userTemp) => {
                if(err) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(userTemp !== null) {
                    checkIntervalAndSendOtp(res,resData,userTemp,() => {
                        bcrypt.hash(req.body.password,saltRounds).then(function(hashedPassword) {
                            userTemp.password = hashedPassword;
                            userTemp.name = req.body.name;
                            userTemp.tempSessionID = req.session.id;
                            userTemp.client = req.body.client;

                            userTemp
                            .save()
                            .then(userT => {
                                req.session.tempAccessToken = accessTokenManager.generateAccessToken({tempUserID: userT.id,tempSessionID: userT.tempSessionID});
                                resData.status = "success";
                                return res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        });
                    })
                }
                else {
                    let otp =  Math.floor(100000 + Math.random() * 900000);
                    sendOtp(res,resData,otp,req.body.phoneNumber,() => {
                        bcrypt.hash(req.body.password,saltRounds).then(function(hashedPassword) {
                            new userTempModel({
                                countryCodeFull: req.body.countryCode,
                                countryCode: countryCode,
                                phoneNumber: req.body.phoneNumber,
                                password: hashedPassword,
                                client: req.body.client,
                                name: req.body.name,
                                otp: otp,
                                tempSessionID: req.session.id
                            })
                            .save()
                            .then(userT => {
                                req.session.tempAccessToken = accessTokenManager.generateAccessToken({tempUserID: userT.id,tempSessionID: userT.tempSessionID});
                                resData.status = "success";
                                res.json(resData);
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
                    });
                }
            });
        });
    });
});

router.post('/register/otp',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            otp: ""
        }
    };

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }
        const validateRegisterInput = require('../validation/UserRegisterValidation');

        var isValid = validateRegisterInput(req.body,resData.errorMessage,req.session.tempAccessToken);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(user !== null) {
                resData.errorMessage.fatalError = "Invalid request";
                return res.json(resData);
            }

            userTempModel.findById(req.body.tempUserID,(err,userTemp) => {
                if(err || userTemp === null || userTemp.countryCode !== countryCode || userTemp.phoneNumber !== req.body.phoneNumber || userTemp.tempSessionID !== req.body.tempSessionID) {          
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(userTemp.otpTrials >= 5) {
                    resData.errorMessage.fatalError = "You have entered wrong verification code too many times. Please wait for 10 minutes and try again by clicking on 'Resend verification code' button below";
                    return res.json(resData);
                }

                if(userTemp.otp !== req.body.otp) {
                    userTemp.otpTrials += 1;
                    userTemp.save();
                    resData.errorMessage.otp = "Verification code did not match";
                    return res.json(resData);
                }

                const newUser = new userModel({
                    countryCodeFull: req.body.countryCode,
                    countryCode: countryCode,
                    phoneNumber: req.body.phoneNumber,
                    password: userTemp.password,
                    name: userTemp.name,
                    loggedInInstances: 1
                });

                let accessToken = accessTokenManager.generateAccessToken({userID: newUser.id, sessionID: req.sessionID});
                if(userTemp.client === 'mobile-delivery-app') {
                    newUser.deliveryPersonInfo = {};

                    const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
                    new activeDeliveryPersonModel({deliveryPersonID: newUser.id})
                    .save()
                    .then(adp => {
                        newUser.activeDeliveryPersonID = adp.id;

                        newUser
                        .save()
                        .then(user => {
                            userTemp.remove();
                            const encryption = require('../helper/Encryption');
                            req.session.accessToken = accessToken;
                            resData.name = user.name;
                            resData.phoneNumber = user.countryCode + user.phoneNumber;
                            resData.cartItemNumber = user.cartItemNumber;
                            resData.email = user.email;
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
                    newUser
                    .save()
                    .then(user => {
                        userTemp.remove();
                        const encryption = require('../helper/Encryption');
                        req.session.accessToken = accessToken;
                        resData.name = user.name;
                        resData.phoneNumber = user.countryCode + user.phoneNumber;
                        resData.cartItemNumber = user.cartItemNumber;
                        resData.email = user.email;
                        resData.status = 'success';
                        return res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                }
            });
        });
    });
});

router.post('/register/otp-send-again',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: ""
        }
    }

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }
        const validateRegisterOTPSendAgainInput = require('../validation/UserRegisterValidation');

        var isValid = validateRegisterOTPSendAgainInput(req.body,resData.errorMessage,req.session.tempAccessToken);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(user !== null) {
                resData.errorMessage.fatalError = "Invalid request";
                return res.json(resData);
            }

            userTempModel.findById(req.body.tempUserID,(err,userTemp) => {
                if(err || userTemp === null || userTemp.countryCode !== countryCode || userTemp.phoneNumber !== req.body.phoneNumber || userTemp.tempSessionID !== req.body.tempSessionID) {          
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                checkIntervalAndSendOtp(res,resData,userTemp,() => {
                    userTemp
                    .save()
                    .then(userTemp => {
                        resData.status = "success";
                        res.json(resData);
                    })
                    .catch(err => {
                        console.log("ERROR: "+err);
                        resData.errorMessage.fatalError = "Something went wrong!!";
                        return res.json(resData);
                    });
                })
            });
        });
    });
});

router.post('/log-in',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            countryCode: "",
            phoneNumber: "",
            password: ""
        },
        name: "",
        phoneNumber: "",
        cartItemNumber: "",
        email: "",
        isDeliveryPerson: false
    };

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }

        const validateLoginInput = require('../validation/LoginDataValidation');
        
        var isValid = validateLoginInput(req.body,resData.errorMessage);
        if(!isValid) {
            return res.json(resData);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );
        
        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},{'name': 1,'email':1,'cartItemNumber':1,'password': 1,'deliveryPersonID': 1,'countryCode':1,'phoneNumber':1,'deliveryPersonInfo':1,'loggedInInstances':1},(err,user) => {
            if(err) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            else if(user) {
                const validator = require('../helper/validationHelper');
                var msg = validator.isValidPassword(req.body.password);

                if(msg !== "true") {
                    error = true;
                    resData.errorMessage.password = "Wrong password!! Try again";
                    return res.json(resData);
                }

                bcrypt.compare(req.body.password,user.password).then(function(result) {
                    if(result) {
                        let accessToken = accessTokenManager.generateAccessToken({userID: user.id, sessionID: req.sessionID});
                        user.loggedInInstances += 1;
                        if(user.deliveryPersonInfo) {
                            resData.isDeliveryPerson = true;
                            const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
                            activeDeliveryPersonModel.findOne({deliveryPersonID: user.id},(err,activeDeliveryPerson) => {
                                if(err) {
                                    console.log("ERROR: "+err);
                                    resData.errorMessage.fatalError = "Something went wrong!!";
                                    return res.json(resData);
                                }
                                else if(activeDeliveryPerson != null) {
                                    activeDeliveryPerson.numberOfRequestsToday = user.deliveryPersonInfo.dailyRecord.numberOfRequest;
                                    activeDeliveryPerson.allowRequest = user.deliveryPersonInfo.accountStatus.status === "Approved";
                                }
                                else {
                                    activeDeliveryPerson = new activeDeliveryPersonModel({
                                        deliveryPersonID: user.id,
                                        numberOfRequestsToday: user.deliveryPersonInfo.dailyRecord.numberOfRequest,
                                        allowRequest: user.deliveryPersonInfo.accountStatus.status === "Approved"
                                    });
                                    if(user.deliveryMedium === "Motorcycle")
                                        activeDeliveryPerson.deliveryMedium = "Motorcycle";
                                }
                                user.activeDeliveryPersonID = activeDeliveryPerson.id;

                                activeDeliveryPerson
                                .save()
                                .then(adp => {
                                    user
                                    .save()
                                    .then(user => {
                                        const encryption = require('../helper/Encryption');
                                        req.session.accessToken = accessToken;
                                        resData.name = user.name;
                                        resData.phoneNumber = user.countryCode + user.phoneNumber;
                                        resData.cartItemNumber = user.cartItemNumber;
                                        resData.email = user.email;
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
                            });
                        } else {
                            user
                            .save()
                            .then(user => {
                                const encryption = require('../helper/Encryption');
                                req.session.accessToken = accessToken;
                                resData.name = user.name;
                                resData.phoneNumber = user.countryCode + user.phoneNumber;
                                resData.cartItemNumber = user.cartItemNumber;
                                resData.email = user.email;
                                resData.status = 'success';
                                return res.json(resData);
                            })
                            .catch(err => {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            });
                        }
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
            }
            else {
                console.log(user);
                resData.errorMessage.phoneNumber = "No user exists with this phone number";
                res.json(resData);
            }
        });
    });
});

router.post('/log-out',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    const isLoggedIn = require('../helper/isLoggedIn');
    isLoggedIn(req,res,resData,(user) => {
        user.loggedInInstances -= 1;
        req.session.destroy();
        if(!user.loggedInInstances && user.deliveryPersonInfo) {
            const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
            activeDeliveryPersonModel.findByIdAndRemove(user.activeDeliveryPersonID,(err) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                user.activeDeliveryPersonID = undefined;
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
            });
        } else {
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
        }
    });
});

router.post('/recover-password',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            countryCode: "",
            phoneNumber: ""
        }
    }

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }

        const validateRecoverPasswordInput = require('../validation/RecoverPasswordDataValidation');

        var isValid = validateRecoverPasswordInput(req.body,resData.errorMessage);
        if(!isValid) {
            return res.json(resData);
        }

        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        userModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,user) => {
            if(err) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            if(user === null) {
                console.log('Error: ' + err);
                resData.errorMessage.phoneNumber = 'No user exists with this phone number';
                return res.json(resData);
            }

            recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber},(err,recoverPasswordData) => {
                if(err) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }
                if(recoverPasswordData !== null) {
                    checkIntervalAndSendOtp(res,resData,recoverPasswordData,() => {
                        recoverPasswordData.tempSessionID = req.session.id;

                        recoverPasswordData
                        .save()
                        .then(recoverPasswordData => {
                            req.session.tempAccessToken = accessTokenManager.generateAccessToken({userID: recoverPasswordData.userID,tempSessionID: recoverPasswordData.tempSessionID});
                            resData.status = "success";
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    });
                }
                else {
                    let otp =  Math.floor(100000 + Math.random() * 900000);
                    sendOtp(res,resData,otp,req.body.phoneNumber,() => {
                        new recoverPasswordModel({
                            countryCode: countryCode,
                            phoneNumber: req.body.phoneNumber,
                            userID: user.id,
                            tempSessionID: req.session.id,
                            otp: otp
                        })
                        .save()
                        .then(recoverPasswordData => {
                            req.session.tempAccessToken = accessTokenManager.generateAccessToken({userID: recoverPasswordData.userID,tempSessionID: recoverPasswordData.tempSessionID});
                            resData.status = "success";
                            res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    });
                }
            });
        });
    });
});

router.post('/recover-password/otp',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            otp: ""
        }
    };

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }

        const validateRecoverPasswordInput = require('../validation/RecoverPasswordDataOtpValidation');

        var isValid = validateRecoverPasswordInput(req.body,resData.errorMessage,req.session.tempAccessToken);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber,userID: req.body.userID,tempSessionID: req.body.tempSessionID},(err,recoverPasswordData) => {
            if(err || recoverPasswordData === null) {          
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Invalid request!";
                return res.json(resData);
            }

            if(recoverPasswordData.otpTrials >= 5) {
                resData.errorMessage.fatalError = "You have entered wrong verification code too many times. Please wait for 10 minutes and try again by clicking on 'Resend verification code' button below";
                return res.json(resData);
            }

            if(recoverPasswordData.otp !== req.body.otp) {
                recoverPasswordData.otpTrials += 1;
                recoverPasswordData.save();
                resData.errorMessage.otp = "Verification code did not match";

                return res.json(resData);
            }
            //send response
            recoverPasswordData.otpVerified = true;
            recoverPasswordData
            .save()
            .then(rpd => {
                resData.status = "success";
                res.json(resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/recover-password/otp-send-again',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
        }
    }

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }

        const validateRecoverPasswordInput = require('../validation/RecoverPasswordDataOtpValidation');

        var isValid = validateRecoverPasswordInput(req.body,resData.errorMessage,req.session.tempAccessToken);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber,userID: req.body.userID,tempSessionID: req.body.tempSessionID},(err,recoverPasswordData) => {
            if(err || recoverPasswordData === null) {          
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Invalid request!";
                return res.json(resData);
            }

            checkIntervalAndSendOtp(res,resData,recoverPasswordData,() => {
                recoverPasswordData
                .save()
                .then(recoverPasswordData => {
                    resData.status = "success";
                    res.json(resData);
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            })
        });
    });
});

router.post('/recover-password/change-password',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            alreadyLoggedIn: "",
            newPassword: "",
            reEnterNewPassword: ""
        },
        isDeliveryPerson: false
    }

    isAuthenticated(req,res,resData,(user) => {
        if(!resData.errorMessage.authError) {
            resData.errorMessage.alreadyLoggedIn = "You are already logged in";
            return res.json(resData);
        }
        else {
            resData.errorMessage.authError = undefined;
        }

        const validateRecoverPasswordInput = require('../validation/RecoverPasswordChangePasswordDataValidation');

        var isValid = validateRecoverPasswordInput(req.body,resData.errorMessage,req.session.tempAccessToken);
        if(!isValid) {
            return res.json(resData);
        }
        var countryCode = req.body.countryCode.substring(
            req.body.countryCode.lastIndexOf("(") + 1,
            req.body.countryCode.lastIndexOf(")")
        );

        recoverPasswordModel.findOne({countryCode: countryCode,phoneNumber: req.body.phoneNumber,userID: req.body.userID,tempSessionID: req.body.tempSessionID, otpVerified: true},(err,recoverPasswordData) => {
            if(err || recoverPasswordData === null) {
                console.log('Error: ' + err);
                resData.errorMessage.fatalError = "Invalid request!";
                return res.json(resData);
            }
            const encryption = require('../helper/Encryption');
            if(!encryption.verifySignature(req.body.newPassword, req.body.newPasswordSign)) {
                resData.errorMessage.password = 'Enter a valid password';
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

            userModel.findById(req.body.userID,(err,user) => {
                if(err || user === null) {
                    console.log('Error: ' + err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                bcrypt.hash(req.body.newPassword,saltRounds).then(function(hashedPassword) {
                    let accessToken = accessTokenManager.generateAccessToken({userID: user.id, sessionID: req.sessionID});
                    user.password = hashedPassword;
                    user.loggedInInstances += 1;
                    if(user.deliveryPersonInfo) {
                        resData.isDeliveryPerson = true;
                        const activeDeliveryPersonModel = require('../models/activeDeliveryPersonModel');
                        activeDeliveryPersonModel.findOne({deliveryPersonID: user.id},(err,activeDeliveryPerson) => {
                            if(err) {
                                console.log("ERROR: "+err);
                                resData.errorMessage.fatalError = "Something went wrong!!";
                                return res.json(resData);
                            }
                            else if(activeDeliveryPerson != null) {
                                activeDeliveryPerson.numberOfRequestsToday = user.deliveryPersonInfo.dailyRecord.numberOfRequest;
                            }
                            else {
                                activeDeliveryPerson = new activeDeliveryPersonModel({deliveryPersonID: user.id,numberOfRequestsToday: user.deliveryPersonInfo.dailyRecord.numberOfRequest});
                                if(user.deliveryMedium === "Motorcycle")
                                    activeDeliveryPerson.deliveryMedium = "Motorcycle";
                                user.activeDeliveryPersonID = activeDeliveryPerson.id;
                            }
                            activeDeliveryPerson
                            .save()
                            .then(adp => {
                                user
                                .save()
                                .then(user => {
                                    recoverPasswordData.remove();
                                    const encryption = require('../helper/Encryption');
                                    req.session.accessToken = accessToken;
                                    resData.name = user.name;
                                    resData.phoneNumber = user.countryCode + user.phoneNumber;
                                    resData.cartItemNumber = user.cartItemNumber;
                                    resData.email = user.email;
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
                        });
                    } else {
                        user
                        .save()
                        .then(user => {
                            recoverPasswordData.remove();
                            const encryption = require('../helper/Encryption');
                            req.session.accessToken = accessToken;
                            resData.name = user.name;
                            resData.phoneNumber = user.countryCode + user.phoneNumber;
                            resData.cartItemNumber = user.cartItemNumber;
                            resData.email = user.email;
                            resData.status = 'success';
                            return res.json(resData);
                        })
                        .catch(err => {
                            console.log("ERROR: "+err);
                            resData.errorMessage.fatalError = "Something went wrong!!";
                            return res.json(resData);
                        });
                    }
                })
                .catch(err => {
                    console.log("ERROR: "+err);
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                });
            });
        });
    });
})

module.exports = router;