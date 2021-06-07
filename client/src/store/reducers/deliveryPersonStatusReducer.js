import {
    DELIVERY_PERSON_STATUS_REQUEST,
    DELIVERY_PERSON_STATUS_SUCCESS,
    DELIVERY_PERSON_STATUS_FAILURE,
    DELIVERY_PERSON_STATUS_CHANGE_REQUEST,
    DELIVERY_PERSON_STATUS_CHANGE_SUCCESS,
    DELIVERY_PERSON_STATUS_CHANGE_FAILURE
} from "../actions/types";

const initState = {};

export default (state = initState, action) => {
    switch (action.type) {
        case DELIVERY_PERSON_STATUS_REQUEST:
            return { ...state };
        case DELIVERY_PERSON_STATUS_SUCCESS:
            return { ...state, payload: action.payload };
        case DELIVERY_PERSON_STATUS_FAILURE:
            return { ...state, payload: action.payload };
        case DELIVERY_PERSON_STATUS_CHANGE_REQUEST:
            return { ...state };
        case DELIVERY_PERSON_STATUS_CHANGE_SUCCESS:
            return { ...state, payload: action.payload };
        case DELIVERY_PERSON_STATUS_CHANGE_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}