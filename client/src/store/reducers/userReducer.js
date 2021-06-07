import {
    ACCOUNT_DETAILS_REQUEST,
    ACCOUNT_DETAILS_SUCCESS,
    ACCOUNT_DETAILS_FAILURE,
    UPDATE_USER_DETAILS_REQUEST,
    UPDATE_USER_DETAILS_SUCCESS,
    UPDATE_USER_DETAILS_FAILURE,
    UPDATE_USER_PHOTO_REQUEST,
    UPDATE_USER_PHOTO_SUCCESS,
    UPDATE_USER_PHOTO_FAILURE,
    UPDATE_USER_PASSWORD_REQUEST,
    UPDATE_USER_PASSWORD_SUCCESS,
    UPDATE_USER_PASSWORD_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case ACCOUNT_DETAILS_REQUEST:
            return { ...state };
        case ACCOUNT_DETAILS_SUCCESS:
            return { ...state, payload: action.payload };
        case ACCOUNT_DETAILS_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_USER_DETAILS_REQUEST:
            return { ...state };
        case UPDATE_USER_DETAILS_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_USER_DETAILS_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_USER_PHOTO_REQUEST:
            return { ...state };
        case UPDATE_USER_PHOTO_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_USER_PHOTO_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_USER_PASSWORD_REQUEST:
            return { ...state };
        case UPDATE_USER_PASSWORD_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_USER_PASSWORD_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}