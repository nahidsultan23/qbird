const express = require('express');
const router = express.Router();
const validator = require('../helper/validationHelper');

router.post('/contact-us',(req,res) => {
    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: ""
        }
    }

    let error = false;
    if(!req.body.userName) {
        error = true;
        resData.errorMessage.userName = 'Name is required';
    }
    else if(req.body.userName.length < 2) {
        error = true;
        resData.errorMessage.userName = 'Name must be at least 2 characters';
    }

    if(!validator.isValidEmail(req.body.email)) {
        error = true;
        resData.errorMessage.email = 'Enter a valid email';
    }
    
    if(!validator.isValidString(req.body.message,5)) {
        error = true;
        resData.errorMessage.message = 'Message must be at least 5 characters';
    }

    if(error)
        return res.json(resData);


    const contactUsModel = require('../models/contactUsModel');

    new contactUsModel({
        email: req.body.email,
        userName: req.body.userName.substring(0,200),
        message: req.body.message.substring(0,5000)
    })
    .save()
    .then(contactData => {
        resData.status = "success";
        res.json(resData);
    })
    .catch(err => {
        console.log("ERROR: "+err);
        resData.errorMessage.fatalError = "Something went wrong!!";
        return res.json(resData);
    });
});

module.exports = router;