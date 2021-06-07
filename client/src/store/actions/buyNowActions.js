import {
    BUY_NOW_REQUEST,
    BUY_NOW_SUCCESS,
    BUY_NOW_FAILURE,
    AUTH_CHECK_BUY_NOW_REQUEST,
    AUTH_CHECK_BUY_NOW_SUCCESS,
    AUTH_CHECK_BUY_NOW_FAILURE,
    ADD_QUANTITY_IN_BUY_NOW_REQUEST,
    ADD_QUANTITY_IN_BUY_NOW_SUCCESS,
    ADD_QUANTITY_IN_BUY_NOW_FAILURE,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_REQUEST,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_SUCCESS,
    SUBTRACT_QUANTITY_FROM_BUY_NOW_FAILURE,
    CHECKOUT_REQUEST,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';

export const buyNow = (obj) => async dispatch => {
    dispatch({
        type: BUY_NOW_REQUEST
    });
    const response = await axios.post('/api/shopping/buy-now', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: BUY_NOW_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: BUY_NOW_FAILURE,
            payload: response.data
        })
    }
}

export const authCheckBuyNow = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_BUY_NOW_REQUEST
    });
    const response = await axios.post('/api/auth-check/buy-now', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_BUY_NOW_SUCCESS,
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
            type: AUTH_CHECK_BUY_NOW_FAILURE,
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

export const addQuantityInBuyNow = (obj) => async dispatch => {
    dispatch({
        type: ADD_QUANTITY_IN_BUY_NOW_REQUEST
    });
    const response = await axios.post('/api/shopping/add-quantity-in-buy-now', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ADD_QUANTITY_IN_BUY_NOW_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ADD_QUANTITY_IN_BUY_NOW_FAILURE,
            payload: response.data
        })
    }
}

export const subtractQuantityFromBuyNow = (obj) => async dispatch => {
    dispatch({
        type: SUBTRACT_QUANTITY_FROM_BUY_NOW_REQUEST
    });
    const response = await axios.post('/api/shopping/subtract-quantity-from-buy-now', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SUBTRACT_QUANTITY_FROM_BUY_NOW_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SUBTRACT_QUANTITY_FROM_BUY_NOW_FAILURE,
            payload: response.data
        })
    }
}

export const checkout = (obj) => async dispatch => {
    dispatch({
        type: CHECKOUT_REQUEST
    });
    const response = await axios.post('/api/shopping/checkout', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECKOUT_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CHECKOUT_FAILURE,
            payload: response.data
        })
    }
}