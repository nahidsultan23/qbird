import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import { authCheckWishlist, removeFromWishlist } from '../store/actions/wishlistActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png'
import { truncate, twoDecimalPoints, thousandSeparators } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import Spinner from '../components/Common/Spinner';
import { bucketUrl } from '../constants/urls/bucket';

class Wishlist extends React.Component {

    state = {
        wishlistData: {},
        deletingWishlistItemId: null,
        showDeleteModal: false,
        showCartErrorModal: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.authCheckWishlist().then((r) => {
            const { status, errorMessage } = this.props.wishlistData.payload;
            
            if(status === 'success') {
                this.setState({
                    wishlistData: this.props.wishlistData.payload
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError
                    }
                });
            }
        });
    }

    removeItem = () => {
        this.props.removeFromWishlist({ adID: this.state.deletingWishlistItemId }).then(() => {
            this.setState({
                deletingWishlistItemId: null,
                showDeleteModal: false
            });

            const { status, errorMessage } = this.props.wishlistData.payload;

            if(status === "success") {
                this.setState({
                    wishlistData: this.props.wishlistData.payload
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showWishlistErrorModal: true,
                    wishlistErrorModalMessage: message
                });
            }
        })
    }

    onCloseDeleteModal = () => {
        this.setState({ showDeleteModal: false, deletingWishlistItemId: null });
    }

    onCloseWishlistErrorModal = () => {
        this.setState({ showWishlistErrorModal: false });
    }

    renderImage = (photo) => {
        if (photo) {
            return (
                <img src={bucketUrl + "photos/photo-96/" + photo.replace("#","%23")} loading="lazy" alt="" />
            );
        } else {
            return (
                <img src={dummy} alt="" />
            );
        }
    }

    renderCartList = (cart) => {
        return cart.map(({ name, adID, shopID, shopName, price, pricePer, description, wishlistErrorMessage, photo }) => {
            return (
                <tr key={adID}>
                    <td className="product-thumbnail">
                        <Link to={`/ad/${adID}`}>
                            {this.renderImage(photo)}
                        </Link>
                    </td>
                    <td className="product-name">
                        <Link style={wishlistErrorMessage ? {color: "red"} : {}} to={`/ad/${adID}`}>{truncate(name, 25)}</Link>
                    </td>
                    <td className="product-name">
                        {shopID ? <Link style={wishlistErrorMessage ? {color: "red"} : {}} to={`/shop/${shopID}`}>{truncate(shopName, 25)}</Link> : ' - '}
                    </td>
                    <td className="product-price">
                        <span className="unit-amount" style={wishlistErrorMessage ? {color: "red"} : {}}>৳{thousandSeparators(twoDecimalPoints(price))}{pricePer && " / "+pricePer}</span>
                    </td>
                    <td className="product-subtotal">
                        <span className="subtotal-amount" style={wishlistErrorMessage ? {color: "red"} : {}}>{truncate(description, 30)}</span>
                    </td>
                    <td className="product-subtotal">
                        <span className="remove cursor-pointer" onClick={() => this.setState({ showDeleteModal: true, deletingWishlistItemId: adID })}><i className="far fa-trash-alt"></i></span>
                    </td>
                </tr>
            )
        })
    }

    render() {
        const { wishlist } = this.state.wishlistData;
        const { isFetchingWishlist } = this.props;
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="cart-area ptb-60">
                    <div className="container">
                        <div className="section-title">
                            <h2><span className="dot"></span> Wishlist</h2>
                        </div>
                        {isFetchingWishlist ? <React.Fragment><div className="row align-items-center">
                                <div className="col d-flex justify-content-center">
                                    <Spinner isLoading={isFetchingWishlist} /> &nbsp;Fetching...
                                </div>
                            </div>
                        </React.Fragment> :
                        <div className="row">
                            {(wishlist && wishlist.length === 0 && !isFetchingWishlist) ?
                                <div className="col-lg-12 col-md-12">
                                    <p> Looks like you have no item in your Wishlist. <Link className="display-inline" to={'/'}>Click here</Link> to continue shopping.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12">
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered text-center">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Photo</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Shop Name</th>
                                                        <th scope="col">Price</th>
                                                        <th scope="col">Description</th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {wishlist && this.renderCartList(wishlist)}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="cart-buttons">
                                            <div className="row align-items-center">
                                                <div className="col-lg-7 col-md-7">
                                                    <div className="continue-shopping-box">
                                                        <Link to={'/'} className="btn btn-light">Continue Shopping</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>}
                        </div>}
                    </div>
                    <Modal
                        title="Confirmation"
                        visible={this.state.showDeleteModal}
                        onOk={this.removeItem}
                        onClose={this.onCloseDeleteModal}
                        closable={true}
                        animation="slide-fade"
                        maskAnimation="fade"
                        footer={
                            [
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    key="close"
                                    onClick={this.onCloseDeleteModal}
                                >
                                    Keep
                                </button>,
                                <button
                                    type="button"
                                    className="btn btn-light modal-remove-button"
                                    key="save"
                                    onClick={this.removeItem}
                                >
                                    Remove
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to remove this item?
                    </Modal>
                    <Modal
                        title="Error"
                        visible={this.state.showWishlistErrorModal}
                        onClose={this.onCloseWishlistErrorModal}
                        closable={true}
                        className="word-break"
                        animation="slide-fade"
                        maskAnimation="fade"
                        footer={
                            [
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    key="close"
                                    onClick={this.onCloseWishlistErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.wishlistErrorModalMessage}</b>
                    </Modal>
                </section>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingWishlist: createLoadingSelector(['AUTH_CHECK_WISHLIST'])(state),
        wishlistData: state.wishlistData
    }
}

export default connect(mapStateToProps, { authCheckWishlist, removeFromWishlist })(Wishlist);