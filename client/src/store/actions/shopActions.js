import {
    FETCH_SHOPS_REQUEST,
    FETCH_SHOPS_SUCCESS,
    FETCH_SHOPS_FAILURE,
    FETCH_AUTH_SHOP_REQUEST,
    FETCH_AUTH_SHOP_SUCCESS,
    FETCH_AUTH_SHOP_FAILURE,
    TOGGLE_SHOP_STATUS_REQUEST,
    TOGGLE_SHOP_STATUS_SUCCESS,
    TOGGLE_SHOP_STATUS_FAILURE,
    TOGGLE_FORCE_OPEN_REQUEST,
    TOGGLE_FORCE_OPEN_SUCCESS,
    TOGGLE_FORCE_OPEN_FAILURE,
    RATE_SHOP_REQUEST,
    RATE_SHOP_SUCCESS,
    RATE_SHOP_FAILURE,
    SHOP_COMMENT_REQUEST,
    SHOP_COMMENT_SUCCESS,
    SHOP_COMMENT_FAILURE,
    SHOP_REPLY_REQUEST,
    SHOP_REPLY_SUCCESS,
    SHOP_REPLY_FAILURE,
    SHOP_COMMENT_DELETE_REQUEST,
    SHOP_COMMENT_DELETE_SUCCESS,
    SHOP_COMMENT_DELETE_FAILURE,
    SHOP_REPLY_DELETE_REQUEST,
    SHOP_REPLY_DELETE_SUCCESS,
    SHOP_REPLY_DELETE_FAILURE,
    CHECK_AUTH_UPDATE_SHOP_REQUEST,
    CHECK_AUTH_UPDATE_SHOP_SUCCESS,
    CHECK_AUTH_UPDATE_SHOP_FAILURE,
    CREATE_SHOP_REQUEST,
    CREATE_SHOP_SUCCESS,
    CREATE_SHOP_FAILURE,
    SHOP_DELETE_REQUEST,
    SHOP_DELETE_SUCCESS,
    SHOP_DELETE_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

import history from '../../history';

const CancelToken = axios.CancelToken;
let cancel;

export const fetchShops = (obj) => async dispatch => {
    dispatch({
        type: FETCH_SHOPS_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/shops/all-shops', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_SHOPS_SUCCESS,
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
            type: FETCH_SHOPS_FAILURE,
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

export const fetchAuthShop = (obj) => async dispatch => {
    dispatch({
        type: FETCH_AUTH_SHOP_REQUEST
    });
    cancel && cancel();
    const response = await axios.post('/api/shops/details', obj, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        })
    })
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: FETCH_AUTH_SHOP_SUCCESS,
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
            type: FETCH_AUTH_SHOP_FAILURE,
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

export const toggleShopStatus = (obj) => async dispatch => {
    dispatch({
        type: TOGGLE_SHOP_STATUS_REQUEST
    });
    const response = await axios.post('/api/shops/toggle-active-status', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: TOGGLE_SHOP_STATUS_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: TOGGLE_SHOP_STATUS_FAILURE,
            payload: response.data
        })
    }
}

export const toggleForceOpen = (obj) => async dispatch => {
    dispatch({
        type: TOGGLE_FORCE_OPEN_REQUEST
    });
    const response = await axios.post('/api/shops/toggle-force-open', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: TOGGLE_FORCE_OPEN_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: TOGGLE_FORCE_OPEN_FAILURE,
            payload: response.data
        })
    }
}

export const rateShop = (obj) => async dispatch => {
    dispatch({
        type: RATE_SHOP_REQUEST
    });
    const response = await axios.post('/api/rate/shop', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: RATE_SHOP_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: RATE_SHOP_FAILURE,
            payload: response.data
        })
    }
}

export const shopComment = (obj) => async dispatch => {
    dispatch({
        type: SHOP_COMMENT_REQUEST
    });
    const response = await axios.post('/api/comment/shop', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_COMMENT_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_COMMENT_FAILURE,
            payload: response.data
        })
    }
}

export const shopReply = (obj) => async dispatch => {
    dispatch({
        type: SHOP_REPLY_REQUEST
    });
    const response = await axios.post('/api/comment/reply/shop', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_REPLY_SUCCESS,
            payload: response.data,
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_REPLY_FAILURE,
            payload: response.data
        })
    }
}

export const shopCommentDelete = (obj) => async dispatch => {
    dispatch({
        type: SHOP_COMMENT_DELETE_REQUEST
    });
    const response = await axios.post('/api/comment/delete-shop-comment', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_COMMENT_DELETE_SUCCESS,
            payload: response.data
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_COMMENT_DELETE_FAILURE,
            payload: response.data
        })
    }
}

export const shopReplyDelete = (obj) => async dispatch => {
    dispatch({
        type: SHOP_REPLY_DELETE_REQUEST
    });
    const response = await axios.post('/api/comment/delete-shop-reply', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_REPLY_DELETE_SUCCESS,
            payload: response.data,
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_REPLY_DELETE_FAILURE,
            payload: response.data
        })
    }
}

export const checkAuthUpdateShop = (obj) => async dispatch => {
    dispatch({
        type: CHECK_AUTH_UPDATE_SHOP_REQUEST
    });
    const response = await axios.post('/api/auth-check/update-shop', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CHECK_AUTH_UPDATE_SHOP_SUCCESS,
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
            type: CHECK_AUTH_UPDATE_SHOP_FAILURE,
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

export const createShop = (obj) => async dispatch => {
    dispatch({
        type: CREATE_SHOP_REQUEST
    });
    const response = await axios.post('/api/shops/create-shop', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_SHOP_SUCCESS,
            payload: response.data
        });
        history.push('/account/ads/shops');
        toast.success("Shop successfully created");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_SHOP_FAILURE,
            payload: response.data
        })
    }
}

export const updateShop = (obj) => async dispatch => {
    dispatch({
        type: CREATE_SHOP_REQUEST
    });
    const response = await axios.post('/api/shops/update-shop', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: CREATE_SHOP_SUCCESS,
            payload: response.data
        });
        history.push(`/account/ads/shops/${obj.urlName}`);
        toast.success("Shop successfully updated");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: CREATE_SHOP_FAILURE,
            payload: response.data
        })
    }
}

export const deleteShop = (obj) => async dispatch => {
    dispatch({
        type: SHOP_DELETE_REQUEST
    });
    const response = await axios.post('/api/shops/delete-shop', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: SHOP_DELETE_SUCCESS,
            payload: response.data,
        });
        history.push('/account/ads/shops');
        toast.success("Shop successfully deleted");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: SHOP_DELETE_FAILURE,
            payload: response.data
        })
    }
}