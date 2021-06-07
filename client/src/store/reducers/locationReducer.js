import {
    FETCH_LOCATION_REQUEST,
    FETCH_LOCATION_SUCCESS,
    FETCH_LOCATION_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case FETCH_LOCATION_REQUEST:
            return { ...state };
        case FETCH_LOCATION_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_LOCATION_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}