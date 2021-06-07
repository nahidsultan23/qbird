import {
    AD_REPORT_REQUEST,
    AD_REPORT_SUCCESS,
    AD_REPORT_FAILURE,
    SHOP_REPORT_REQUEST,
    SHOP_REPORT_SUCCESS,
    SHOP_REPORT_FAILURE
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const reportAd = (obj) => async dispatch => {
    dispatch({
        type: AD_REPORT_REQUEST
    });
    const response = await axios.post(`/api/report/ad`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_REPORT_SUCCESS,
            payload: response.data
        });
        toast.success("Ad successfully reported");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_REPORT_FAILURE,
            payload: response.data
        });
    }
}

export const reportShop = (obj) => async dispatch => {
    dispatch({
        type: SHOP_REPORT_REQUEST
    });
    const response = await axios.post(`/api/report/shop`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_REPORT_SUCCESS,
            payload: response.data
        });
        toast.success("Shop successfully reported");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_REPORT_FAILURE,
            payload: response.data
        });
    }
}