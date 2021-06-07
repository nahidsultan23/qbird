import {
    AD_REPORT_REQUEST,
    AD_REPORT_SUCCESS,
    AD_REPORT_FAILURE,
    SHOP_REPORT_REQUEST,
    SHOP_REPORT_SUCCESS,
    SHOP_REPORT_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case AD_REPORT_REQUEST:
            return { ...state };
        case AD_REPORT_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_REPORT_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_REPORT_REQUEST:
            return { ...state };
        case SHOP_REPORT_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_REPORT_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}