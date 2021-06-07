import {
    AUTH_CHECK_DELIVERIES_REQUEST,
    AUTH_CHECK_DELIVERIES_SUCCESS,
    AUTH_CHECK_DELIVERIES_FAILURE,
    FETCH_DELIVERY_DETAILS_REQUEST,
    FETCH_DELIVERY_DETAILS_SUCCESS,
    FETCH_DELIVERY_DETAILS_FAILURE,
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case AUTH_CHECK_DELIVERIES_REQUEST:
            return { ...state };
        case AUTH_CHECK_DELIVERIES_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_DELIVERIES_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_DELIVERY_DETAILS_REQUEST:
            return { ...state };
        case FETCH_DELIVERY_DETAILS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_DELIVERY_DETAILS_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}