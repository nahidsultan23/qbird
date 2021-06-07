import {
    PHOTO_UPLOAD_REQUEST,
    PHOTO_UPLOAD_UPDATE_PROGRESS,
    PHOTO_UPLOAD_SUCCESS,
    PHOTO_UPLOAD_FAILURE
} from '../actions/types';

const initState = {}

const imageReducer = (state = initState, action) => {
    switch (action.type) {
        case PHOTO_UPLOAD_REQUEST:
            return { ...state };
        case PHOTO_UPLOAD_UPDATE_PROGRESS:
            return { ...state, payload: { ...action.payload, done: 'onProgress' } }
        case PHOTO_UPLOAD_SUCCESS:
            return { ...state, payload: { ...action.payload, done: 'yes' } }
        case PHOTO_UPLOAD_FAILURE:
            return { ...state, payload: { ...action.payload, done: 'no' } }
        default:
            return state;
    }
}

export default imageReducer;