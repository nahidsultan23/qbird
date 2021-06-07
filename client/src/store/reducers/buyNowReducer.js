import {
    BUY_NOW_REQUEST,
    BUY_NOW_SUCCESS,
    BUY_NOW_FAILURE,
    AUTH_CHECK_BUY_NOW_REQUEST,
    AUTH_CHECK_BUY_NOW_SUCCESS,
    AUTH_CHECK_BUY_NOW_FAILURE,
    ADD_QUANTITY_IN_BUY_NOW_REQUEST,
    ADD_QUANTITY_IN_BUY_NOW_SUCCESS,
    ADD_QUANTITY_IN_BUY_NOW_FAILURE,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_REQUEST,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_SUCCESS,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_FAILURE,
    CHECKOUT_REQUEST,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case BUY_NOW_REQUEST:
            return { ...state };
        case BUY_NOW_SUCCESS:
            return { ...state, payload: action.payload };
        case BUY_NOW_FAILURE:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_BUY_NOW_REQUEST:
            return { ...state };
        case AUTH_CHECK_BUY_NOW_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_BUY_NOW_FAILURE:
            return { ...state, payload: action.payload };
        case ADD_QUANTITY_IN_BUY_NOW_REQUEST:
            return { ...state };
        case ADD_QUANTITY_IN_BUY_NOW_SUCCESS:
            return { ...state, payload: action.payload }
        case ADD_QUANTITY_IN_BUY_NOW_FAILURE:
            return { ...state, payload: action.payload };
        case SUBTRACT_QUANTITY_FROM_BUY_NOW_REQUEST:
            return { ...state };
        case SUBTRACT_QUANTITY_FROM_BUY_NOW_SUCCESS:
            return { ...state, payload: action.payload }
        case SUBTRACT_QUANTITY_FROM_BUY_NOW_FAILURE:
            return { ...state, payload: action.payload };
        case CHECKOUT_REQUEST:
            return { ...state };
        case CHECKOUT_SUCCESS:
            return { ...state, payload: action.payload }
        case CHECKOUT_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}