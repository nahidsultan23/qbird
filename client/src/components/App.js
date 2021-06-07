import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { general } from '../store/actions/authActions';

import UnauthorizedRoute from '../routes/UnauthorizedRoute';
import AuthorizedRoute from '../routes/AuthorizedRoute';
import { RouteContainingProps } from '../routes/RouteContainingProps';
import history from '../history';

import Navbar from './Layout/Navbar';
import Footer from './Layout/Footer';
import AdBlockerDetect from './AdBlockerDetect/adBlockerDetect';
import Home from '../pages/home';
import SearchResult from '../pages/search-result';
import SearchResultOfShop from '../pages/search-result-of-shop';
import About from '../pages/about';
import ContactUs from '../pages/contact-us';
import MessageSendSuccess from '../pages/message-send-success';
import TermsAndConditions from '../pages/terms-and-conditions';
import PrivacyPolicy from '../pages/privacy-policy';
import Login from '../pages/login';
import Signup from '../pages/signup';
import RecoverAccount from '../pages/recoverAccount';
import RecoverAccountSuccess from '../pages/recoverAccountSuccess';
import SignupSuccess from '../pages/signup-success';
import Account from '../pages/account';
import AdDetails from '../pages/ad-details';
import ShopDetails from '../pages/shop-details';
import Cart from '../pages/cart';
import Wishlist from '../pages/wishlist';
import BuyNow from '../pages/buy-now';
import Checkout from '../pages/checkout';
import Documentation from '../pages/documentation';
import UpdateHomepage from '../pages/update-homepage';
import ImposeChanges from '../pages/impose-changes';
import UserAddress from '../pages/user-address';
import UserAddressEdit from '../pages/user-address-edit';
import DeliveryPersonStatus from '../pages/delivery-person-status';
import Error from '../pages/error';

class App extends React.Component {

    state = {
        categories: [],
        shopCategories: [],
        footerHeight: "360px"
    };

    updateFooterHeight() {
        let footerHeight = document.getElementById('footer-area').clientHeight;
        this.setState({
            footerHeight: footerHeight + "px"
        })
    }
    
    componentDidMount() {
        this.props.general().then(() => {
            this.setState({
                categories: this.props.auth.payload.categories,
                shopCategories: this.props.auth.payload.shopCategories
            })
        });

        this.updateFooterHeight();
        window.addEventListener("resize", this.updateFooterHeight.bind(this));

        const success = (position) => {
            const latitude = Number(position.coords.latitude);
            const longitude = Number(position.coords.longitude);
    
            localStorage.setItem('fetchLocation', 'success');
            localStorage.setItem('lat', latitude);
            localStorage.setItem('long', longitude);
        };
        
        const error = () => {
            const latitude = 23.810332;
            const longitude = 90.41251809999994;
    
            localStorage.setItem('lat', latitude);
            localStorage.setItem('long', longitude);
        };
        
        navigator.geolocation.getCurrentPosition(success, error);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateFooterHeight.bind(this));
    }
    

    render() {
        const { categories, shopCategories } = this.state;
        let extraProps = {
            categories: categories,
            shopCategories: shopCategories
        }
        return (
            <div className="app">
                <Router history={history}>
                    <div className="content-wrap" style={{ paddingBottom: this.state.footerHeight }}>
                        <Navbar categories={categories} />
                        <AdBlockerDetect />
                        <Switch>
                            <Route path="/" exact component={Home} />
                            <Route path="/home" component={Home} />
                            <Route path='/about-us' component={About} />
                            <Route path='/contact-us/success' component={MessageSendSuccess} />
                            <Route path='/contact-us' component={ContactUs} />
                            <Route path='/terms-&-conditions' component={TermsAndConditions} />
                            <Route path='/privacy-policy' component={PrivacyPolicy} />
                            <RouteContainingProps path='/search-result' component={SearchResult} extraProps={extraProps} />
                            <RouteContainingProps path='/search-result-of-shop' component={SearchResultOfShop} />
                            <Route path='/ad/:adID' component={AdDetails} />
                            <Route path='/shop/:shopID' component={ShopDetails} />
                            <UnauthorizedRoute path="/log-in" component={Login} />
                            <Route path='/register/success' component={SignupSuccess} />
                            <UnauthorizedRoute path="/register" component={Signup} />
                            <Route path='/recover-password/success' component={RecoverAccountSuccess} />
                            <UnauthorizedRoute path='/recover-password' component={RecoverAccount} />
                            <AuthorizedRoute path='/account' component={Account} />
                            <AuthorizedRoute path='/cart' component={Cart} />
                            <AuthorizedRoute path='/buy-now/:adID' component={BuyNow} />
                            <AuthorizedRoute path='/wishlist' component={Wishlist} />
                            <AuthorizedRoute path='/user-address' component={UserAddress} />
                            <AuthorizedRoute path='/edit-user-address' component={UserAddressEdit} />
                            <AuthorizedRoute path='/checkout' component={Checkout} />
                            <AuthorizedRoute path='/documentation' component={Documentation} />
                            <AuthorizedRoute path='/admin/update-homepage' component={UpdateHomepage} />
                            <AuthorizedRoute path='/admin/impose-changes' component={ImposeChanges} />
                            <AuthorizedRoute path='/admin/delivery-person-status' component={DeliveryPersonStatus} />
                            <Route path='*' component={Error} />
                        </Switch>
                    </div>
                    <Footer />
                </Router>
                <ToastContainer />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { auth: state.auth };
}

export default connect(mapStateToProps, { general })(App);