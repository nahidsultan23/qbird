import Geocode from "react-geocode";

export const truncate = (str, length) => {
    return (str && str.length > length) ? str.substring(0, length) + "..." : str;
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const Weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const updateQueryStringParam = (key, value, search) => {
    var urlQueryString = search,
        newParam = key + '=' + value,
        params = '?' + newParam;
    if (!value || value === '')
        return removeURLParameter(search, key);
    if (urlQueryString) {
        let keyRegex = new RegExp('([?&])' + key + '[^&]*');
        if (urlQueryString.match(keyRegex) !== null) {
            params = urlQueryString.replace(keyRegex, "$1" + newParam);
        } else {
            params = urlQueryString + '&' + newParam;
        }
    }
    return (params);
};

export const removeURLParameter = (search, parameter) => {
    var prefix = encodeURIComponent(parameter) + '=';
    var pars = search.split(/[&;]/g);
    for (var i = pars.length; i-- > 0;) {
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
            pars.splice(i, 1);
        }
    }

    return (pars.length > 0 ? pars.join('&') : '');
}


export const getDistance = (meters) => {
    if (meters !== null && meters !== undefined && meters >= 0 && meters !== "") {
        if(meters < 100000) {
            let distanceKm = meters/1000;
            if(Number.isInteger(distanceKm)) {
                return `${distanceKm} km`;
            }
            else {
                return `${thousandSeparators(distanceKm.toFixed(2))} km`;
            }
        }
        else {
            return `${thousandSeparators(Math.round(Math.round(meters) / 1000))} km`;
        }
    }
}

export const getDistanceFromKm = (kms) => {
    if (kms !== null && kms !== undefined && kms >= 0 && kms !== "") {
        if(kms < 100) {
            if(Number.isInteger(kms)) {
                return `${kms} km`;
            }
            else {
                return `${thousandSeparators(kms.toFixed(2))} km`;
            }
        }
        else {
            return `${thousandSeparators(Math.round(kms))} km`;
        }
    }
}

export const getAddress = (lat, lng) => {
    return new Promise((resolve, reject) => {
        Geocode.fromLatLng(lat, lng).then(
            response => {
                const address = response.results[0].formatted_address;
                resolve({
                    coordinate: {
                        lat: lat,
                        lng: lng
                    },
                    address: address
                });
            },
            error => {
                reject(error);
            }
        );
    })
}

export const twoDecimalPoints = (value) => {
    value = Number(value);
    if(value && (value !== Math.floor(value))) {
        return value.toFixed(2);
    }
    else {
        return value;
    }
}

export const twoFixedDecimalPoints = (value) => {
    value = Number(value);
    if(value) {
        return value.toFixed(2);
    }
    else if(value === 0) {
        return "0.00";
    }
    else {
        return value;
    }
}

export const convertTimeFromSeconds = (value) => {
    value = Number(twoDecimalPoints(value));
    if(value) {
        let convertedTime = '';
        if(value > 86400) {
            convertedTime = Math.floor(value / 86400) + ' days ';
            value = value % 86400;
        }
        else if(value === 86400) {
            convertedTime = '1 day ';
            value = 0;
        }

        if(value > 3600) {
            convertedTime = convertedTime + Math.floor(value / 3600) + ' hrs ';
            value = value % 3600;
        }
        else if(value === 3600) {
            convertedTime = convertedTime + '1 hr ';
            value = 0;
        }

        if(value > 60) {
            convertedTime = convertedTime + Math.floor(value / 60) + ' mins ';
            value = value % 60;
        }
        else if(value === 60) {
            convertedTime = convertedTime + '1 min ';
            value = 0;
        }

        if(value > 1) {
            convertedTime = convertedTime + value + ' seconds ';
        }
        else if((value > 0) && (value <= 1)) {
            convertedTime = convertedTime + '1 second ';
        }
        return convertedTime;
    }
    else {
        return value;
    }
}

export const thousandSeparators = (string) => {
    if(string || string === 0 ) {
        let str = string.toString();
        let separateDecimalPoint = str.split(".");
        let roundedValue = separateDecimalPoint[0];
        let roundedValueLength = roundedValue.length;
        if(roundedValueLength > 3) {
            let separatorArray = [3,2,2];
            let reverseNumber = roundedValue.split("").reverse().join("");
            let separatedNumber = '';
            let i = 0;
            let j = 0;
            let counter = 0;
            for(; i<roundedValueLength; i++) {
                if(counter === separatorArray[j]) {
                    separatedNumber = separatedNumber + ',';
                    counter = 0;
                    j++;
                    if(j > 2) {
                        j = 0;
                    }
                }
                separatedNumber = separatedNumber + reverseNumber[i];
                counter++;
            }
            separatedNumber = separatedNumber.split("").reverse().join("");
            if(separateDecimalPoint[1]) {
                separatedNumber = separatedNumber + '.' + separateDecimalPoint[1];
            }
            return separatedNumber;
        }
        else {
            return str;
        }
    }
}