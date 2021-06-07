import {
    SEARCH_RESULT_ADS_REQUEST,
    SEARCH_RESULT_ADS_SUCCESS,
    SEARCH_RESULT_ADS_FAILURE,
    SEARCH_RESULT_SHOPS_REQUEST,
    SEARCH_RESULT_SHOPS_SUCCESS,
    SEARCH_RESULT_SHOPS_FAILURE,
    SEARCH_RESULT_OF_SHOP_REQUEST,
    SEARCH_RESULT_OF_SHOP_SUCCESS,
    SEARCH_RESULT_OF_SHOP_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';

const CancelToken = axios.CancelToken;
let cancel;

export const searchResultAds = (obj) => async dispatch => {
    dispatch({
        type: SEARCH_RESULT_ADS_REQUEST,
    });
    cancel && cancel();
    const response = await axios.post(`/api/search/search-result/ads`, obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SEARCH_RESULT_ADS_SUCCESS,
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
    } else {
        dispatch({
            type: SEARCH_RESULT_ADS_FAILURE,
            payload: response.data
        });
    }
}

export const searchResultShops = (obj) => async dispatch => {
    dispatch({
        type: SEARCH_RESULT_SHOPS_REQUEST,
    });
    cancel && cancel();
    const response = await axios.post(`/api/search/search-result/shops`, obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SEARCH_RESULT_SHOPS_SUCCESS,
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
    } else {
        dispatch({
            type: SEARCH_RESULT_SHOPS_FAILURE,
            payload: response.data
        });
    }
}

export const searchResultOfShop = (obj) => async dispatch => {
    dispatch({
        type: SEARCH_RESULT_OF_SHOP_REQUEST,
    });
    cancel && cancel();
    const response = await axios.post(`/api/search/search-result-of-shop`, obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SEARCH_RESULT_OF_SHOP_SUCCESS,
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
    } else {
        dispatch({
            type: SEARCH_RESULT_OF_SHOP_FAILURE,
            payload: response.data
        });
    }
}