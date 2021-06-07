module.exports = (specifications1,specifications2) => {
    if(specifications1.length !== specifications2.length)
        return false;

    for(var i=0; i<specifications1.length; i++) {
        if(specifications2.findIndex(s => s.specificationName === specifications1[i].specificationName && s.specification === specifications1[i].specification) === -1)
            return false;
    }

    return true;
}