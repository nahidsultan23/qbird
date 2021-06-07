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
    UPDATE_USER_PASSWORD_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';
import { encryptedPassword, signedPassword } from '../../services/nodeRSAService';

import axios from 'axios';
import { toast } from 'react-toastify';

export const accountDetails = (obj) => async dispatch => {
    dispatch({
        type: ACCOUNT_DETAILS_REQUEST
    });
    const response = await axios.post(`/api/account/details`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ACCOUNT_DETAILS_SUCCESS,
            payload: response.data
        });

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ACCOUNT_DETAILS_FAILURE,
            payload: response.data
        });

        if(response.data.errorMessage.authError) {
            dispatch({
                type: USER_NOT_LOGGED_IN,
                payload: {}
            });
        }
    }
}

export const updateUserDetails = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_USER_DETAILS_REQUEST
    });
    const response = await axios.post(`/api/account/update-details`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_USER_DETAILS_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_USER_DETAILS_FAILURE,
            payload: response.data
        });
    }
}

export const updateUserPhoto = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_USER_PHOTO_REQUEST
    });
    const response = await axios.post(`/api/account/update-photo`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_USER_PHOTO_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_USER_PHOTO_FAILURE,
            payload: response.data
        });
    }
}

export const updatePassword = (obj) => async dispatch => {
    let encPassword = encryptedPassword(obj.password);
    let signPassword = signedPassword(encPassword);
    let encNewPassword = encryptedPassword(obj.newPassword);
    let signNewPassword = signedPassword(encNewPassword);
    let encReEnterNewPassword = encryptedPassword(obj.reEnterNewPassword);
    let signReEnterNewPassword = signedPassword(encReEnterNewPassword);
    dispatch({
        type: UPDATE_USER_PASSWORD_REQUEST
    });
    const response = await axios.post(`/api/account/change-password`, {
        ...obj,
        password: encPassword,
        passwordSign: signPassword,
        newPassword: encNewPassword,
        newPasswordSign: signNewPassword,
        reEnterNewPassword: encReEnterNewPassword,
        reEnterNewPasswordSign: signReEnterNewPassword
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_USER_PASSWORD_SUCCESS,
            payload: response.data
        });
        toast.success("Password has been changed");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_USER_PASSWORD_FAILURE,
            payload: response.data
        });
    }
}