const geocoding = new require('reverse-geocoding');
const googleMapApi = require('../constants/googleApi');

const fetchLocation = (req,cb) => {
    geocoding({latitude: req.body.coordinate.lat, longitude: req.body.coordinate.long, key: googleMapApi.apiKey}, function (err, data) {
        req.body.location = 'No address';
        let outsideBD = false;
        if(!err) {
            req.body.location = data.results[0].formatted_address.replace(/ /g,'+');
            console.log(req.body.location);
            if(!/.*\+Bangladesh/.test(req.body.location)) {
                outsideBD = true;
            }
        }
        cb(outsideBD);
    });
}

module.exports = fetchLocation;