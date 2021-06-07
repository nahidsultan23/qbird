import {
    FETCH_AD_REQUEST,
    FETCH_AD_SUCCESS,
    FETCH_AD_FAILURE,
    FETCH_SHOP_REQUEST,
    FETCH_SHOP_SUCCESS,
    FETCH_SHOP_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';

const CancelToken = axios.CancelToken;
let cancel;

export const fetchAd = (obj) => async dispatch => {
    dispatch({
        type: FETCH_AD_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/details/ad', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_AD_SUCCESS,
            payload: response.data
        });

        if(response.data.errorMessage.authError) {
            dispatch({
                type: USER_NOT_LOGGED_IN,
                payload: {}
            });
        }
        else {
            dispatch({
                type: USER_LOGGED_IN,
                payload: {
                    name: response.data.name,
                    cartItemNumber: response.data.cartItemNumber
                }
            });
        }
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: FETCH_AD_FAILURE,
            payload: response.data
        })
    }
}

export const fetchShop = (obj) => async dispatch => {
    dispatch({
        type: FETCH_SHOP_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/details/shop', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_SHOP_SUCCESS,
            payload: response.data
        });

        if(response.data.errorMessage.authError) {
            dispatch({
                type: USER_NOT_LOGGED_IN,
                payload: {}
            });
        }
        else {
            dispatch({
                type: USER_LOGGED_IN,
                payload: {
                    name: response.data.name,
                    cartItemNumber: response.data.cartItemNumber
                }
            });
        }
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: FETCH_SHOP_FAILURE,
            payload: response.data
        })
    }
}