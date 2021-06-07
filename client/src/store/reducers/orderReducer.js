import {
    AUTH_CHECK_ORDERS_REQUEST,
    AUTH_CHECK_ORDERS_SUCCESS,
    AUTH_CHECK_ORDERS_FAILURE,
    FETCH_ORDER_DETAILS_REQUEST,
    FETCH_ORDER_DETAILS_SUCCESS,
    FETCH_ORDER_DETAILS_FAILURE,
    CANCEL_ORDER_REQUEST,
    CANCEL_ORDER_SUCCESS,
    CANCEL_ORDER_FAILURE,
    COMPLETE_ORDER_REQUEST,
    COMPLETE_ORDER_SUCCESS,
    COMPLETE_ORDER_FAILURE,
    RATE_ORDER_REQUEST,
    RATE_ORDER_SUCCESS,
    RATE_ORDER_FAILURE,
    ORDER_RATING_CLOSE_FOREVER_REQUEST,
    ORDER_RATING_CLOSE_FOREVER_SUCCESS,
    ORDER_RATING_CLOSE_FOREVER_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case AUTH_CHECK_ORDERS_REQUEST:
            return { ...state };
        case AUTH_CHECK_ORDERS_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_ORDERS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_ORDER_DETAILS_REQUEST:
            return { ...state };
        case FETCH_ORDER_DETAILS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_ORDER_DETAILS_FAILURE:
            return { ...state, payload: action.payload };
        case CANCEL_ORDER_REQUEST:
            return { ...state };
        case CANCEL_ORDER_SUCCESS:
            return { ...state, payload: action.payload };
        case CANCEL_ORDER_FAILURE:
            return { ...state, payload: action.payload };
        case COMPLETE_ORDER_REQUEST:
            return { ...state };
        case COMPLETE_ORDER_SUCCESS:
            return { ...state, payload: action.payload };
        case COMPLETE_ORDER_FAILURE:
            return { ...state, payload: action.payload };
        case RATE_ORDER_REQUEST:
            return { ...state };
        case RATE_ORDER_SUCCESS:
            return { ...state, payload: action.payload };
        case RATE_ORDER_FAILURE:
            return { ...state, payload: action.payload };
        case ORDER_RATING_CLOSE_FOREVER_REQUEST:
            return { ...state };
        case ORDER_RATING_CLOSE_FOREVER_SUCCESS:
            return { ...state, payload: action.payload };
        case ORDER_RATING_CLOSE_FOREVER_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}