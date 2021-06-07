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
    USER_ADDRESS_DELETE_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const authCheckUserAddress = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_USER_ADDRESS_REQUEST
    });
    const response = await axios.post('/api/auth-check/user-address', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_USER_ADDRESS_SUCCESS,
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
            type: AUTH_CHECK_USER_ADDRESS_FAILURE,
            payload: response.data
        })

        if(response.data.errorMessage.authError) {
            dispatch({
                type: USER_NOT_LOGGED_IN,
                payload: {}
            });
        }
    }
}

export const userAddressSubmit = (obj) => async dispatch => {
    dispatch({
        type: USER_ADDRESS_SUBMIT_REQUEST
    });
    const response = await axios.post('/api/shopping/user-address', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: USER_ADDRESS_SUBMIT_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: USER_ADDRESS_SUBMIT_FAILURE,
            payload: response.data
        })
    }
}

export const authCheckEditUserAddress = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_EDIT_USER_ADDRESS_REQUEST
    });
    const response = await axios.post('/api/auth-check/edit-user-address', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_EDIT_USER_ADDRESS_SUCCESS,
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
            type: AUTH_CHECK_EDIT_USER_ADDRESS_FAILURE,
            payload: response.data
        })

        if(response.data.errorMessage.authError) {
            dispatch({
                type: USER_NOT_LOGGED_IN,
                payload: {}
            });
        }
    }
}

export const userAddressEditSubmit = (obj) => async dispatch => {
    dispatch({
        type: USER_ADDRESS_EDIT_SUBMIT_REQUEST
    });
    const response = await axios.post('/api/shopping/edit-user-address', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: USER_ADDRESS_EDIT_SUBMIT_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: USER_ADDRESS_EDIT_SUBMIT_FAILURE,
            payload: response.data
        })
    }
}

export const userAddressDelete = (obj) => async dispatch => {
    dispatch({
        type: USER_ADDRESS_DELETE_REQUEST
    });
    const response = await axios.post('/api/shopping/delete-user-address', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: USER_ADDRESS_DELETE_SUCCESS,
            payload: response.data
        });

        toast.success("Address was successfully deleted");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: USER_ADDRESS_DELETE_FAILURE,
            payload: response.data
        })
    }
}