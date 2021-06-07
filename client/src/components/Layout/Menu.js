import React from 'react'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { logout } from '../../store/actions/authActions';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { truncate } from '../../services/common';
import logo from '../../img/logo.png';
import Spinner from '../Common/Spinner';
import SearchForm from './SearchForm';

class Menu extends React.Component {

    handleLogout = () => {
        this.props.logout();
    }

    renderUsername = ({ name }) => {
        let nameArray = name.split(" ");
        if(nameArray[0].length > 10) {
            return truncate(nameArray[0], 7);
        }
        else {
            return nameArray[0];
        }
    }

    renderButton = () => {
        const { isAuthenticated, payload } = this.props.auth;
        const { isUpdatingCart } = this.props;
        if (isAuthenticated) {
            return (
                <React.Fragment>
                    <div className="option-item nav-cart" title="Cart">
                        <Link className="cart-icon" to={'/cart'}><i className="fa fa-shopping-cart"></i>&nbsp;{isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : payload && payload.cartItemNumber}</Link>
                    </div>
                    <div className="option-item nav-wishlist" title="Wishlist">
                        <Link className="wishlist-icon" to={'/wishlist'}><i className="far fa-heart"></i></Link>
                    </div>
                    <div className="option-item">
                        <div className="dropdown">
                            <span className="dropdown-toggle cursor-pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Account"><i className="fa fa-user-circle"></i></span>
                            <div className="dropdown-menu left-auto logged-in-user-dropdown" aria-labelledby="dropdownMenuButton">
                                {payload && payload.name &&
                                    <Link to={'/account'} className="dropdown-item cursor-pointer" title="Account"><i className="fa fa-user-circle"></i> {this.renderUsername(payload)}</Link>}
                                <Link to={'/'} className="dropdown-item cursor-pointer" onClick={this.handleLogout} title="Logout"><i className="fa fa-sign-out-alt"></i> Logout</Link>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <div className="option-item nav-log-in">
                        <Link to={'/log-in'} className="login-icon cursor-pointer">Log In</Link>
                    </div>
                    <div className="option-item">|</div>
                    <div className="option-item nav-register">
                        <Link to={'/register'} className="register-icon cursor-pointer">Register</Link>
                    </div>
                </React.Fragment>
            )
        }
    }

    render() {
        const { categories } = this.props;
        return (
            <React.Fragment>
                <div className="navigation-bar">
                    <div className="nav-for-big-screen">
                        <div className="nav-logo-section">
                            <Link className="website-logo" to={'/'}><img src={logo} loading="lazy" alt="logo" /></Link>
                        </div>
                        <div className="nav-search-section">
                            <div className="nav-search-form-container">
                                <SearchForm categories={categories} />
                            </div>
                        </div>
                        <div className="nav-user-section">
                            {this.renderButton()}
                        </div>
                    </div>
                    <div className="nav-for-small-screen">
                        <div className="nav-logo-and-user-section-small-screen-div">
                            <div className="nav-logo-section">
                                <Link className="website-logo" to={'/'}><img src={logo} loading="lazy" alt="logo" /></Link>
                            </div>
                            <div className="nav-gap-between-logo-and-user-section"></div>
                            <div className="nav-user-section">
                                {this.renderButton()}
                            </div>
                        </div>
                        <div className="nav-search-section-small-screen-div">
                            <div className="nav-search-section">
                                <SearchForm categories={categories} />
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Menu = reduxForm({
    form: 'search-form',
    initialValues: {
        country: 'Bangladesh',
        language: 'English'
    }
})(Menu);

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        isUpdatingCart: createLoadingSelector(['ADD_TO_CART', 'ADD_QUANTITY_TO_CART', 'SUBTRACT_QUANTITY_FROM_CART'])(state)
    };
}

export default connect(mapStateToProps, { logout })(Menu);