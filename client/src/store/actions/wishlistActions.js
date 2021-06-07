import {
    ADD_TO_WISHLIST_REQUEST,
    ADD_TO_WISHLIST_SUCCESS,
    ADD_TO_WISHLIST_FAILURE,
    AUTH_CHECK_WISHLIST_REQUEST,
    AUTH_CHECK_WISHLIST_SUCCESS,
    AUTH_CHECK_WISHLIST_FAILURE,
    REMOVE_FROM_WISHLIST_REQUEST,
    REMOVE_FROM_WISHLIST_SUCCESS,
    REMOVE_FROM_WISHLIST_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const addToWishlist = (obj) => async dispatch => {
    dispatch({
        type: ADD_TO_WISHLIST_REQUEST
    });
    const response = await axios.post('/api/shopping/wishlist', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ADD_TO_WISHLIST_SUCCESS,
            payload: response.data
        });
        toast.success("Added to your Wishlist");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ADD_TO_WISHLIST_FAILURE,
            payload: response.data
        })
    }
}

export const authCheckWishlist = (obj) => async dispatch => {
    dispatch({
        type: AUTH_CHECK_WISHLIST_REQUEST
    });
    const response = await axios.post('/api/auth-check/wishlist', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AUTH_CHECK_WISHLIST_SUCCESS,
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
            type: AUTH_CHECK_WISHLIST_FAILURE,
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

export const removeFromWishlist = (obj) => async dispatch => {
    dispatch({
        type: REMOVE_FROM_WISHLIST_REQUEST
    });
    const response = await axios.post('/api/shopping/remove-from-wishlist', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: REMOVE_FROM_WISHLIST_SUCCESS,
            payload: response.data
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: REMOVE_FROM_WISHLIST_FAILURE,
            payload: response.data
        })
    }
}