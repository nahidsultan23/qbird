import {
    CHECK_AUTH_CREATE_AD_REQUEST,
    CHECK_AUTH_CREATE_AD_SUCCESS,
    CHECK_AUTH_CREATE_AD_FAILURE,
    CHECK_AUTH_UPDATE_AD_REQUEST,
    CHECK_AUTH_UPDATE_AD_SUCCESS,
    CHECK_AUTH_UPDATE_AD_FAILURE,
    CREATE_INDIVIDUAL_AD_REQUEST,
    CREATE_INDIVIDUAL_AD_SUCCESS,
    CREATE_INDIVIDUAL_AD_FAILURE,
    ATTACH_AD_REQUEST,
    ATTACH_AD_SUCCESS,
    ATTACH_AD_FAILURE,
    FETCH_ADS_REQUEST,
    FETCH_ADS_SUCCESS,
    FETCH_ADS_FAILURE,
    FETCH_INDIVIDUAL_ADS_REQUEST,
    FETCH_INDIVIDUAL_ADS_SUCCESS,
    FETCH_INDIVIDUAL_ADS_FAILURE,
    FETCH_SHOP_ADS_REQUEST,
    FETCH_SHOP_ADS_SUCCESS,
    FETCH_SHOP_ADS_FAILURE,
    FETCH_AUTH_AD_REQUEST,
    FETCH_AUTH_AD_SUCCESS,
    FETCH_AUTH_AD_FAILURE,
    TOGGLE_AD_STATUS_REQUEST,
    TOGGLE_AD_STATUS_SUCCESS,
    TOGGLE_AD_STATUS_FAILURE,
    AD_DELETE_REQUEST,
    AD_DELETE_SUCCESS,
    AD_DELETE_FAILURE,
    RATE_AD_REQUEST,
    RATE_AD_SUCCESS,
    RATE_AD_FAILURE,
    AD_COMMENT_REQUEST,
    AD_COMMENT_SUCCESS,
    AD_COMMENT_FAILURE,
    AD_REPLY_REQUEST,
    AD_REPLY_SUCCESS,
    AD_REPLY_FAILURE,
    AD_COMMENT_DELETE_REQUEST,
    AD_COMMENT_DELETE_SUCCESS,
    AD_COMMENT_DELETE_FAILURE,
    AD_REPLY_DELETE_REQUEST,
    AD_REPLY_DELETE_SUCCESS,
    AD_REPLY_DELETE_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case CHECK_AUTH_CREATE_AD_REQUEST:
            return { ...state };
        case CHECK_AUTH_CREATE_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_CREATE_AD_FAILURE:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_UPDATE_AD_REQUEST:
            return { ...state };
        case CHECK_AUTH_UPDATE_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_UPDATE_AD_FAILURE:
            return { ...state, payload: action.payload };
        case CREATE_INDIVIDUAL_AD_REQUEST:
            return { ...state };
        case CREATE_INDIVIDUAL_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case CREATE_INDIVIDUAL_AD_FAILURE:
            return { ...state, payload: action.payload };
        case ATTACH_AD_REQUEST:
            return { ...state };
        case ATTACH_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case ATTACH_AD_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_ADS_REQUEST:
            return { ...state };
        case FETCH_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_INDIVIDUAL_ADS_REQUEST:
            return { ...state };
        case FETCH_INDIVIDUAL_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_INDIVIDUAL_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_SHOP_ADS_REQUEST:
            return { ...state };
        case FETCH_SHOP_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_SHOP_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_AUTH_AD_REQUEST:
            return { ...state };
        case FETCH_AUTH_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_AUTH_AD_FAILURE:
            return { ...state, payload: action.payload };
        case TOGGLE_AD_STATUS_REQUEST:
            return state;
        case TOGGLE_AD_STATUS_SUCCESS:
            return { ...state, payload: action.payload };
        case TOGGLE_AD_STATUS_FAILURE:
            return { ...state, payload: action.payload };
        case AD_DELETE_REQUEST:
            return { ...state };
        case AD_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        case RATE_AD_REQUEST:
            return { ...state };
        case RATE_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case RATE_AD_FAILURE:
            return { ...state, payload: action.payload };
        case AD_COMMENT_REQUEST:
            return { ...state };
        case AD_COMMENT_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_COMMENT_FAILURE:
            return { ...state, payload: action.payload };
        case AD_REPLY_REQUEST:
            return { ...state };
        case AD_REPLY_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_REPLY_FAILURE:
            return { ...state, payload: action.payload };
        case AD_COMMENT_DELETE_REQUEST:
            return { ...state };
        case AD_COMMENT_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_COMMENT_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        case AD_REPLY_DELETE_REQUEST:
            return { ...state };
        case AD_REPLY_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case AD_REPLY_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}