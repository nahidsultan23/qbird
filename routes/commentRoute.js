const express = require('express');
const router = express.Router();
const adModel = require('../models/adModel');
const shopModel = require('../models/shopModel');
const adCommentModel = require('../models/adCommentModel');
const shopCommentModel = require('../models/shopCommentModel');
const sendComments = require('../helper/sendComments');
const isLoggedIn = require('../helper/isLoggedIn');
const validator = require('../helper/validationHelper');

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
        if(!req.body.urlName || !req.body.comment) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        shopModel.findOne({urlName: req.body.urlName},(err,shop) => {
            if(err || !shop || shop.isDeleted) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            var shopCommentData = {
                userID: user.id,
                shopID: shop.id,
                comment: req.body.comment.substring(0,2000),
                isOwner: user.id.toString() === shop.userID.toString()
            };

            new shopCommentModel(shopCommentData)
            .save()
            .then(comment => {
                shop.numberOfComments += 1;

                shop
                .save()
                .then(shop => {
                    sendComments(shop.id,"shop",req,res,resData,shop.name,user.id,(req,res,resData) => {
                        resData.status = 'success';
                        res.json(resData);
                    });
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
    });
});

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
        if(!validator.isValidObjectID(req.body.adID) || !req.body.comment) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        adModel.findById(req.body.adID,(err,ad) => {
            if(err || !ad || ad.isDeleted) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            var adCommentData = {
                userID: user.id,
                adID: ad.id,
                comment: req.body.comment.substring(0,2000),
                isOwner: user.id.toString() === ad.userID.toString()
            };

            new adCommentModel(adCommentData)
            .save()
            .then(comment => {
                ad.numberOfComments += 1;

                ad
                .save()
                .then(ad => {
                    sendComments(ad.id,"ad",req,res,resData,ad.name,user.id,(req,res,resData) => {
                        resData.status = 'success';
                        res.json(resData);
                    });
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
    });
});

router.post('/reply/shop',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            reply: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.commentID) || !req.body.reply) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        shopCommentModel.findById(req.body.commentID).populate("shopID",'name userID isDeleted').exec((err,comment) => {
            if(err || !comment || comment.isDeleted || comment.shopID.isDeleted) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            var replyData = {
                userID: user.id,
                reply: req.body.reply.substring(0,500),
                isOwner: user.id.toString() === comment.shopID.userID.toString()
            };

            comment.replies.push(replyData);

            comment
            .save()
            .then(comment => {
                sendComments(comment.shopID._id,"shop",req,res,resData,comment.shopID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/reply/ad',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            reply: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.adID) || !validator.isValidObjectID(req.body.commentID) || !req.body.reply) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }

        adCommentModel.findById(req.body.commentID).populate("adID","name userID isDeleted").exec((err,comment) => {
            if(err || !comment || comment.isDeleted || comment.adID.isDeleted || comment.adID._id.toString() !== req.body.adID) {
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }

            var replyData = {
                userID: user.id,
                reply: req.body.reply.substring(0,500),
                isOwner: user.id.toString() === comment.adID.userID.toString()
            };

            comment.replies.push(replyData);
            comment
            .save()
            .then(comment => {
                sendComments(comment.adID._id,"ad",req,res,resData,comment.adID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/delete-ad-comment',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.commentID)) {
            resData.errorMessage.contentUnavailable = "Comment was not found!!";
            return res.json(resData);
        }

        adCommentModel.findById(req.body.commentID).populate('adID','name isDeleted').exec((err,comment) => {
            if(err || comment.adID.isDeleted) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!comment || comment.isDeleted || comment.adID._id.toString() !== req.body.adID.toString()) {
                resData.errorMessage.contentUnavailable = "Comment was not found!!";
                return res.json(resData);
            }
            if(comment.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            comment.isDeleted = true;

            comment
            .save()
            .then(comment => {
                sendComments(comment.adID,"ad",req,res,resData,comment.adID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/delete-shop-comment',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.commentID)) {
            resData.errorMessage.contentUnavailable = "Comment was not found!!";
            return res.json(resData);
        }

        shopCommentModel.findById(req.body.commentID).populate('shopID','name isDeleted').exec((err,comment) => {
            if(err || comment.shopID.isDeleted) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!comment || comment.isDeleted) {
                resData.errorMessage.contentUnavailable = "Comment was not found!!";
                return res.json(resData);
            }
            if(comment.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            comment.isDeleted = true;

            comment
            .save()
            .then(comment => {
                sendComments(comment.shopID,"shop",req,res,resData,comment.shopID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/delete-ad-reply',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.commentID)) {
            resData.errorMessage.contentUnavailable = "Comment was not found!!";
            return res.json(resData);
        }

        adCommentModel.findById(req.body.commentID).populate('adID','name isDeleted').exec((err,comment) => {
            if(err || comment.adID.isDeleted) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!comment || comment.isDeleted || comment.adID._id.toString() !== req.body.adID.toString()) {
                resData.errorMessage.contentUnavailable = "Comment was not found!!";
                return res.json(resData);
            }
            let reply = comment.replies.find(reply => reply.id.toString() === req.body.replyID.toString());
            if(!reply) {
                resData.errorMessage.contentUnavailable = "Reply was not found!!";
                return res.json(resData);
            }
            if(reply.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            reply.isDeleted = true;

            comment
            .save()
            .then(comment => {
                sendComments(comment.adID,"ad",req,res,resData,comment.adID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

router.post('/delete-shop-reply',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: ""
        }
    }

    isLoggedIn(req,res,resData,(user) => {
        if(!validator.isValidObjectID(req.body.commentID)) {
            resData.errorMessage.contentUnavailable = "Comment was not found!!";
            return res.json(resData);
        }

        shopCommentModel.findById(req.body.commentID).populate('shopID','name').exec((err,comment) => {
            if(err || comment.shopID.isDeleted) {
                console.log(err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            }
            if(!comment || comment.isDeleted) {
                resData.errorMessage.contentUnavailable = "Comment was not found!!";
                return res.json(resData);
            }
            let reply = comment.replies.find(reply => reply.id.toString() === req.body.replyID.toString());
            if(!reply) {
                resData.errorMessage.contentUnavailable = "Reply was not found!!";
                return res.json(resData);
            }
            if(reply.userID.toString() !== user.id.toString()) {
                resData.errorMessage.fatalError = "Access denied";
                return res.json(resData);
            }

            reply.isDeleted = true;

            comment
            .save()
            .then(comment => {
                sendComments(comment.shopID,"shop",req,res,resData,comment.shopID.name,user.id,(req,res,resData) => {
                    resData.status = 'success';
                    res.json(resData);
                });
            })
            .catch(err => {
                console.log("ERROR: "+err);
                resData.errorMessage.fatalError = "Something went wrong!!";
                return res.json(resData);
            });
        });
    });
});

module.exports = router;