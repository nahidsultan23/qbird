import {
    AUTH_CHECK_SALES_REQUEST,
    AUTH_CHECK_SALES_SUCCESS,
    AUTH_CHECK_SALES_FAILURE,
    FETCH_SALE_DETAILS_REQUEST,
    FETCH_SALE_DETAILS_SUCCESS,
    FETCH_SALE_DETAILS_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';

export const authCheckSales = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_SALES_REQUEST
    });
    const response = await axios.post(`/api/auth-check/all-sales`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_SALES_SUCCESS,
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
            type: AUTH_CHECK_SALES_FAILURE,
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

export const fetchSaleDetails = (obj) => async dispatch => {
    dispatch({
        type: FETCH_SALE_DETAILS_REQUEST
    });
    const response = await axios.post(`/api/sales/details`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_SALE_DETAILS_SUCCESS,
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
            type: FETCH_SALE_DETAILS_FAILURE,
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