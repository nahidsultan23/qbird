
module.exports = (options) => {
    options.sort((a,b) => {
        console.log(b.optionName < a.optionName);
        if(b.optionName < a.optionName)
            return 1;
        else if(b.optionName > a.optionName)
            return -1;
        else
            return  b.option < a.option ? 1 : -1;
    });
}