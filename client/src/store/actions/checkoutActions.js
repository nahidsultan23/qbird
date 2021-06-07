import {
    AUTH_CHECK_CHECKOUT_REQUEST,
    AUTH_CHECK_CHECKOUT_SUCCESS,
    AUTH_CHECK_CHECKOUT_FAILURE,
    USER_ADDRESS_CALCULATIONS_REQUEST,
    USER_ADDRESS_CALCULATIONS_SUCCESS,
    USER_ADDRESS_CALCULATIONS_FAILURE,
    PLACE_ORDER_REQUEST,
    PLACE_ORDER_SUCCESS,
    PLACE_ORDER_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import history from '../../history';
import { toast } from 'react-toastify';

export const authCheckCheckout = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_CHECKOUT_REQUEST
    });
    const response = await axios.post('/api/auth-check/checkout', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_CHECKOUT_SUCCESS,
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
            type: AUTH_CHECK_CHECKOUT_FAILURE,
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

export const userAddressCalculations = (obj) => async dispatch => {
    dispatch({
        type: USER_ADDRESS_CALCULATIONS_REQUEST
    });
    const response = await axios.post('/api/shopping/user-address-calculations', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: USER_ADDRESS_CALCULATIONS_SUCCESS,
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
            type: USER_ADDRESS_CALCULATIONS_FAILURE,
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

export const placeOrder = (obj) => async dispatch => {
    dispatch({
        type: PLACE_ORDER_REQUEST
    });
    const response = await axios.post('/api/shopping/place-order', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: PLACE_ORDER_SUCCESS,
            payload: response.data
        });
        history.push("/account/orders");
        toast.success("Order successfully placed");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: PLACE_ORDER_FAILURE,
            payload: response.data
        });
    }
}