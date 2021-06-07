const prepareComments = (req,res,resData,cb,comments,ownerName,userID) => {
    resData.comments = [];
    for(var i = comments.length-1; i >= 0; i--) {
        if(comments[i].isDeleted)
            continue;

        var commentItem = {
            commentID: comments[i].id,
            rating: comments[i].rating,
            comment: comments[i].comment,
            orderID: comments[i].orderID,
            time: comments[i].time,
            replies: []
        }

        if(comments[i].userID) {
            commentItem.userID = comments[i].userID._id;
            commentItem.deletable = commentItem.userID.toString() === userID.toString();
            commentItem.userName = comments[i].isOwner ? ownerName : comments[i].userID.name;
        }

        comments[i].replies.forEach(reply => {
            if(reply.isDeleted)
                return;

            let replyItem = {
                replyID: reply._id,
                reply: reply.reply,
                time: reply.time
            };

            if(reply.userID) {
                replyItem.userID = reply.userID._id;
                replyItem.deletable = replyItem.userID.toString() === userID.toString();
                replyItem.userName = reply.isOwner ? ownerName : reply.userID.name;
            }
            commentItem.replies.push(replyItem);
        });
        resData.comments.push(commentItem);
    }

    cb(req,res,resData);
}

const sendComments = (id,type,req,res,resData,ownerName,userID,cb) => {
    let commentModel = {};
    let query = {};
    if(type === "ad") {
        commentModel = require('../models/adCommentModel');
        query = {adID: id};
    }
    else if(type === "shop") {
        commentModel = require('../models/shopCommentModel');
        query = {shopID: id};
    }
    else {
        resData.errorMessage.fatalError = "Something went wrong!!";
        return res.json(resData);
    }

    commentModel.find(query).populate('userID','name').populate("replies.userID",'name').exec((err,comments) => {
        if(err || comments === null) {
            resData.errorMessage.fatalError = "Something went wrong!!";
            return res.json(resData);
        }
        prepareComments(req,res,resData,cb,comments,ownerName,userID);
    });
}

module.exports = sendComments;