import {
    FETCH_AD_REQUEST,
    FETCH_AD_SUCCESS,
    FETCH_AD_FAILURE,
    FETCH_SHOP_REQUEST,
    FETCH_SHOP_SUCCESS,
    FETCH_SHOP_FAILURE
} from '../actions/types';

const initState = {}

const detailsReducer = (state = initState, action) => {
    switch (action.type) {
        case FETCH_AD_REQUEST:
            return { ...state };
        case FETCH_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_AD_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_SHOP_REQUEST:
            return { ...state };
        case FETCH_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}

export default detailsReducer;