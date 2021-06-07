const constants = require('./myConstants');

const calculateShippingCharge = (waitingTime) => {
    let shippingCharge = constants.SHIPPING_CHARGE;
    if(waitingTime > 0) {
        shippingCharge = 25;
    }
    
    return shippingCharge;
}

module.exports = calculateShippingCharge;