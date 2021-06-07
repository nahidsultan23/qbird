import {
    FETCH_HOME_REQUEST,
    FETCH_HOME_SUCCESS,
    FETCH_HOME_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from '../actions/types';

import axios from 'axios';

export const fetchHome = () => async dispatch => {
    dispatch({
        type: FETCH_HOME_REQUEST,
    });
    const response = await axios.post(`/api/homepage/home`, {});
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_HOME_SUCCESS,
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
            type: FETCH_HOME_FAILURE,
            payload: response.data
        });
    }
}