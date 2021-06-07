import {
    CHECK_AUTH_CREATE_AD_REQUEST,
    CHECK_AUTH_CREATE_AD_SUCCESS,
    CHECK_AUTH_CREATE_AD_FAILURE,
    CHECK_AUTH_UPDATE_AD_REQUEST,
    CHECK_AUTH_UPDATE_AD_SUCCESS,
    CHECK_AUTH_UPDATE_AD_FAILURE,
    CREATE_INDIVIDUAL_AD_REQUEST,
    CREATE_INDIVIDUAL_AD_SUCCESS,
    CREATE_INDIVIDUAL_AD_FAILURE,
    ATTACH_AD_REQUEST,
    ATTACH_AD_SUCCESS,
    ATTACH_AD_FAILURE,
    FETCH_ADS_REQUEST,
    FETCH_ADS_SUCCESS,
    FETCH_ADS_FAILURE,
    FETCH_INDIVIDUAL_ADS_REQUEST,
    FETCH_INDIVIDUAL_ADS_SUCCESS,
    FETCH_INDIVIDUAL_ADS_FAILURE,
    FETCH_SHOP_ADS_REQUEST,
    FETCH_SHOP_ADS_SUCCESS,
    FETCH_SHOP_ADS_FAILURE,
    FETCH_AUTH_AD_REQUEST,
    FETCH_AUTH_AD_SUCCESS,
    FETCH_AUTH_AD_FAILURE,
    TOGGLE_AD_STATUS_REQUEST,
    TOGGLE_AD_STATUS_SUCCESS,
    TOGGLE_AD_STATUS_FAILURE,
    AD_DELETE_REQUEST,
    AD_DELETE_SUCCESS,
    AD_DELETE_FAILURE,
    RATE_AD_REQUEST,
    RATE_AD_SUCCESS,
    RATE_AD_FAILURE,
    AD_COMMENT_REQUEST,
    AD_COMMENT_SUCCESS,
    AD_COMMENT_FAILURE,
    AD_REPLY_REQUEST,
    AD_REPLY_SUCCESS,
    AD_REPLY_FAILURE,
    AD_COMMENT_DELETE_REQUEST,
    AD_COMMENT_DELETE_SUCCESS,
    AD_COMMENT_DELETE_FAILURE,
    AD_REPLY_DELETE_REQUEST,
    AD_REPLY_DELETE_SUCCESS,
    AD_REPLY_DELETE_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

import history from '../../history';

const CancelToken = axios.CancelToken;
let cancel;

export const checkAuthCreateAd = (obj) => async dispatch => {
    dispatch({
        type: CHECK_AUTH_CREATE_AD_REQUEST
    });
    const response = await axios.post('/api/auth-check/create-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECK_AUTH_CREATE_AD_SUCCESS,
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
            type: CHECK_AUTH_CREATE_AD_FAILURE,
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

export const checkAuthUpdateAd = (obj) => async dispatch => {
    dispatch({
        type: CHECK_AUTH_UPDATE_AD_REQUEST
    });
    const response = await axios.post('/api/auth-check/update-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECK_AUTH_UPDATE_AD_SUCCESS,
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
            type: CHECK_AUTH_UPDATE_AD_FAILURE,
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

export const createIndividualAd = (obj) => async dispatch => {
    dispatch({
        type: CREATE_INDIVIDUAL_AD_REQUEST
    });
    const response = await axios.post('/api/ads/create-individual-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_SUCCESS,
            payload: response.data
        });
        history.push(`/account/ads/individual-ads`);
        toast.success("Individual Ad successfully created");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_FAILURE,
            payload: response.data
        })
    }
}

export const attachAd = (obj) => async dispatch => {
    dispatch({
        type: ATTACH_AD_REQUEST
    });
    const response = await axios.post('/api/ads/attach-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ATTACH_AD_SUCCESS,
            payload: response.data
        })
        history.push(`/account/ads/shops/${obj.urlName}/ads`);
        toast.success("Ad successfully attached");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ATTACH_AD_FAILURE,
            payload: response.data
        })
    }
}

export const createIndividualAdInCreateAd = (obj) => async dispatch => {
    dispatch({
        type: CREATE_INDIVIDUAL_AD_REQUEST
    });
    const response = await axios.post('/api/ads/create-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_SUCCESS,
            payload: response.data
        });
        history.push(`/account/ads`);
        toast.success("Individual Ad successfully created");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_FAILURE,
            payload: response.data
        })
    }
}

