const bulkRemove = (items,index,cb,) => {
    if(index < 0)
        return cb();

    items[index].remove()
    .then(item => {
        bulkRemove(items,index-1,cb);
    })
    .catch(err => {
        console.log("ERROR: "+err);
        bulkRemove(items,index-1,cb);
    });
}

module.exports = (items,cb) => {
    bulkRemove(items,items.length-1,cb);
};