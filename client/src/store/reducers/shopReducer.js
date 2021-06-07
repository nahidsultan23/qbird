import {
    FETCH_SHOPS_REQUEST,
    FETCH_SHOPS_SUCCESS,
    FETCH_SHOPS_FAILURE,
    FETCH_AUTH_SHOP_REQUEST,
    FETCH_AUTH_SHOP_SUCCESS,
    FETCH_AUTH_SHOP_FAILURE,
    TOGGLE_SHOP_STATUS_REQUEST,
    TOGGLE_SHOP_STATUS_SUCCESS,
    TOGGLE_SHOP_STATUS_FAILURE,
    TOGGLE_FORCE_OPEN_REQUEST,
    TOGGLE_FORCE_OPEN_SUCCESS,
    TOGGLE_FORCE_OPEN_FAILURE,
    RATE_SHOP_REQUEST,
    RATE_SHOP_SUCCESS,
    RATE_SHOP_FAILURE,
    SHOP_COMMENT_REQUEST,
    SHOP_COMMENT_SUCCESS,
    SHOP_COMMENT_FAILURE,
    SHOP_REPLY_REQUEST,
    SHOP_REPLY_SUCCESS,
    SHOP_REPLY_FAILURE,
    SHOP_COMMENT_DELETE_REQUEST,
    SHOP_COMMENT_DELETE_SUCCESS,
    SHOP_COMMENT_DELETE_FAILURE,
    SHOP_REPLY_DELETE_REQUEST,
    SHOP_REPLY_DELETE_SUCCESS,
    SHOP_REPLY_DELETE_FAILURE,
    CHECK_AUTH_UPDATE_SHOP_REQUEST,
    CHECK_AUTH_UPDATE_SHOP_SUCCESS,
    CHECK_AUTH_UPDATE_SHOP_FAILURE,
    CREATE_SHOP_REQUEST,
    CREATE_SHOP_SUCCESS,
    CREATE_SHOP_FAILURE,
    SHOP_DELETE_REQUEST,
    SHOP_DELETE_SUCCESS,
    SHOP_DELETE_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case FETCH_SHOPS_REQUEST:
            return { ...state };
        case FETCH_SHOPS_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_SHOPS_FAILURE:
            return { ...state, payload: action.payload };
        case FETCH_AUTH_SHOP_REQUEST:
            return { ...state };
        case FETCH_AUTH_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_AUTH_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        case TOGGLE_SHOP_STATUS_REQUEST:
            return state;
        case TOGGLE_SHOP_STATUS_SUCCESS:
            return { ...state, payload: action.payload };
        case TOGGLE_SHOP_STATUS_FAILURE:
            return { ...state, payload: action.payload };
        case TOGGLE_FORCE_OPEN_REQUEST:
            return state;
        case TOGGLE_FORCE_OPEN_SUCCESS:
            return { ...state, payload: action.payload };
        case TOGGLE_FORCE_OPEN_FAILURE:
            return { ...state, payload: action.payload };
        case RATE_SHOP_REQUEST:
            return { ...state };
        case RATE_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case RATE_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_COMMENT_REQUEST:
            return { ...state };
        case SHOP_COMMENT_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_COMMENT_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_REPLY_REQUEST:
            return { ...state };
        case SHOP_REPLY_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_REPLY_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_COMMENT_DELETE_REQUEST:
            return { ...state };
        case SHOP_COMMENT_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_COMMENT_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_REPLY_DELETE_REQUEST:
            return { ...state };
        case SHOP_REPLY_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_REPLY_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_UPDATE_SHOP_REQUEST:
            return { ...state };
        case CHECK_AUTH_UPDATE_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case CHECK_AUTH_UPDATE_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        case CREATE_SHOP_REQUEST:
            return { ...state };
        case CREATE_SHOP_SUCCESS:
            return { ...state, payload: action.payload };
        case CREATE_SHOP_FAILURE:
            return { ...state, payload: action.payload };
        case SHOP_DELETE_REQUEST:
            return { ...state };
        case SHOP_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case SHOP_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}