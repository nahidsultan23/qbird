import {
    AUTH_CHECK_ORDERS_REQUEST,
    AUTH_CHECK_ORDERS_SUCCESS,
    AUTH_CHECK_ORDERS_FAILURE,
    FETCH_ORDER_DETAILS_REQUEST,
    FETCH_ORDER_DETAILS_SUCCESS,
    FETCH_ORDER_DETAILS_FAILURE,
    CANCEL_ORDER_REQUEST,
    CANCEL_ORDER_SUCCESS,
    CANCEL_ORDER_FAILURE,
    COMPLETE_ORDER_REQUEST,
    COMPLETE_ORDER_SUCCESS,
    COMPLETE_ORDER_FAILURE,
    RATE_ORDER_REQUEST,
    RATE_ORDER_SUCCESS,
    RATE_ORDER_FAILURE,
    ORDER_RATING_CLOSE_FOREVER_REQUEST,
    ORDER_RATING_CLOSE_FOREVER_SUCCESS,
    ORDER_RATING_CLOSE_FOREVER_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from '../actions/types';

import axios from 'axios';

export const authCheckOrders = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_ORDERS_REQUEST
    });
    const response = await axios.post(`/api/auth-check/all-orders`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_ORDERS_SUCCESS,
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
            type: AUTH_CHECK_ORDERS_FAILURE,
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

export const fetchOrderDetails = (obj) => async dispatch => {
    dispatch({
        type: FETCH_ORDER_DETAILS_REQUEST
    });
    const response = await axios.post(`/api/orders/details`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_ORDER_DETAILS_SUCCESS,
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
            type: FETCH_ORDER_DETAILS_FAILURE,
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

export const cancelOrder = (obj) => async dispatch => {
    dispatch({
        type: CANCEL_ORDER_REQUEST
    });
    const response = await axios.post(`/api/orders/cancel`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CANCEL_ORDER_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CANCEL_ORDER_FAILURE,
            payload: response.data
        });
    }
}

export const completeOrder = (obj) => async dispatch => {
    dispatch({
        type: COMPLETE_ORDER_REQUEST
    });
    const response = await axios.post(`/api/orders/complete-order`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: COMPLETE_ORDER_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: COMPLETE_ORDER_FAILURE,
            payload: response.data
        });
    }
}

export const rateOrder = (obj) => async dispatch => {
    dispatch({
        type: RATE_ORDER_REQUEST
    });
    const response = await axios.post(`/api/orders/rate`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: RATE_ORDER_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: RATE_ORDER_FAILURE,
            payload: response.data
        });
    }
}

export const closeRatingForever = (obj) => async dispatch => {
    dispatch({
        type: ORDER_RATING_CLOSE_FOREVER_REQUEST
    });
    const response = await axios.post(`/api/orders/never-rate`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ORDER_RATING_CLOSE_FOREVER_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ORDER_RATING_CLOSE_FOREVER_FAILURE,
            payload: response.data
        });
    }
}