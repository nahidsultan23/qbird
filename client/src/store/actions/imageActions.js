import {
    PHOTO_UPLOAD_REQUEST,
    PHOTO_UPLOAD_UPDATE_PROGRESS,
    PHOTO_UPLOAD_SUCCESS,
    PHOTO_UPLOAD_FAILURE
} from './types';

import axios from 'axios';

export const createShopPhotoProgress = (file) => async dispatch => {
    dispatch({
        type: PHOTO_UPLOAD_REQUEST
    });
    const data = new FormData()
    data.append('myPhoto', file.myPhoto);
    data.append('type', file.type);
    data.append('clientPhotoID', file.clientPhotoID);
    data.append('localPhotoUrl', file.localPhotoUrl);
    const response = await axios.post('/api/photo/upload-photo', data,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                let progress = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                dispatch({
                    type: PHOTO_UPLOAD_UPDATE_PROGRESS,
                    payload: {
                        progress: progress,
                        id: file.clientPhotoID
                    }
                })
            }
        }
    );
    if (response.data && response.data.status === 'success') {
        dispatch({
            type: PHOTO_UPLOAD_SUCCESS,
            payload: {
                ...response.data,
                id: file.clientPhotoID
            }
        })
    } else if (response.data && response.data.status === 'failure') {
        dispatch({
            type: PHOTO_UPLOAD_FAILURE,
            payload: {
                ...response.data,
                id: file.clientPhotoID
            }
        })
    }
}