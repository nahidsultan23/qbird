const bulkSave = (items,index,cb,) => {
    if(index < 0)
        return cb();

    items[index].save()
    .then(item => {
        bulkSave(items,index-1,cb);
    })
    .catch(err => {
        console.log("ERROR: "+err);
        bulkSave(items,index-1,cb);
    });
}

module.exports = (items,cb) => {
    bulkSave(items,items.length-1,cb);
};