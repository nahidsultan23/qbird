import {
    IMPOSE_NEW_CHANGES_REQUEST,
    IMPOSE_NEW_CHANGES_SUCCESS,
    IMPOSE_NEW_CHANGES_FAILURE
} from '../actions/types';

const initState = {}

export default (state = initState, action) => {
    switch (action.type) {
        case IMPOSE_NEW_CHANGES_REQUEST:
            return { ...state };
        case IMPOSE_NEW_CHANGES_SUCCESS:
            return { ...state, payload: action.payload };
        case IMPOSE_NEW_CHANGES_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}