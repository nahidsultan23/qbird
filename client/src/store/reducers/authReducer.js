import {
    GENERAL_CHECK_REQUEST,
    GENERAL_CHECK_SUCCESS,
    GENERAL_CHECK_FAILURE,
    AUTHENTICATED_CHECK_REQUEST,
    AUTHENTICATED_CHECK_SUCCESS,
    AUTHENTICATED_CHECK_FAILURE,
    CHECK_AUTH_ADMIN_REQUEST,
    CHECK_AUTH_ADMIN_SUCCESS,
    CHECK_AUTH_ADMIN_FAILURE,
    LOGIN_SUCCESS,
    LOGIN_REQUEST,
    LOGIN_FAILURE,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    SIGNUP_REQUEST,
    SIGNUP_SUCCESS,
    SIGNUP_FAILURE,
    OTP_RESEND_REQUEST,
    OTP_RESEND_SUCCESS,
    OTP_RESEND_FAILURE,
    OTP_VERIFY_REQUEST,
    OTP_VERIFY_SUCCESS,
    OTP_VERIFY_FAILURE,
    ACCOUNT_RECOVERY_REQUEST,
    ACCOUNT_RECOVERY_SUCCESS,
    ACCOUNT_RECOVERY_FAILURE,
    ACCOUNT_RECOVERY_OTP_RESEND_REQUEST,
    ACCOUNT_RECOVERY_OTP_RESEND_SUCCESS,
    ACCOUNT_RECOVERY_OTP_RESEND_FAILURE,
    ACCOUNT_RECOVERY_VERIFY_OTP_REQUEST,
    ACCOUNT_RECOVERY_VERIFY_OTP_SUCCESS,
    ACCOUNT_RECOVERY_VERIFY_OTP_FAILURE,
    ACCOUNT_RECOVERY_CHANGE_PASSWORD_REQUEST,
    ACCOUNT_RECOVERY_CHANGE_PASSWORD_SUCCESS,
    ACCOUNT_RECOVERY_CHANGE_PASSWORD_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN,
    UPDATE_CART_COUNT,
    USER_ACCOUNT_TAB
} from '../actions/types';

const initState = {
    isAuthenticated: false,
    notAuthenticated: false
};

export default (state = initState, action) => {
    switch (action.type) {
        case GENERAL_CHECK_REQUEST:
            return { ...state };
        case GENERAL_CHECK_SUCCESS:
            return { ...state, isAuthenticated: true, notAuthenticated: false, payload: action.payload };
        case GENERAL_CHECK_FAILURE:
            return { ...state, isAuthenticated: false, notAuthenticated: true, payload: action.payload };
        case AUTHENTICATED_CHECK_REQUEST:
            return { ...state };
        case AUTHENTICATED_CHECK_SUCCESS:
            return { ...state, isAuthenticated: true, notAuthenticated: false, payload: action.payload };
        case AUTHENTICATED_CHECK_FAILURE:
            return { ...state, isAuthenticated: false, notAuthenticated: true, payload: action.payload };
        case CHECK_AUTH_ADMIN_REQUEST:
            return { ...state };
        case CHECK_AUTH_ADMIN_SUCCESS:
            return { ...state, isAuthenticated: true, notAuthenticated: false, payload: action.payload };
        case CHECK_AUTH_ADMIN_FAILURE:
            return { ...state, isAuthenticated: false, notAuthenticated: true, payload: action.payload };
        case LOGIN_REQUEST:
            return { ...state };
        case LOGIN_SUCCESS:
            return { ...state, isAuthenticated: true, notAuthenticated: false, payload: action.payload };
        case LOGIN_FAILURE:
            return { ...state, isAuthenticated: false, notAuthenticated: true, payload: action.payload };
        case LOGOUT_REQUEST:
            return { ...state };
        case LOGOUT_SUCCESS:
            return { ...state, isAuthenticated: false, notAuthenticated: true };
        case LOGOUT_FAILURE:
            return { ...state, isAuthenticated: false, notAuthenticated: true };
        case SIGNUP_REQUEST:
            return { ...state };
        case SIGNUP_SUCCESS:
            return { ...state, payload: { ...action.payload, registrationPage: 2 } };
        case SIGNUP_FAILURE:
            return { ...state, payload: action.payload };
        case OTP_RESEND_REQUEST:
            return { ...state };
        case OTP_RESEND_SUCCESS:
            return { ...state, payload: { ...action.payload, registrationPage: 2 } };
        case OTP_RESEND_FAILURE:
            return { ...state, payload: { ...action.payload, registrationPage: 2 } };
        case OTP_VERIFY_REQUEST:
            return { ...state };
        case OTP_VERIFY_SUCCESS:
            return { ...state, payload: action.payload };
        case OTP_VERIFY_FAILURE:
            return { ...state, payload: { ...action.payload, registrationPage: 2 } };
        case ACCOUNT_RECOVERY_REQUEST:
            return { ...state };
        case ACCOUNT_RECOVERY_SUCCESS:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 2 } };
        case ACCOUNT_RECOVERY_FAILURE:
            return { ...state, payload: action.payload };
        case ACCOUNT_RECOVERY_OTP_RESEND_REQUEST:
            return { ...state };
        case ACCOUNT_RECOVERY_OTP_RESEND_SUCCESS:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 2 } };
        case ACCOUNT_RECOVERY_OTP_RESEND_FAILURE:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 2 } };
        case ACCOUNT_RECOVERY_VERIFY_OTP_REQUEST:
            return { ...state };
        case ACCOUNT_RECOVERY_VERIFY_OTP_SUCCESS:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 3 } };
        case ACCOUNT_RECOVERY_VERIFY_OTP_FAILURE:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 2 } };
        case ACCOUNT_RECOVERY_CHANGE_PASSWORD_REQUEST:
            return { ...state };
        case ACCOUNT_RECOVERY_CHANGE_PASSWORD_SUCCESS:
            return { ...state, payload: action.payload };
        case ACCOUNT_RECOVERY_CHANGE_PASSWORD_FAILURE:
            return { ...state, payload: { ...action.payload, recoverPasswordPage: 3 } };
        case USER_LOGGED_IN:
            return { ...state, isAuthenticated: true, notAuthenticated: false, payload: { ...state.payload, name: action.payload.name, cartItemNumber: action.payload.cartItemNumber } };
        case USER_NOT_LOGGED_IN:
            return { ...state, isAuthenticated: false, notAuthenticated: true, payload: { ...state.payload } };
        case UPDATE_CART_COUNT:
            return { ...state, payload: { ...state.payload, cartItemNumber: action.payload } };
        case USER_ACCOUNT_TAB:
            return { ...state, tab: action.payload };
        default:
            return state;
    }
}