const express = require('express');
const router = express.Router();
const adModel = require('../models/adModel');
const shopModel = require('../models/shopModel');
const reportModel = require('../models/reportModel');
const isLoggedIn = require('../helper/isLoggedIn');
const validator = require('../helper/validationHelper');

router.post('/ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            comment: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID)) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        let reportItem = {};
        if(!req.body.subject) {
            resData.errorMessage.subject = "Subject is required";
            return res.json(resData);
        }
        else if(req.body.subject === 'Other') {
            if(!req.body.otherSubject) {
                resData.errorMessage.otherSubject = "Other subject is required";
                return res.json(resData);
            }
            else {
                reportItem.subject = req.body.otherSubject.substring(0,200);
            }
        }
        else {
            reportItem.subject = req.body.subject.substring(0,200);
        }

        reportItem.comment = req.body.comment.substring(0,2000);

        adModel.findById(req.body.adID,(err,ad) => {
            if(err || !ad || ad.isDeleted) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            reportModel.findOne({itemID: req.body.adID, type: 'Ad'},(err,report) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!report) {
                    report = new reportModel({
                        type: 'Ad',
                        itemID: req.body.adID,
                        reports: [{
                            userID: user.id,
                            reports: [reportItem]
                        }]
                    })
                }
                else {
                    let reportByUser = report.reports.find(r => r.userID.toString() === user.id.toString());
                    if(reportByUser) {
                        reportByUser.reports.push(reportItem);
                    }
                    else {
                        report.reports.push({
                            userID: user.id,
                            reports: [reportItem]
                        });
                    }
                }

                report
                .save()
                .then(report => {
                    resData.status = 'success';
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
});

router.post('/shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            comment: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {

        let reportItem = {};
        if(!req.body.subject) {
            resData.errorMessage.subject = "Subject is required";
            return res.json(resData);
        }
        else if(req.body.subject === 'Other') {
            if(!req.body.otherSubject) {
                resData.errorMessage.otherSubject = "Other subject is required";
                return res.json(resData);
            }
            else {
                reportItem.subject = req.body.otherSubject.substring(0,200);
            }
        }
        else {
            reportItem.subject = req.body.subject.substring(0,200);
        }

        reportItem.comment = req.body.comment.substring(0,2000);

        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err || !shop || shop.isDeleted) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            reportModel.findOne({itemID: shop.id, type: 'Shop'},(err,report) => {
                if(err) {
                    resData.errorMessage.fatalError = "Something went wrong!!";
                    return res.json(resData);
                }

                if(!report) {
                    report = new reportModel({
                        type: 'Shop',
                        itemID: shop.id,
                        reports: [{
                            userID: user.id,
                            reports: [reportItem]
                        }]
                    })
                }
                else {
                    let reportByUser = report.reports.find(r => r.userID.toString() === user.id.toString());
                    if(reportByUser) {
                        reportByUser.reports.push(reportItem);
                    }
                    else {
                        report.reports.push({
                            userID: user.id,
                            reports: [reportItem]
                        });
                    }
                }

                report
                .save()
                .then(report => {
                    resData.status = 'success';
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
});

module.exports = router;