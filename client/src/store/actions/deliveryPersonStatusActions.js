import {
    DELIVERY_PERSON_STATUS_REQUEST,
    DELIVERY_PERSON_STATUS_SUCCESS,
    DELIVERY_PERSON_STATUS_FAILURE,
    DELIVERY_PERSON_STATUS_CHANGE_REQUEST,
    DELIVERY_PERSON_STATUS_CHANGE_SUCCESS,
    DELIVERY_PERSON_STATUS_CHANGE_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const deliveryPersonStatus = (obj) => async dispatch => {
    dispatch({
        type: DELIVERY_PERSON_STATUS_REQUEST
    });
    const response = await axios.post('/api/admin/delivery-person-details', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: DELIVERY_PERSON_STATUS_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: DELIVERY_PERSON_STATUS_FAILURE,
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

export const deliveryPersonStatusChange = (obj) => async dispatch => {
    dispatch({
        type: DELIVERY_PERSON_STATUS_CHANGE_REQUEST
    });
    const response = await axios.post('/api/admin/delivery-person-change-status', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: DELIVERY_PERSON_STATUS_CHANGE_SUCCESS,
            payload: response.data
        })
        
        toast.success("Delivery Person info has been successfully updated");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: DELIVERY_PERSON_STATUS_CHANGE_FAILURE,
            payload: response.data
        })
    }
}