import {
    FETCH_HOME_REQUEST,
    FETCH_HOME_SUCCESS,
    FETCH_HOME_FAILURE
} from '../actions/types';

// they are required for proper working of slider
const initialAds = [
    {
        itemID: '1',
        adID: '1',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '2',
        adID: '2',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '3',
        adID: '3',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '4',
        adID: '4',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '5',
        adID: '5',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '6',
        adID: '6',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '7',
        adID: '7',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
    {
        itemID: '8',
        adID: '8',
        adName: 'Fetching...',
        condition: '',
        'for': '',
        price: '',
        pricePer: '',
        description: '',
        rating: 0
    },
]

const initState = {
    payload: {
        topSlider: [],
        secondSlider: [],
        latest: initialAds,
        special: initialAds,
        featured: initialAds,
        spanA: [],
        spanB: [],
        spanC: [],
        trending: initialAds,
        bestseller: initialAds
    }
}

export default (state = initState, action) => {
    switch (action.type) {
        case FETCH_HOME_REQUEST:
            return { ...state };
        case FETCH_HOME_SUCCESS:
            return { ...state, payload: action.payload };
        case FETCH_HOME_FAILURE:
            return { ...state, payload: action.payload };
        default:
            return state;
    }
}