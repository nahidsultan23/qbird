import {
    ADD_TO_CART_REQUEST,
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    AUTH_CHECK_CART_REQUEST,
    AUTH_CHECK_CART_SUCCESS,
    AUTH_CHECK_CART_FAILURE,
    ADD_QUANTITY_TO_CART_REQUEST,
    ADD_QUANTITY_TO_CART_SUCCESS,
    ADD_QUANTITY_TO_CART_FAILURE,
    SUBTRACT_QUANTITY_FROM_CART_REQUEST,
    SUBTRACT_QUANTITY_FROM_CART_SUCCESS,
    SUBTRACT_QUANTITY_FROM_CART_FAILURE,
    REMOVE_FROM_CART_REQUEST,
    REMOVE_FROM_CART_SUCCESS,
    REMOVE_FROM_CART_FAILURE,
    UPDATE_CART_COUNT,
    CHECKOUT_REQUEST,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const addToCart = (obj) => async dispatch => {
    dispatch({
        type: ADD_TO_CART_REQUEST
    });
    const response = await axios.post('/api/shopping/cart', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ADD_TO_CART_SUCCESS,
            payload: response.data
        });
        dispatch({
            type: UPDATE_CART_COUNT,
            payload: response.data.cartItemNumber
        });
        toast.success("Added to your Cart");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ADD_TO_CART_FAILURE,
            payload: response.data
        });
    }
}

export const authCheckCart = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_CART_REQUEST
    });
    const response = await axios.post('/api/auth-check/cart', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_CART_SUCCESS,
            payload: response.data
        });

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });

        dispatch({
            type: UPDATE_CART_COUNT,
            payload: response.data.cartItemNumber
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AUTH_CHECK_CART_FAILURE,
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

export const addQuantityToCart = (obj) => async dispatch => {
    dispatch({
        type: ADD_QUANTITY_TO_CART_REQUEST
    });
    const response = await axios.post('/api/shopping/add-quantity-in-cart', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ADD_QUANTITY_TO_CART_SUCCESS,
            payload: response.data
        });

        dispatch({
            type: UPDATE_CART_COUNT,
            payload: response.data.cartItemNumber
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ADD_QUANTITY_TO_CART_FAILURE,
            payload: response.data
        })
    }
}

export const subtractQuantityFromCart = (obj) => async dispatch => {
    dispatch({
        type: SUBTRACT_QUANTITY_FROM_CART_REQUEST
    });
    const response = await axios.post('/api/shopping/subtract-quantity-from-cart', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SUBTRACT_QUANTITY_FROM_CART_SUCCESS,
            payload: response.data
        });

        dispatch({
            type: UPDATE_CART_COUNT,
            payload: response.data.cartItemNumber
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SUBTRACT_QUANTITY_FROM_CART_FAILURE,
            payload: response.data
        })
    }
}

export const removeFromCart = (obj) => async dispatch => {
    dispatch({
        type: REMOVE_FROM_CART_REQUEST
    });
    const response = await axios.post('/api/shopping/remove-from-cart', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: REMOVE_FROM_CART_SUCCESS,
            payload: response.data
        });
        
        dispatch({
            type: UPDATE_CART_COUNT,
            payload: response.data.cartItemNumber
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: REMOVE_FROM_CART_FAILURE,
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