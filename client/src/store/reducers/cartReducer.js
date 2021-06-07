import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    AUTH_CHECK_CART_REQUEST,
    AUTH_CHECK_CART_SUCCESS,
    AUTH_CHECK_CART_FAILURE,
    ADD_QUANTITY_TO_CART_REQUEST,
    ADD_QUANTITY_TO_CART_SUCCESS,
    ADD_QUANTITY_TO_CART_FAILURE,
    SUBTRACT_QUANTITY_FROM_CART_REQUEST,
    SUBTRACT_QUANTITY_FROM_CART_SUCCESS,
    SUBTRACT_QUANTITY_FROM_CART_FAILURE,
    REMOVE_FROM_CART_REQUEST,
    REMOVE_FROM_CART_SUCCESS,
    REMOVE_FROM_CART_FAILURE,
    CHECKOUT_REQUEST,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case ADD_TO_CART_REQUEST:
            return { ...state };
        case ADD_TO_CART_SUCCESS:
            return { ...state, payload: action.payload };
        case ADD_TO_CART_FAILURE:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_CART_REQUEST:
            return { ...state };
        case AUTH_CHECK_CART_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_CART_FAILURE:
            return { ...state, payload: action.payload };
        case ADD_QUANTITY_TO_CART_REQUEST:
            return { ...state };
        case ADD_QUANTITY_TO_CART_SUCCESS:
            return { ...state, payload: action.payload };
        case ADD_QUANTITY_TO_CART_FAILURE:
            return { ...state, payload: action.payload };
        case SUBTRACT_QUANTITY_FROM_CART_REQUEST:
            return { ...state };
        case SUBTRACT_QUANTITY_FROM_CART_SUCCESS:
            return { ...state, payload: action.payload };
        case SUBTRACT_QUANTITY_FROM_CART_FAILURE:
            return { ...state, payload: action.payload };
        case REMOVE_FROM_CART_REQUEST:
            return { ...state };
        case REMOVE_FROM_CART_SUCCESS:
            return { ...state, payload: action.payload };
        case REMOVE_FROM_CART_FAILURE:
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