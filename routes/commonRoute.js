const express = require('express');
const router = express.Router();

router.post('/store-in-database',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        }
    } 
    const storedInDatabaseModel = require('../models/storedInDatabaseModel');
    storedInDatabaseModel.findOne({},(err,optionData) => {
        if(err) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        if(optionData === null) {

            new storedInDatabaseModel(req.body)
            .save()
            .then(op => {
                resData.status = "success";
                resData.options = op;
                return res.json(resData);
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        }
        else {
            resData.status = "success";
            res.json(resData);
        }
    });
});

router.post('/',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        }
    } 

    let weekDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    var currentTime = new Date();
    var dayOfweek = weekDays[currentTime.getUTCDay()];
    currentTime = currentTime.toString().replace(/ GMT.*$/,'').replace(/^.* /,'');
    
    console.log(dayOfweek,currentTime);
    const shopModel = require('../models/shopModel');
    shopModel.aggregate().project({
        midBreakApplicable: 1,
        openingHours: 1,
        open: {
            $cond: {
                if: '$midBreakApplicable',
                then: {
                    $cond: {
                        if: '$openingHours.everyday',
                        then: {
                            $cond: {
                                if: '$midBreaks.everyday',
                                then: {
                                    $or: [
                                        {
                                            $and: [
                                                { $lte: ['$openingHours.everyday.from',currentTime] },
                                                { $gte: ['$midBreaks.everyday.from',currentTime] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $lte: ['$midBreaks.everyday.to',currentTime] },
                                                { $gte: ['$openingHours.everyday.to',currentTime] }
                                            ]
                                        }
                                    ]
                                },
                                else: {
                                    $or: [
                                        {
                                            $and: [
                                                { $lte: ['$openingHours.everyday.from',currentTime] },
                                                { $gte: ['$midBreaks.' + dayOfweek + '.from',currentTime] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $lte: ['$midBreaks.' + dayOfweek + '.to',currentTime] },
                                                { $gte: ['$openingHours.everyday.to',currentTime] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        else: {
                            $cond: {
                                if: '$midBreaks.everyday',
                                then: {
                                    $or: [
                                        {
                                            $and: [
                                                { $lte: ['$openingHours.' + dayOfweek + '.from',currentTime] },
                                                { $gte: ['$midBreaks.everyday.from',currentTime] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $lte: ['$midBreaks.everyday.to',currentTime] },
                                                { $gte: ['$openingHours.' + dayOfweek + '.to',currentTime] }
                                            ]
                                        }
                                    ]
                                },
                                else: {
                                    $or: [
                                        {
                                            $and: [
                                                { $lte: ['$openingHours.' + dayOfweek + '.from',currentTime] },
                                                { $gte: ['$midBreaks.' + dayOfweek + '.from',currentTime] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $lte: ['$midBreaks.' + dayOfweek + '.to',currentTime] },
                                                { $gte: ['$openingHours.' + dayOfweek + '.to',currentTime] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                else: {
                    $cond: {
                        if: '$openingHours.everyday',
                        then: {
                            $and: [
                                { $lte: ['$openingHours.everyday.from',currentTime] },
                                { $gte: ['$openingHours.everyday.to',currentTime] }
                            ]
                        },
                        else: {
                            $and: [
                                { $lte: ['$openingHours.' + dayOfweek + '.from',currentTime] },
                                { $gte: ['$openingHours.' + dayOfweek + '.to',currentTime] }
                            ]
                        }
                    }
                }
            }
        }
    }).exec((err,shops) => {
        if(err || shops === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        resData.shops = shops;
        resData.status = 'success';
        res.json(resData);
    });
});


module.exports = router;