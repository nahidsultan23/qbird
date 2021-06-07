import React from 'react';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';

import AuthorizedRoute from '../routes/AuthorizedRoute';

import Profile from './profile';
import Credentials from './credentials';
import Orders from './orders';
import AuthAds from './auth-ads';
import history from '../history';
import OrderDetails from './order-details';
import Sales from './sales';
import SaleDetails from './sale-details';
import Deliveries from './deliveries';
import Shops from './shops';
import IndividualAds from './individualAds';
import CreateAd from './create-ad';
import AuthAdDeatils from './auth-ad-details';
import CreateShop from './create-shop';
import CreateIndividualAd from './create-indi-ad';
import AttachAd from './attachAd';
import UpdateAd from './update-ad';
import AuthShopDetails from './auth-shop-details';
import AuthShopAds from './auth-shop-ads';
import DeliveryDetails from './delivery-details';
import DemoAds from './demo-ads';
import CreateDemoAd from './create-demo-ad';
import DemoAdsList from './demo-ads-list';
import DemoAdDetails from './demo-ad-details';
import Error from './error';

export class Account extends React.Component {

    state = {
        activeTab: 'profile'
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    openTabSection = (tabName, path) => {
        history.push(path);
        this.setState({ activeTab: tabName });
    }

    componentDidUpdate() {
        if(this.props.auth.tab) {
            if (this.props.auth.tab !== this.state.activeTab) {
                this.changeTab(this.props.auth.tab);
            }
    
            if((this.props.auth.tab === "profile") && (!document.getElementById(`profileLink`).className)) {
                document.getElementById(`profileLink`).className = "current";
            }
            else if((this.props.auth.tab !== "profile") && (document.getElementById(`profileLink`).className)) {
                document.getElementById(`profileLink`).className = "";
            }
        }
        else if(this.state.activeTab !== "profile") {
            this.changeTab("profile");
        }
    }

    changeTab = (tabName) => {
        let i, tabs, tablinks;
        tabs = ["profile", "credentials", "orders", "ads", "demoAds", "sales", "deliveries"];
        for (i = 0; i < tabs.length; i++) {
            let element = document.getElementById(tabs[i]);
            element.classList.remove("fadeInUp");
            element.style.display = "none";
        }
        tablinks = document.getElementsByTagName("li");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace("current", "");
        }
        if(document.getElementById(tabName)) {
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).className += " fadeInUp animated";
            document.getElementById(`${tabName}Link`).className += "current";
            this.setState({ activeTab: tabName });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="container-fluid">
                    <div className="tab products-details-tab mt-20">
                        <ul className="tabs">
                            <li id="profileLink"
                                onClick={() => { this.openTabSection('profile', '/account') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Profile
                                                   </span>
                            </li>

                            <li id="credentialsLink"
                                onClick={() => { this.openTabSection('credentials', '/account/credentials') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Credentials
                                                    </span>
                            </li>

                            <li id="ordersLink" onClick={() => { this.openTabSection('orders', '/account/orders') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Orders
                                                    </span>
                            </li>

                            <li id="adsLink"
                                onClick={() => { this.openTabSection('ads', '/account/ads') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Ads & Shops
                                                </span>
                            </li>

                            <li id="demoAdsLink"
                                onClick={() => { this.openTabSection('demoAds', '/account/demo-ads') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Demo Ads
                                                   </span>
                            </li>

                            <li id="salesLink"
                                onClick={() => { this.openTabSection('sales', '/account/sales') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Sales
                                                   </span>
                            </li>

                            <li id="deliveriesLink"
                                onClick={() => { this.openTabSection('deliveries', '/account/deliveries') }}>
                                <span className="tabs-nav-text">
                                    <div className="dot"></div> Deliveries
                                                   </span>
                            </li>
                        </ul>
                        <div className="tab_content">
                            <div id="profile" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account`} exact component={Profile} />
                                        <AuthorizedRoute path={`/account/*`} exact component={Error} />
                                    </Switch>
                                </div>
                            </div>

                            <div id="credentials" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account/credentials`} component={Credentials} />
                                    </Switch>
                                </div>
                            </div>

                            <div id="orders" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account/orders/details/:orderID`} component={OrderDetails} />
                                        <AuthorizedRoute path={`/account/orders`} component={Orders} />
                                    </Switch>
                                </div>
                            </div>

                            <div id="ads" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path='/account/ads/shops/:shopID/update-shop' component={CreateShop} />
                                        <AuthorizedRoute path='/account/ads/shops/:shopID/attach-ad' component={AttachAd} />
                                        <AuthorizedRoute path='/account/ads/individual-ads/create-ad' component={CreateIndividualAd} />
                                        <AuthorizedRoute path='/account/ads/shops/:shopID/ads' component={AuthShopAds} />
                                        <AuthorizedRoute path='/account/ads/shops/create-shop' component={CreateShop} />
                                        <AuthorizedRoute path='/account/ads/:adID/update-ad' component={UpdateAd} />
                                        <AuthorizedRoute path='/account/ads/individual-ads' component={IndividualAds} />
                                        <AuthorizedRoute path='/account/ads/shops/:shopID' component={AuthShopDetails} />
                                        <AuthorizedRoute path='/account/ads/shops' component={Shops} />
                                        <AuthorizedRoute path='/account/ads/:adID' component={AuthAdDeatils} />
                                        <AuthorizedRoute path='/account/create-ad' component={CreateAd} />
                                        <AuthorizedRoute path='/account/ads' component={AuthAds} />
                                    </Switch>

                                </div>
                            </div>

                            <div id="demoAds" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account/demo-ads/create`} component={CreateDemoAd} />
                                        <AuthorizedRoute path={`/account/demo-ads/add-to-account`} component={DemoAdsList} />
                                        <AuthorizedRoute path={`/account/demo-ads/:adID/update-demo-ad`} component={CreateDemoAd} />
                                        <AuthorizedRoute path={`/account/demo-ads/:adID`} component={DemoAdDetails} />
                                        <AuthorizedRoute path={`/account/demo-ads`} component={DemoAds} />
                                    </Switch>
                                </div>
                            </div>

                            <div id="sales" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account/sales/details/:saleID`} component={SaleDetails} />
                                        <AuthorizedRoute path={`/account/sales`} component={Sales} />
                                    </Switch>
                                </div>
                            </div>

                            <div id="deliveries" className="tabs_item">
                                <div className="products-details-tab-content">
                                    <Switch>
                                        <AuthorizedRoute path={`/account/deliveries/details/:deliveryID`} component={DeliveryDetails} />
                                        <AuthorizedRoute path={`/account/deliveries`} component={Deliveries} />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps)(Account);
