import {
    FETCH_DEMO_ADS_REQUEST,
    FETCH_DEMO_ADS_SUCCESS,
    FETCH_DEMO_ADS_FAILURE,
    FETCH_DEMO_AD_REQUEST,
    FETCH_DEMO_AD_SUCCESS,
    FETCH_DEMO_AD_FAILURE,
    CHECK_AUTH_CREATE_DEMO_AD_REQUEST,
    CHECK_AUTH_CREATE_DEMO_AD_SUCCESS,
    CHECK_AUTH_CREATE_DEMO_AD_FAILURE,
    CREATE_DEMO_AD_REQUEST,
    CREATE_DEMO_AD_SUCCESS,
    CREATE_DEMO_AD_FAILURE,
    DEMO_AD_DELETE_REQUEST,
    DEMO_AD_DELETE_SUCCESS,
    DEMO_AD_DELETE_FAILURE,
    DEMO_AD_ADD_TO_LIST_REQUEST,
    DEMO_AD_ADD_TO_LIST_SUCCESS,
    DEMO_AD_ADD_TO_LIST_FAILURE,
    DEMO_AD_REMOVE_FROM_LIST_REQUEST,
    DEMO_AD_REMOVE_FROM_LIST_SUCCESS,
    DEMO_AD_REMOVE_FROM_LIST_FAILURE,
    FETCH_LISTED_DEMO_ADS_REQUEST,
    FETCH_LISTED_DEMO_ADS_SUCCESS,
    FETCH_LISTED_DEMO_ADS_FAILURE,
    ADD_DEMO_AD_TO_USER_ACCOUNT_REQUEST,
    ADD_DEMO_AD_TO_USER_ACCOUNT_SUCCESS,
    ADD_DEMO_AD_TO_USER_ACCOUNT_FAILURE
} from '../actions/types';

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case FETCH_DEMO_ADS_REQUEST:
            return { ...state };
        case FETCH_DEMO_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_DEMO_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_DEMO_AD_REQUEST:
            return { ...state };
        case FETCH_DEMO_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_DEMO_AD_FAILURE:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_CREATE_DEMO_AD_REQUEST:
            return { ...state };
        case CHECK_AUTH_CREATE_DEMO_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_CREATE_DEMO_AD_FAILURE:
            return { ...state, payload: action.payload };
        case CREATE_DEMO_AD_REQUEST:
            return { ...state };
        case CREATE_DEMO_AD_SUCCESS:
            return { ...state, payload: action.payload };
        case CREATE_DEMO_AD_FAILURE:
            return { ...state, payload: action.payload };
        case DEMO_AD_DELETE_REQUEST:
            return { ...state };
        case DEMO_AD_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case DEMO_AD_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        case DEMO_AD_ADD_TO_LIST_REQUEST:
            return { ...state };
        case DEMO_AD_ADD_TO_LIST_SUCCESS:
            return { ...state, payload: action.payload };
        case DEMO_AD_ADD_TO_LIST_FAILURE:
            return { ...state, payload: action.payload };
        case DEMO_AD_REMOVE_FROM_LIST_REQUEST:
            return { ...state };
        case DEMO_AD_REMOVE_FROM_LIST_SUCCESS:
            return { ...state, payload: action.payload };
        case DEMO_AD_REMOVE_FROM_LIST_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_LISTED_DEMO_ADS_REQUEST:
            return { ...state };
        case FETCH_LISTED_DEMO_ADS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_LISTED_DEMO_ADS_FAILURE:
            return { ...state, payload: action.payload };
        case ADD_DEMO_AD_TO_USER_ACCOUNT_REQUEST:
            return { ...state };
        case ADD_DEMO_AD_TO_USER_ACCOUNT_SUCCESS:
            return { ...state, payload: action.payload };
        case ADD_DEMO_AD_TO_USER_ACCOUNT_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}