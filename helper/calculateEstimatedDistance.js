const fetch = require('node-fetch');
const googleMapApi = require('../constants/googleApi');

const calculateDistance = async(origin,destination) => {
    let fetchUrl = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + origin.lat + "," + origin.long + "&destinations=" + destination.lat + "," + destination.long + "&mode=walking&key=" + googleMapApi.apiKey;
    const response = await fetch(fetchUrl);
    const responseJson = await response.json();
    return responseJson;
}

const findOptimizedStoppageArrangement = async (origin,waypoints,destination) => {
    let fetchUrl = "https://maps.googleapis.com/maps/api/directions/json?origin=" + origin.lat + "," + origin.long + "&destination=" + destination.lat + "," + destination.long;

    if(waypoints.length) {
        let waypointsForUrl = "&waypoints=optimize:true";
        for(let i=0; i<waypoints.length; i++) {
            waypointsForUrl += "|" + waypoints[i].lat + "," + waypoints[i].long;
        }

        fetchUrl +=  waypointsForUrl;
    }

    fetchUrl += "&mode=walking&key=" + googleMapApi.apiKey;
    const response = await fetch(fetchUrl);
    const responseJson = await response.json();

    return responseJson;
}

const arrangeStoppages = async (waypoints,destination) => {
    try {
        let results = [];
        let asyncFunctions = [];
        if(waypoints.length > 1) {
            for(let i=0; i < waypoints.length; i++) {
                let origin = waypoints[i];
                let otherWaypoints = waypoints.filter(item => item != origin)

                results[i] = findOptimizedStoppageArrangement(origin,otherWaypoints,destination);
                asyncFunctions.push(await results[i]);
            }
        }
        else {
            let origin = waypoints[0];
            results[0] = findOptimizedStoppageArrangement(origin,[],destination);
            asyncFunctions.push(await results[0]);
        }

        const finalResult = asyncFunctions;
        let foundOneRoute = false;
        let smallestDistance = 0;
        let smallestDistanceOriginElement = 0;
        for(let i=0; i<waypoints.length; i++) {
            if(finalResult[i].status !== "OK") continue;

            foundOneRoute = true;
            let distance = 0;

            for(let j=0; j<waypoints.length; j++) {
                distance += finalResult[i].routes[0].legs[j].distance.value;
            }

            if(i === 0) {
                smallestDistance = distance;
            }
            else if(distance < smallestDistance) {
                smallestDistance = distance;
                smallestDistanceOriginElement = i;
            }
        }

        const returnResult = {
            resultRoute: finalResult[smallestDistanceOriginElement].routes[0],
            distance: smallestDistance,
            originElement: smallestDistanceOriginElement
        }

        if(foundOneRoute) {
            return returnResult;
        }
    }
    catch (err) {
        throw new Error(err);
    }
}

const calculateUserDistance = async (stoppagePoints, userCoordinate) => {
    let results = [];
    let asyncFunctions = [];
    for(let i=0; i<stoppagePoints.length; i++) {
        results[i] = calculateDistance(stoppagePoints[i].coordinate, userCoordinate);
        asyncFunctions.push(await results[i]);
    }

    const finalResult = asyncFunctions;

    for(let i=0; i<finalResult.length; i++) {
        stoppagePoints[i].userDistance = Math.round(finalResult[i].rows[0].elements[0].distance.value / 10) / 100;
    }
}

const optimizeStoppages = (stoppageCoordinates,userCoordinate,dataModel,cb) => {
    arrangeStoppages(stoppageCoordinates,userCoordinate)
    .then(response => {
        if(response) {
            dataModel.distance = Math.round(response.distance / 10) / 100;
            let waypointOrder = response.resultRoute.waypoint_order;
            let originStoppage = dataModel.itemsArrangedByStoppages[response.originElement];
            let otherStoppages = dataModel.itemsArrangedByStoppages.filter(stoppage => stoppage.id !== originStoppage.id);

            let itemsArrangedByStoppages = [originStoppage];
            itemsArrangedByStoppages[0].distance = 0;
            itemsArrangedByStoppages[0].initialization = "Stoppage 1";

            if(otherStoppages.length) {
                if(otherStoppages.length !== waypointOrder.length) {
                    console.log("WayPoint order array length does not match");
                    dataModel.distance = undefined;
                    return cb();
                }

                for(let i=0; i<otherStoppages.length; i++) {
                    let nextStoppage = otherStoppages[waypointOrder[i]];
                    nextStoppage.distance = Math.round(response.resultRoute.legs[i].distance.value / 10) / 100;
                    nextStoppage.initialization = "Stoppage "+ (i+2);
                    itemsArrangedByStoppages.push(nextStoppage);
                }
            }

            calculateUserDistance(itemsArrangedByStoppages, userCoordinate)
            .then(() => {
                dataModel.itemsArrangedByStoppages = itemsArrangedByStoppages;
                return cb();
            })
            .catch(err => {
                console.log(err);
                dataModel.distance = undefined;
                return cb();
            })
        }
        else {
            dataModel.distance = undefined;
            return cb();
        }
    })
    .catch(err => {
        console.log(err);
        dataModel.distance = undefined;
        return cb();
    })
}

module.exports = (dataModel,userCoordinate,cb) => {
    if(!dataModel.itemsArrangedByStoppages.length) {
        dataModel.distance = 0;
        return cb();
    }

    stoppageCoordinates = [];
    dataModel.itemsArrangedByStoppages.forEach(point => stoppageCoordinates.push(point.coordinate));

    optimizeStoppages(stoppageCoordinates,userCoordinate,dataModel,cb);
}