import {
    AUTH_CHECK_USER_ADDRESS_REQUEST,
    AUTH_CHECK_USER_ADDRESS_SUCCESS,
    AUTH_CHECK_USER_ADDRESS_FAILURE,
    USER_ADDRESS_SUBMIT_REQUEST,
    USER_ADDRESS_SUBMIT_SUCCESS,
    USER_ADDRESS_SUBMIT_FAILURE,
    AUTH_CHECK_EDIT_USER_ADDRESS_REQUEST,
    AUTH_CHECK_EDIT_USER_ADDRESS_SUCCESS,
    AUTH_CHECK_EDIT_USER_ADDRESS_FAILURE,
    USER_ADDRESS_EDIT_SUBMIT_REQUEST,
    USER_ADDRESS_EDIT_SUBMIT_SUCCESS,
    USER_ADDRESS_EDIT_SUBMIT_FAILURE,
    USER_ADDRESS_DELETE_REQUEST,
    USER_ADDRESS_DELETE_SUCCESS,
    USER_ADDRESS_DELETE_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case AUTH_CHECK_USER_ADDRESS_REQUEST:
            return { ...state };
        case AUTH_CHECK_USER_ADDRESS_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_USER_ADDRESS_FAILURE:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_SUBMIT_REQUEST:
            return { ...state };
        case USER_ADDRESS_SUBMIT_SUCCESS:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_SUBMIT_FAILURE:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_EDIT_USER_ADDRESS_REQUEST:
            return { ...state };
        case AUTH_CHECK_EDIT_USER_ADDRESS_SUCCESS:
            return { ...state, payload: action.payload };
        case AUTH_CHECK_EDIT_USER_ADDRESS_FAILURE:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_EDIT_SUBMIT_REQUEST:
            return { ...state };
        case USER_ADDRESS_EDIT_SUBMIT_SUCCESS:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_EDIT_SUBMIT_FAILURE:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_DELETE_REQUEST:
            return { ...state };
        case USER_ADDRESS_DELETE_SUCCESS:
            return { ...state, payload: action.payload };
        case USER_ADDRESS_DELETE_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}