export const createShopAd = (obj) => async dispatch => {
    dispatch({
        type: ATTACH_AD_REQUEST
    });
    const response = await axios.post('/api/ads/create-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ATTACH_AD_SUCCESS,
            payload: response.data
        });
        history.push(`/account/ads`);
        toast.success("Shop Ad successfully created");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ATTACH_AD_FAILURE,
            payload: response.data
        })
    }
}

export const fetchAds = (obj) => async dispatch => {
    dispatch({
        type: FETCH_ADS_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/ads/all-ads', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_ADS_SUCCESS,
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
            type: FETCH_ADS_FAILURE,
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

export const fetchIndividualAds = (obj) => async dispatch => {
    dispatch({
        type: FETCH_INDIVIDUAL_ADS_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/ads/individual-ads', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_INDIVIDUAL_ADS_SUCCESS,
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
            type: FETCH_INDIVIDUAL_ADS_FAILURE,
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

export const fetchAuthShopAds = (obj) => async dispatch => {
    dispatch({
        type: FETCH_SHOP_ADS_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/ads/all-ads-of-account-shop', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    });
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_SHOP_ADS_SUCCESS,
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
            type: FETCH_SHOP_ADS_FAILURE,
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

export const fetchAd = (obj) => async dispatch => {
    dispatch({
        type: FETCH_AUTH_AD_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/ads/details', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_AUTH_AD_SUCCESS,
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
            type: FETCH_AUTH_AD_FAILURE,
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

export const toggleAdStatus = (obj) => async dispatch => {
    dispatch({
        type: TOGGLE_AD_STATUS_REQUEST
    });
    const response = await axios.post('/api/ads/toggle-available-status', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: TOGGLE_AD_STATUS_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: TOGGLE_AD_STATUS_FAILURE,
            payload: response.data
        })
    }
}

export const rateAd = (obj) => async dispatch => {
    dispatch({
        type: RATE_AD_REQUEST
    });
    const response = await axios.post('/api/rate/ad', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: RATE_AD_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: RATE_AD_FAILURE,
            payload: response.data
        })
    }
}

export const adComment = (obj) => async dispatch => {
    dispatch({
        type: AD_COMMENT_REQUEST
    });
    const response = await axios.post('/api/comment/ad', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_COMMENT_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_COMMENT_FAILURE,
            payload: response.data
        })
    }
}

export const adReply = (obj) => async dispatch => {
    dispatch({
        type: AD_REPLY_REQUEST
    });
    const response = await axios.post('/api/comment/reply/ad', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_REPLY_SUCCESS,
            payload: response.data,
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_REPLY_FAILURE,
            payload: response.data
        })
    }
}

export const adCommentDelete = (obj) => async dispatch => {
    dispatch({
        type: AD_COMMENT_DELETE_REQUEST
    });
    const response = await axios.post('/api/comment/delete-ad-comment', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_COMMENT_DELETE_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_COMMENT_DELETE_FAILURE,
            payload: response.data
        })
    }
}

export const adReplyDelete = (obj) => async dispatch => {
    dispatch({
        type: AD_REPLY_DELETE_REQUEST
    });
    const response = await axios.post('/api/comment/delete-ad-reply', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_REPLY_DELETE_SUCCESS,
            payload: response.data,
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_REPLY_DELETE_FAILURE,
            payload: response.data
        })
    }
}

export const updateIndividualAd = (obj) => async dispatch => {
    dispatch({
        type: CREATE_INDIVIDUAL_AD_REQUEST
    });
    const response = await axios.post('/api/ads/update-individual-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_SUCCESS,
            payload: response.data
        })
        history.push(`/account/ads/${obj.adID}`);
        toast.success("Individual Ad successfully updated");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_INDIVIDUAL_AD_FAILURE,
            payload: response.data
        })
    }
}

export const updateShopAd = (obj) => async dispatch => {
    dispatch({
        type: ATTACH_AD_REQUEST
    });
    const response = await axios.post('/api/ads/update-shop-ad', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: ATTACH_AD_SUCCESS,
            payload: response.data
        })
        history.push(`/account/ads/${obj.adID}`);
        toast.success("Shop Ad successfully updated");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: ATTACH_AD_FAILURE,
            payload: response.data
        })
    }
}

export const deleteAd = (obj) => async dispatch => {
    dispatch({
        type: AD_DELETE_REQUEST
    });
    const response = await axios.post('/api/ads/delete-ad', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: AD_DELETE_SUCCESS,
            payload: response.data,
        });
        history.push('/account/ads');
        toast.success("Ad successfully deleted");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: AD_DELETE_FAILURE,
            payload: response.data
        })
    }
}