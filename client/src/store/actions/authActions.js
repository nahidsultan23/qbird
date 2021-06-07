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
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
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
    USER_ACCOUNT_TAB
} from './types';
import { encryptedPassword, signedPassword } from '../../services/nodeRSAService';
import history from '../../history';

import axios from 'axios';
import { toast } from 'react-toastify';

export const general = () => async dispatch => {
    dispatch({
        type: GENERAL_CHECK_REQUEST,
    });
    const response = await axios.post(`/api/auth-check/general`);
    if (response.data && response.data.status === 'success') {
        if(response.data.errorMessage.authError) {
            dispatch({
                type: GENERAL_CHECK_FAILURE,
                payload: response.data
            });
        }
        else {
            dispatch({
                type: GENERAL_CHECK_SUCCESS,
                payload: response.data
            });
        }
    }
    else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: GENERAL_CHECK_FAILURE,
            payload: response.data
        });
    }
}

export const authenticated = () => async dispatch => {
    dispatch({
        type: AUTHENTICATED_CHECK_REQUEST,
    });
    const response = await axios.post(`/api/auth-check/authenticated`);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTHENTICATED_CHECK_SUCCESS,
            payload: response.data
        });
    } else {
        dispatch({
            type: AUTHENTICATED_CHECK_FAILURE,
            payload: response.data
        });
    }
}

export const checkAuthAdmin = (obj) => async dispatch => {
    dispatch({
        type: CHECK_AUTH_ADMIN_REQUEST
    });
    const response = await axios.post('/api/auth-check/admin', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECK_AUTH_ADMIN_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CHECK_AUTH_ADMIN_FAILURE,
            payload: response.data
        })
    }
}

export const login = (user, redirectUrl) => async dispatch => {
    dispatch({
        type: LOGIN_REQUEST
    });
    let encPass = encryptedPassword(user.password);
    let sigPass = signedPassword(encPass);
    const response = await axios.post(`/api/users/log-in`, { ...user, password: encPass, passwordSign: sigPass });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: LOGIN_SUCCESS,
            payload: response.data
        });
        history.push(redirectUrl);
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: LOGIN_FAILURE,
            payload: response.data
        });
    }
}

export const logout = () => async dispatch => {
    dispatch({
        type: LOGOUT_REQUEST,
    });
    const response = await axios.post(`/api/users/log-out`);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: LOGOUT_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: LOGOUT_FAILURE,
            payload: response.data
        });
    }
}

export const signup = (user) => async dispatch => {
    dispatch({
        type: SIGNUP_REQUEST,
    });
    let encPass = encryptedPassword(user.password);
    let sigPass = signedPassword(encPass);
    const response = await axios.post(`/api/users/register`, { ...user, password: encPass, reEnterPassword: encPass, passwordSign: sigPass, reEnterPasswordSign: sigPass });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SIGNUP_SUCCESS,
            payload: response.data
        });
    }
    else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SIGNUP_FAILURE,
            payload: response.data
        });
    }
};

export const resendOTP = (obj) => async dispatch => {
    dispatch({
        type: OTP_RESEND_REQUEST
    });
    const response = await axios.post(`/api/users/register/otp-send-again`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: OTP_RESEND_SUCCESS,
            payload: response.data
        });
        toast.success("Verification Code has been sent again");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: OTP_RESEND_FAILURE,
            payload: response.data
        });
    }
}

export const verifyOTP = (user, from) => async dispatch => {
    dispatch({
        type: OTP_VERIFY_REQUEST
    });
    const { countryCode, phoneNumber, otp } = user;
    const response = await axios.post(`/api/users/register/otp`, { countryCode, phoneNumber, otp });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: OTP_VERIFY_SUCCESS,
            payload: response.data
        });
        dispatch({
            type: LOGIN_SUCCESS,
            payload: response.data
        });
        history.push('/register/success', {
            from: from,
            redirectedFrom: 'register'
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: OTP_VERIFY_FAILURE,
            payload: response.data
        });
    }
}

export const recoverAccount = (obj) => async dispatch => {
    dispatch({
        type: ACCOUNT_RECOVERY_REQUEST
    });
    const response = await axios.post(`/api/users/recover-password`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ACCOUNT_RECOVERY_SUCCESS,
            payload: response.data,
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ACCOUNT_RECOVERY_FAILURE,
            payload: response.data
        });
    }
}

export const resendRecoverAccountOTP = (obj) => async dispatch => {
    dispatch({
        type: ACCOUNT_RECOVERY_OTP_RESEND_REQUEST
    });
    const response = await axios.post(`/api/users/recover-password/otp-send-again`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ACCOUNT_RECOVERY_OTP_RESEND_SUCCESS,
            payload: response.data,
        });
        toast.success("Verification Code has been sent again");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ACCOUNT_RECOVERY_OTP_RESEND_FAILURE,
            payload: response.data
        });
    }
}

export const verifyRecoverAccountOTP = (obj) => async dispatch => {
    dispatch({
        type: ACCOUNT_RECOVERY_VERIFY_OTP_REQUEST
    });
    const response = await axios.post(`/api/users/recover-password/otp`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ACCOUNT_RECOVERY_VERIFY_OTP_SUCCESS,
            payload: response.data,
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ACCOUNT_RECOVERY_VERIFY_OTP_FAILURE,
            payload: response.data
        });
    }
}

export const setNewPassword = (obj) => async dispatch => {
    dispatch({
        type: ACCOUNT_RECOVERY_CHANGE_PASSWORD_REQUEST
    });
    let encNewPass = encryptedPassword(obj.newPassword);
    let sigNewPass = signedPassword(encNewPass);
    let encReEnterNewPass = encryptedPassword(obj.reEnterNewPassword);
    let sigReEnterNewPass = signedPassword(encReEnterNewPass);
    const response = await axios.post(`/api/users/recover-password/change-password`, { ...obj, newPassword: encNewPass, newPasswordSign: sigNewPass, reEnterNewPassword: encReEnterNewPass, reEnterNewPasswordSign: sigReEnterNewPass });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ACCOUNT_RECOVERY_CHANGE_PASSWORD_SUCCESS,
            payload: response.data,
        });
        dispatch({
            type: LOGIN_SUCCESS,
            payload: response.data
        });
        history.push('/recover-password/success', {
            from: obj.from,
            redirectedFrom: 'recover-password'
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ACCOUNT_RECOVERY_CHANGE_PASSWORD_FAILURE,
            payload: response.data
        });
    }
}

export const setActiveTab = (tabName) => dispatch => {
    dispatch({ type: USER_ACCOUNT_TAB, payload: tabName });
}