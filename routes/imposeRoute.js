const express = require('express');
const router = express.Router();

router.post('/impose-new-changes',(req,res) => {

    let resData = {
        status: "failure",
        errorMessage: {
            fatalError: "",
            authError: "",
            permissionError: ""
        }
    }

    resData.status = "success";
    return res.json(resData);
});

module.exports = router;