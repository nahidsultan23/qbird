import { combineReducers } from "redux";
import { reducer as formReducer } from 'redux-form';

import HomeReducers from './homeReducers';
import LocationReducer from "./locationReducer";
import ContactUsReducers from './contactUsReducer';
import AuthReducer from './authReducer';
import AdReducer from "./adReducer";
import DemoAdReducer from "./demoAdReducer";
import ShopReducer from "./shopReducer";
import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';
import userReducer from "./userReducer";
import imageReducer from './imageReducer';
import detailsReducer from './detailsReducer';
import cartReducer from './cartReducer';
import wishlistReducer from "./wishlistReducer";
import buyNowReducer from "./buyNowReducer";
import checkoutReducer from "./checkoutReducer";
import SearchResultReducer from "./searchResultReducer";
import OrderReducer from "./orderReducer";
import SaleReducer from "./saleReducer";
import DeliveryReducer from "./deliveryReducer";
import ReportReducer from "./reportReducer";
import UpdateHomepageReducer from "./updateHomepageReducer";
import UserAddressReducer from "./userAddressReducer";
import ImposeReducer from "./imposeReducer";
import DeliveryPersonStatusReducer from "./deliveryPersonStatusReducer";

export default combineReducers({
    form: formReducer,
    home: HomeReducers,
    locationReducer: LocationReducer,
    contactUs: ContactUsReducers,
    auth: AuthReducer,
    adReducer: AdReducer,
    demoAdReducer: DemoAdReducer,
    shopReducer: ShopReducer,
    loading: loadingReducer,
    user: userReducer,
    errorMessage: errorReducer,
    imageReducer: imageReducer,
    details: detailsReducer,
    cartData: cartReducer,
    wishlistData: wishlistReducer,
    buyNowData: buyNowReducer,
    checkoutData: checkoutReducer,
    searchResults: SearchResultReducer,
    orderReducer: OrderReducer,
    saleReducer: SaleReducer,
    deliveryReducer: DeliveryReducer,
    reportReducer: ReportReducer,
    updateHomepageReducer: UpdateHomepageReducer,
    userAddressReducer: UserAddressReducer,
    imposeReducer: ImposeReducer,
    deliveryPersonStatusReducer: DeliveryPersonStatusReducer
});