import {
    AUTH_CHECK_DELIVERIES_REQUEST,
    AUTH_CHECK_DELIVERIES_SUCCESS,
    AUTH_CHECK_DELIVERIES_FAILURE,
    FETCH_DELIVERY_DETAILS_REQUEST,
    FETCH_DELIVERY_DETAILS_SUCCESS,
    FETCH_DELIVERY_DETAILS_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';

export const authCheckDeliveries = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_DELIVERIES_REQUEST
    });
    const response = await axios.post(`/api/auth-check/all-deliveries`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_DELIVERIES_SUCCESS,
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
            type: AUTH_CHECK_DELIVERIES_FAILURE,
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

export const fetchDeliveryDetails = (obj) => async dispatch => {
    dispatch({
        type: FETCH_DELIVERY_DETAILS_REQUEST
    });
    const response = await axios.post(`/api/deliveries/details`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_DELIVERY_DETAILS_SUCCESS,
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
            type: FETCH_DELIVERY_DETAILS_FAILURE,
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