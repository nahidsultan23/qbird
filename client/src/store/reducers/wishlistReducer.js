import {
    ADD_TO_WISHLIST_REQUEST,
    ADD_TO_WISHLIST_SUCCESS,
    ADD_TO_WISHLIST_FAILURE,
    AUTH_CHECK_WISHLIST_REQUEST,
    AUTH_CHECK_WISHLIST_SUCCESS,
    AUTH_CHECK_WISHLIST_FAILURE,
    REMOVE_FROM_WISHLIST_REQUEST,
    REMOVE_FROM_WISHLIST_SUCCESS,
    REMOVE_FROM_WISHLIST_FAILURE,
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case ADD_TO_WISHLIST_REQUEST:
            return { ...state };
        case ADD_TO_WISHLIST_SUCCESS:
            return { ...state, payload: action.payload };
        case ADD_TO_WISHLIST_FAILURE:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_WISHLIST_REQUEST:
            return { ...state };
        case AUTH_CHECK_WISHLIST_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_WISHLIST_FAILURE:
            return { ...state, payload: action.payload };
        case REMOVE_FROM_WISHLIST_REQUEST:
            return { ...state };
        case REMOVE_FROM_WISHLIST_SUCCESS:
            return { ...state, payload: action.payload };
        case REMOVE_FROM_WISHLIST_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}