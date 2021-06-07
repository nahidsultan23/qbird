import {
    AUTH_CHECK_CHECKOUT_REQUEST,
    AUTH_CHECK_CHECKOUT_SUCCESS,
    AUTH_CHECK_CHECKOUT_FAILURE,
    USER_ADDRESS_CALCULATIONS_REQUEST,
    USER_ADDRESS_CALCULATIONS_SUCCESS,
    USER_ADDRESS_CALCULATIONS_FAILURE,
    PLACE_ORDER_REQUEST,
    PLACE_ORDER_SUCCESS,
    PLACE_ORDER_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case AUTH_CHECK_CHECKOUT_REQUEST:
            return { ...state };
        case AUTH_CHECK_CHECKOUT_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_CHECKOUT_FAILURE:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_CALCULATIONS_REQUEST:
            return { ...state };
        case USER_ADDRESS_CALCULATIONS_SUCCESS:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_CALCULATIONS_FAILURE:
            return { ...state, payload: action.payload };
        case PLACE_ORDER_REQUEST:
            return { ...state };
        case PLACE_ORDER_SUCCESS:
            return { ...state, payload: action.payload };
        case PLACE_ORDER_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}