import {
    FETCH_DEMO_ADS_REQUEST,
    FETCH_DEMO_ADS_SUCCESS,
    FETCH_DEMO_ADS_FAILURE,
    FETCH_DEMO_AD_REQUEST,
    FETCH_DEMO_AD_SUCCESS,
    FETCH_DEMO_AD_FAILURE,
    CHECK_AUTH_CREATE_DEMO_AD_REQUEST,
    CHECK_AUTH_CREATE_DEMO_AD_SUCCESS,
    CHECK_AUTH_CREATE_DEMO_AD_FAILURE,
    CREATE_DEMO_AD_REQUEST,
    CREATE_DEMO_AD_SUCCESS,
    CREATE_DEMO_AD_FAILURE,
    DEMO_AD_DELETE_REQUEST,
    DEMO_AD_DELETE_SUCCESS,
    DEMO_AD_DELETE_FAILURE,
    DEMO_AD_ADD_TO_LIST_REQUEST,
    DEMO_AD_ADD_TO_LIST_SUCCESS,
    DEMO_AD_ADD_TO_LIST_FAILURE,
    DEMO_AD_REMOVE_FROM_LIST_REQUEST,
    DEMO_AD_REMOVE_FROM_LIST_SUCCESS,
    DEMO_AD_REMOVE_FROM_LIST_FAILURE,
    FETCH_LISTED_DEMO_ADS_REQUEST,
    FETCH_LISTED_DEMO_ADS_SUCCESS,
    FETCH_LISTED_DEMO_ADS_FAILURE,
    ADD_DEMO_AD_TO_USER_ACCOUNT_REQUEST,
    ADD_DEMO_AD_TO_USER_ACCOUNT_SUCCESS,
    ADD_DEMO_AD_TO_USER_ACCOUNT_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

import history from '../../history';

export const fetchDemoAds = (obj) => async dispatch => {
    dispatch({
        type: FETCH_DEMO_ADS_REQUEST
    });
    const response = await axios.post('/api/auth-check/get-demo-ads', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_DEMO_ADS_SUCCESS,
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
            type: FETCH_DEMO_ADS_FAILURE,
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

export const fetchDemoAd = (obj) => async dispatch => {
    dispatch({
        type: FETCH_DEMO_AD_REQUEST
    });
    const response = await axios.post('/api/auth-check/get-demo-ad-details', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_DEMO_AD_SUCCESS,
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
            type: FETCH_DEMO_AD_FAILURE,
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

export const checkAuthCreateDemoAd = (obj) => async dispatch => {
    dispatch({
        type: CHECK_AUTH_CREATE_DEMO_AD_REQUEST
    });
    const response = await axios.post('/api/auth-check/create-demo-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECK_AUTH_CREATE_DEMO_AD_SUCCESS,
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
            type: CHECK_AUTH_CREATE_DEMO_AD_FAILURE,
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

export const createDemoAd = (obj) => async dispatch => {
    dispatch({
        type: CREATE_DEMO_AD_REQUEST
    });
    const response = await axios.post('/api/admin/create-demo-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_DEMO_AD_SUCCESS,
            payload: response.data
        })
        history.push(`/account/demo-ads`);
        toast.success("Demo Ad successfully created");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_DEMO_AD_FAILURE,
            payload: response.data
        })
    }
}

export const updateDemoAd = (obj) => async dispatch => {
    dispatch({
        type: CREATE_DEMO_AD_REQUEST
    });
    const response = await axios.post('/api/admin/update-demo-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_DEMO_AD_SUCCESS,
            payload: response.data
        })
        history.push(`/account/demo-ads/${obj.adID}`);
        toast.success("Demo Ad successfully updated");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_DEMO_AD_FAILURE,
            payload: response.data
        })
    }
}

export const deleteDemoAd = (obj) => async dispatch => {
    dispatch({
        type: DEMO_AD_DELETE_REQUEST
    });
    const response = await axios.post('/api/admin/delete-demo-ad', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: DEMO_AD_DELETE_SUCCESS,
            payload: response.data,
        });
        history.push('/account/demo-ads');
        toast.success("Demo Ad successfully deleted");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: DEMO_AD_DELETE_FAILURE,
            payload: response.data
        })
    }
}

export const addAdToList = (obj) => async dispatch => {
    dispatch({
        type: DEMO_AD_ADD_TO_LIST_REQUEST
    });
    const response = await axios.post('/api/admin/add-demo-ad-to-list', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: DEMO_AD_ADD_TO_LIST_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: DEMO_AD_ADD_TO_LIST_FAILURE,
            payload: response.data
        })
    }
}

export const removeAdFromList = (obj) => async dispatch => {
    dispatch({
        type: DEMO_AD_REMOVE_FROM_LIST_REQUEST
    });
    const response = await axios.post('/api/admin/remove-demo-ad-from-list', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: DEMO_AD_REMOVE_FROM_LIST_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: DEMO_AD_REMOVE_FROM_LIST_FAILURE,
            payload: response.data
        })
    }
}

export const getListedDemoAds = (obj) => async dispatch => {
    dispatch({
        type: FETCH_LISTED_DEMO_ADS_REQUEST
    });
    const response = await axios.post('/api/auth-check/get-listed-demo-ads', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_LISTED_DEMO_ADS_SUCCESS,
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
            type: FETCH_LISTED_DEMO_ADS_FAILURE,
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

export const addDemoAdToUserAccount = (obj) => async dispatch => {
    dispatch({
        type: ADD_DEMO_AD_TO_USER_ACCOUNT_REQUEST
    });
    const response = await axios.post('/api/admin/add-demo-ad-to-user-account', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ADD_DEMO_AD_TO_USER_ACCOUNT_SUCCESS,
            payload: response.data
        });
        toast.success("Demo Ad successfully attached");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ADD_DEMO_AD_TO_USER_ACCOUNT_FAILURE,
            payload: response.data
        })
    }
}