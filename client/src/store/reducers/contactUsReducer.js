import {
    CONTACT_US_REQUEST,
    CONTACT_US_SUCCESS,
    CONTACT_US_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case CONTACT_US_REQUEST:
            return { ...state };
        case CONTACT_US_SUCCESS:
            return { ...state, payload: action.payload };
        case CONTACT_US_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}