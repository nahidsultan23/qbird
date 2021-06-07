import {
    SEARCH_RESULT_ADS_REQUEST,
    SEARCH_RESULT_ADS_SUCCESS,
    SEARCH_RESULT_ADS_FAILURE,
    SEARCH_RESULT_SHOPS_REQUEST,
    SEARCH_RESULT_SHOPS_SUCCESS,
    SEARCH_RESULT_SHOPS_FAILURE,
    SEARCH_RESULT_OF_SHOP_REQUEST,
    SEARCH_RESULT_OF_SHOP_SUCCESS,
    SEARCH_RESULT_OF_SHOP_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case SEARCH_RESULT_ADS_REQUEST:
            return { ...state };
        case SEARCH_RESULT_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case SEARCH_RESULT_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case SEARCH_RESULT_SHOPS_REQUEST:
            return { ...state };
        case SEARCH_RESULT_SHOPS_SUCCESS:
            return { ...state, payload: action.payload };
        case SEARCH_RESULT_SHOPS_FAILURE:
            return { ...state, payload: action.payload };
        case SEARCH_RESULT_OF_SHOP_REQUEST:
            return { ...state };
        case SEARCH_RESULT_OF_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case SEARCH_RESULT_OF_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}