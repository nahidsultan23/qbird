import {
    UPDATE_HOMEPAGE_TOP_SLIDER_REQUEST,
    UPDATE_HOMEPAGE_TOP_SLIDER_SUCCESS,
    UPDATE_HOMEPAGE_TOP_SLIDER_FAILURE,
    UPDATE_HOMEPAGE_SECOND_SLIDER_REQUEST,
    UPDATE_HOMEPAGE_SECOND_SLIDER_SUCCESS,
    UPDATE_HOMEPAGE_SECOND_SLIDER_FAILURE,
    UPDATE_HOMEPAGE_LATEST_REQUEST,
    UPDATE_HOMEPAGE_LATEST_SUCCESS,
    UPDATE_HOMEPAGE_LATEST_FAILURE,
    UPDATE_HOMEPAGE_SPECIAL_REQUEST,
    UPDATE_HOMEPAGE_SPECIAL_SUCCESS,
    UPDATE_HOMEPAGE_SPECIAL_FAILURE,
    UPDATE_HOMEPAGE_FEATURED_REQUEST,
    UPDATE_HOMEPAGE_FEATURED_SUCCESS,
    UPDATE_HOMEPAGE_FEATURED_FAILURE,
    UPDATE_HOMEPAGE_SPANA_REQUEST,
    UPDATE_HOMEPAGE_SPANA_SUCCESS,
    UPDATE_HOMEPAGE_SPANA_FAILURE,
    UPDATE_HOMEPAGE_SPANB_REQUEST,
    UPDATE_HOMEPAGE_SPANB_SUCCESS,
    UPDATE_HOMEPAGE_SPANB_FAILURE,
    UPDATE_HOMEPAGE_SPANC_REQUEST,
    UPDATE_HOMEPAGE_SPANC_SUCCESS,
    UPDATE_HOMEPAGE_SPANC_FAILURE,
    UPDATE_HOMEPAGE_TRENDING_REQUEST,
    UPDATE_HOMEPAGE_TRENDING_SUCCESS,
    UPDATE_HOMEPAGE_TRENDING_FAILURE,
    UPDATE_HOMEPAGE_BESTSELLERS_REQUEST,
    UPDATE_HOMEPAGE_BESTSELLERS_SUCCESS,
    UPDATE_HOMEPAGE_BESTSELLERS_FAILURE,
    USER_LOGGED_IN,
    USER_NOT_LOGGED_IN
} from './types';

import axios from 'axios';
import { toast } from 'react-toastify';

export const topSliderUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_TOP_SLIDER_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-top-slider', obj)
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_TOP_SLIDER_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Top Slider store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_TOP_SLIDER_FAILURE,
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

export const secondSliderUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_SECOND_SLIDER_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-second-slider', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_SECOND_SLIDER_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Second Slider store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_SECOND_SLIDER_FAILURE,
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

export const latestUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_LATEST_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-latest', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_LATEST_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Latest store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_LATEST_FAILURE,
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

export const specialUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_SPECIAL_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-special', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPECIAL_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Special store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPECIAL_FAILURE,
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

export const featuredUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_FEATURED_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-featured', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_FEATURED_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Featured store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_FEATURED_FAILURE,
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

export const spanAUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_SPANA_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-spanA', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANA_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Span A store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANA_FAILURE,
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

export const spanBUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_SPANB_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-spanB', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANB_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Span B store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANB_FAILURE,
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

export const spanCUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_SPANC_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-spanC', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANC_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Span C store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_SPANC_FAILURE,
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

export const trendingUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_TRENDING_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-trending', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_TRENDING_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Trending store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_TRENDING_FAILURE,
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

export const bestsellerUpdate = (obj) => async dispatch => {
    dispatch({
        type: UPDATE_HOMEPAGE_BESTSELLERS_REQUEST
    });
    const response = await axios.post('/api/admin/add-to-homepage-bestseller', obj);
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: UPDATE_HOMEPAGE_BESTSELLERS_SUCCESS,
            payload: response.data
        })

        dispatch({
            type: USER_LOGGED_IN,
            payload: {
                name: response.data.name,
                cartItemNumber: response.data.cartItemNumber
            }
        });
        toast.success("Item has been added successfully to the Best Sellers store");
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: UPDATE_HOMEPAGE_BESTSELLERS_FAILURE,
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