import {
    AUTH_CHECK_SALES_REQUEST,
    AUTH_CHECK_SALES_SUCCESS,
    AUTH_CHECK_SALES_FAILURE,
    FETCH_SALE_DETAILS_REQUEST,
    FETCH_SALE_DETAILS_SUCCESS,
    FETCH_SALE_DETAILS_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case AUTH_CHECK_SALES_REQUEST:
            return { ...state };
        case AUTH_CHECK_SALES_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_SALES_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_SALE_DETAILS_REQUEST:
            return { ...state };
        case FETCH_SALE_DETAILS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_SALE_DETAILS_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}