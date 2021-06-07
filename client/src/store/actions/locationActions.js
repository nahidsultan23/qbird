import {
    FETCH_LOCATION_REQUEST,
    FETCH_LOCATION_SUCCESS,
    FETCH_LOCATION_FAILURE
} from '../actions/types';

export const fetchLocation = () => async dispatch => {
    dispatch({
        type: FETCH_LOCATION_REQUEST
    });

    if((localStorage.getItem("fetchLocation") === 'success') && (localStorage.getItem("lat")) && (localStorage.getItem("long"))) {
        dispatch({
            type: FETCH_LOCATION_SUCCESS,
            payload: {
                status: 'success',
                location: {
                    lat: localStorage.getItem("lat"),
                    long: localStorage.getItem("long")
                }
            }
        });
    } else {
        dispatch({
            type: FETCH_LOCATION_FAILURE,
            payload: {
                status: 'failure',
                location: {
                    lat: 23.810332,
                    long: 90.41251809999994
                }
            }
        });
    }
}