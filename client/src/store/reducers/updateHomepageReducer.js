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
    UPDATE_HOMEPAGE_BESTSELLERS_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case UPDATE_HOMEPAGE_TOP_SLIDER_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_TOP_SLIDER_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_TOP_SLIDER_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SECOND_SLIDER_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_SECOND_SLIDER_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SECOND_SLIDER_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_LATEST_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_LATEST_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_LATEST_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPECIAL_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_SPECIAL_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPECIAL_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_FEATURED_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_FEATURED_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_FEATURED_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANA_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_SPANA_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANA_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANB_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_SPANB_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANB_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANC_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_SPANC_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_SPANC_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_TRENDING_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_TRENDING_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_TRENDING_FAILURE:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_BESTSELLERS_REQUEST:
            return { ...state };
        case UPDATE_HOMEPAGE_BESTSELLERS_SUCCESS:
            return { ...state, payload: action.payload };
        case UPDATE_HOMEPAGE_BESTSELLERS_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}