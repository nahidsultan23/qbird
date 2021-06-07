const checkImage = (file) => {
    const imageExtension = /.*(jpg|jpeg|png)/i; 
    if(imageExtension.test(file.originalname) && imageExtension.test(file.mimetype))
        return true;

    return false;
}

module.exports = checkImage;