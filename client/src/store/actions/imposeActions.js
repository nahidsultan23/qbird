import {
    IMPOSE_NEW_CHANGES_REQUEST,
    IMPOSE_NEW_CHANGES_SUCCESS,
    IMPOSE_NEW_CHANGES_FAILURE
} from '../actions/types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const imposeNewChanges = (obj) => async dispatch => {
    dispatch({
        type: IMPOSE_NEW_CHANGES_REQUEST
    });
    const response = await axios.post('/api/impose/impose-new-changes', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: IMPOSE_NEW_CHANGES_SUCCESS,
            payload: response.data
        });
        toast.success("New changes have been applied successfully");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: IMPOSE_NEW_CHANGES_FAILURE,
            payload: response.data
        });
    }
}