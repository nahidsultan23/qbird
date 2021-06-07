import {
    CONTACT_US_REQUEST,
    CONTACT_US_SUCCESS,
    CONTACT_US_FAILURE
} from '../actions/types';
import history from '../../history';

import axios from 'axios';

export const contactUs = (obj) => async dispatch => {
    dispatch({
        type: CONTACT_US_REQUEST,
    });
    const response = await axios.post(`/api/contact/contact-us`, obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CONTACT_US_SUCCESS,
            payload: response.data
        });
        history.push('/contact-us/success', {
            redirectedFrom: 'contact-us'
        });
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CONTACT_US_FAILURE,
            payload: response.data
        });
    }
}