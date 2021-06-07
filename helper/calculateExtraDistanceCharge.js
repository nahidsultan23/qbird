const calculateExtraDistanceCharge = (Class,distance,totalWeight) => {
    if(distance <= 0.5) {
        return 0;
    }
    else if(distance <= 1) {
        return 1;
    }
    else if(distance <= 1.5) {
        return 3;
    }
    else if(distance <= 2) {
        return 5;
    }
    else if(distance <= 2.5) {
        return 7;
    }
    else if(distance <= 3) {
        return 10;
    }
    else if(distance <= 3.5) {
        return 15;
    }
    else if(distance <= 4) {
        return 20;
    }
    else if(distance <= 4.5) {
        return 30;
    }
    else if(distance <= 5) {
        return 40;
    }
    else if(distance <= 5.5) {
        return 50;
    }
    else if(distance <= 6) {
        return 60;
    }
    else if(distance <= 6.5) {
        return 70;
    }
    else if(distance <= 7) {
        return 80;
    }
    else if(distance <= 7.5) {
        return 90;
    }
    else if(distance <= 8) {
        return 100;
    }
    else if(distance <= 8.5) {
        return 115;
    }
    else if(distance <= 9) {
        return 130;
    }
    else if(distance <= 9.5) {
        return 145;
    }
    else if(distance <= 10) {
        return 160;
    }
    else {
        let roundedDistance = Math.round(distance);
        return (160 + (roundedDistance - 10) * 15);
    }

    /*
    let extraDistanceCharge = 0;
    let roundedDistance = Math.round(distance);
    if(roundedDistance <= 0.5)
        return 0;

    if(Class === 'C') {
        extraDistanceCharge = 10;
        if(roundedDistance > 1) {
            extraDistanceCharge += 10 * (roundedDistance - 1);
        }
        if(roundedDistance > 5) {
            extraDistanceCharge += 2 * (roundedDistance - 5);
        }
    }
    else if(Class === 'R') {
        extraDistanceCharge = 25;
        if(roundedDistance > 1) {
            extraDistanceCharge += 20 * (roundedDistance - 1);
        }
        if(roundedDistance > 5) {
            extraDistanceCharge -= 2 * (roundedDistance - 5);
        }
    }
    else if(Class === 'V') {
        extraDistanceCharge = totalWeight;
        if(roundedDistance > 5) {
            extraDistanceCharge += (72 + 0.2 * totalWeight) * (roundedDistance - 5) + (80 + 0.8 * totalWeight) * 4;
        }
        else if(roundedDistance > 1) {
            extraDistanceCharge += (80 + 0.8 * totalWeight) * (roundedDistance - 1);
        }
    }
    else if(Class === 'T') {
        extraDistanceCharge = Math.floor(totalWeight / 40000) * 235;
        let remainder = totalWeight % 40000;

        if(remainder > 0) {
            extraDistanceCharge += 40 + Math.floor((remainder - 1)/1000) * 5;
        }

        extraDistanceCharge *= roundedDistance;
    }
    else {// Class = BR
        extraDistanceCharge = roundedDistance * 8;
    }

    return extraDistanceCharge;

    */
}

module.exports = calculateExtraDistanceCharge;