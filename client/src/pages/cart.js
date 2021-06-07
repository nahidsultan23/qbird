import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import { authCheckCart, addQuantityToCart, subtractQuantityFromCart, removeFromCart } from '../store/actions/cartActions';
import { checkout } from '../store/actions/cartActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png'
import Spinner from '../components/Common/Spinner';
import history from '../history';
import { truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { bucketUrl } from '../constants/urls/bucket';

class Cart extends React.Component {

    _isMounted = false;

    state = {
        photos: [],
        cartData: {},
        updatingCartId: null,
        deletingCartId: null,
        showDeleteModal: false,
        showCartErrorModal: false,
        showCheckoutErrorModal: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this._isMounted = true;
        this.props.authCheckCart().then((r) => {
            const { status, errorMessage } = this.props.cartData.payload;
            
            if(status === 'success') {
                this.setState({
                    cartData: this.props.cartData.payload
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

    componentWillUnmount() {
        this._isMounted = false;
    }

    subtractQuantityFromCart(id, quantity) {
        if (quantity === 1)
            return;
        this.setState({ updatingCartId: id });
        this.props.subtractQuantityFromCart({ quantity: 1, ID: id }).then((r) => {
            this.setState({
                updatingCartId: null
            });

            const { status, errorMessage } = this.props.cartData.payload;
            if(status === "success") {
                this.setState({
                    cartData: this.props.cartData.payload
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showCartErrorModal: true,
                    cartErrorModalMessage: message
                });
            }
        });
    }

    addQuantityToCart(id, quantity) {
        this.setState({ updatingCartId: id });
        this.props.addQuantityToCart({ quantity: 1, ID: id }).then((r) => {
            this.setState({
                updatingCartId: null
            });

            const { status, errorMessage } = this.props.cartData.payload;
            if(status === "success") {
                this.setState({
                    cartData: this.props.cartData.payload
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showCartErrorModal: true,
                    cartErrorModalMessage: message
                });
            }
        });
    }

    removeItem = () => {
        this.props.removeFromCart({ ID: this.state.deletingCartId }).then(() => {
            this.setState({
                deletingCartId: null,
                showDeleteModal: false
            });

            const { status, errorMessage } = this.props.cartData.payload;
            if(status === "success") {
                this.setState({
                    cartData: this.props.cartData.payload
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showCartErrorModal: true,
                    cartErrorModalMessage: message
                });
            }
        });
    }

    onCloseDeleteModal = () => {
        this.setState({ showDeleteModal: false, deletingCartId: null });
    }

    onCloseCartErrorModal = () => {
        this.setState({ showCartErrorModal: false });
    }

    onCloseCheckoutErrorModal = () => {
        this.setState({ showCheckoutErrorModal: false });
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

    renderOptions(options, cartErrorMessage) {
        return options.map(({ optionName, option, extraPrice }) => {
            return (<ul key={optionName}>
                <li style={cartErrorMessage ? {color: "red"} : {}}><strong>{truncate(optionName, 12)}</strong>: {truncate(option, 12)}</li>
            </ul>)
        })
    }

    renderErrorItems = (errorItems) => {
        return errorItems.map((errorItem) => {
            return (<div key={errorItem.adID} className="child-options">
                <span className="dot option-dot"></span>{errorItem.adName} ({errorItem.adID})
            </div>)
        })
    }

    renderCartErrorModalMessage = (errorMessage) => {
        return (
            <div className="checkout-error-message">
                <b>{errorMessage}</b>
            </div>
        )
    }

    renderCheckoutErrorModalMessage = (errorMessages) => {
        return errorMessages.map(({ errorItems, errorMessage }) => {
            return (
                <div key={errorMessage} className="checkout-error-message">
                    <b>{errorMessage}</b>
                    {this.renderErrorItems(errorItems)}
                </div>
            )
        });
    }

    checkout = () => {
        this.props.checkout({ from: 'cart' }).then(r => {
            const { status, errorMessage, errorMessages } = this.props.cartData.payload;
            if(status === "success") {
                const { checkoutID, defaultAddress } = this.props.cartData.payload;
                if(this._isMounted) {
                    this.setState({ fatalErrorForm: null, authErrorForm: null });
                    
                    if(defaultAddress) {
                        history.push('/checkout', { checkoutID: checkoutID });
                    }
                    else {
                        history.push('/user-address', { checkoutID: checkoutID });
                    }
                }
            }
            else {
                const { fatalError, authError } = errorMessage;
                this.setState({
                    fatalErrorForm: fatalError,
                    authErrorForm: authError
                });
                
                this.setState({
                    checkoutErrorModalMessage: errorMessages,
                    showCheckoutErrorModal: (fatalError || authError) ? false : true
                })
            }
        })
    }

    renderCartList = (cart) => {
        const { isUpdatingCart } = this.props;
        const { updatingCartId } = this.state;
        return cart.map(({ adName, adID, quantity, unitPrice, netPrice, id, options, governmentCharge, extraCharge, weight, cartErrorMessage, photo }) => {
            return (
                <tr key={id} title={cartErrorMessage}>
                    <td className="product-thumbnail">
                        <Link to={`/ad/${adID}`}>
                            {this.renderImage(photo)}
                        </Link>
                    </td>
                    <td className="product-name">
                        <Link style={cartErrorMessage ? {color: "red"} : {}} to={`/ad/${adID}`}>{truncate(adName, 25)}</Link>
                        {options && this.renderOptions(options, cartErrorMessage)}
                    </td>
                    <td className="product-price">
                        <span className="unit-amount" style={cartErrorMessage ? {color: "red"} : {}}>
                            {isUpdatingCart && updatingCartId !== null && updatingCartId === id ? <Spinner isLoading={isUpdatingCart} /> : <span>{thousandSeparators(twoDecimalPoints(weight))} kg</span>}
                        </span>
                    </td>
                    <td className="product-price">
                        <span className="unit-amount" style={cartErrorMessage ? {color: "red"} : {}}>৳{thousandSeparators(twoDecimalPoints(unitPrice))}</span>
                    </td>
                    <td className="product-quantity" style={cartErrorMessage ? {color: "red"} : {}}>
                        {isUpdatingCart && updatingCartId !== null && updatingCartId === id ? <Spinner isLoading={isUpdatingCart} /> :
                            <div className="input-counter">
                                <span className="minus-btn" onClick={() => this.subtractQuantityFromCart(id, quantity)}><i className="fas fa-minus"></i></span>
                                <input type="text" style={cartErrorMessage ? {color: "red"} : {}} readOnly value={quantity} />
                                <span className="plus-btn" onClick={() => this.addQuantityToCart(id, quantity)}><i className="fas fa-plus"></i></span>
                            </div>}
                    </td>
                    <td className="product-subtotal">
                        <span className="subtotal-amount" style={cartErrorMessage ? {color: "red"} : {}}>
                            {isUpdatingCart && updatingCartId !== null && updatingCartId === id ? <Spinner isLoading={isUpdatingCart} /> : '৳' + thousandSeparators(twoDecimalPoints(Number(extraCharge) + Number(governmentCharge)))}
                        </span>
                    </td>
                    <td className="product-subtotal">
                        <span className="subtotal-amount" style={cartErrorMessage ? {color: "red"} : {}}>
                            {isUpdatingCart && updatingCartId !== null && updatingCartId === id ? <Spinner isLoading={isUpdatingCart} /> : '৳' + thousandSeparators(twoDecimalPoints(netPrice))}
                        </span>
                    </td>
                    <td className="product-subtotal">
                        <span className="remove cursor-pointer" onClick={() => this.setState({ showDeleteModal: true, deletingCartId: id })}><i className="far fa-trash-alt"></i></span>
                    </td>
                </tr>
            )
        })
    }

    render() {
        const { cart, subtotal, totalGovernmentCharge, totalExtraCharge, netPayable, totalWeight } = this.state.cartData;
        const { isUpdatingCart, isFetchingCart, isCheckingOut, isRemovingItem } = this.props;
        const { fatalErrorForm, authErrorForm } = this.state;
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="cart-area ptb-60">
                    <div className="container">
                        <div className="section-title">
                            <h2><span className="dot"></span> Cart</h2>
                        </div>
                        {isFetchingCart ? <React.Fragment><div className="row align-items-center">
                                <div className="col d-flex justify-content-center">
                                    <Spinner isLoading={isFetchingCart} /> &nbsp;Fetching...
                                </div>
                            </div>
                        </React.Fragment> :
                        <div className="row">
                            {(cart && cart.length === 0 && !isFetchingCart) ?
                                <div className="col-lg-12 col-md-12">
                                    <p>Looks like you have no item in your Shopping Cart. <Link className="display-inline" to={'/'}>Click here</Link> to continue shopping.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12">
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered text-center">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Photo</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Weight</th>
                                                        <th scope="col">Unit Price</th>
                                                        <th scope="col">Quantity</th>
                                                        <th scope="col">Other Charges</th>
                                                        <th scope="col">Total</th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {cart && this.renderCartList(cart)}
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

                                        <div className="cart-totals">
                                            <h3>Cart Totals</h3>

                                            <ul className="total-weight-cart">
                                                <li>Total Weight
                                                    {isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : (
                                                        <span>{thousandSeparators(twoDecimalPoints(totalWeight))} kg - Kilogram</span>
                                                    )}
                                                </li>
                                            </ul>

                                            <ul>
                                                <li>Subtotal
                                                {isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : (
                                                        <span>
                                                            ৳
                                                            {cart && thousandSeparators(twoFixedDecimalPoints(subtotal))}
                                                        </span>
                                                    )}
                                                </li>
                                                <li>Government Charge
                                                {isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : (
                                                        <span>
                                                            ৳
                                                            {cart && thousandSeparators(twoFixedDecimalPoints(totalGovernmentCharge))}
                                                        </span>
                                                    )}
                                                </li>
                                                <li>Extra Charge
                                                {isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : (
                                                        <span>
                                                            ৳
                                                            {cart && thousandSeparators(twoFixedDecimalPoints(totalExtraCharge))}
                                                        </span>
                                                    )}
                                                </li>
                                                <li>Total
                                                {isUpdatingCart ? <Spinner isLoading={isUpdatingCart} /> : (
                                                        <span>
                                                            ৳
                                                            {thousandSeparators(twoFixedDecimalPoints(netPayable))}
                                                        </span>
                                                    )}
                                                </li>
                                            </ul>
                                            <button type="button" disabled={isFetchingCart || isUpdatingCart || isCheckingOut} className="btn btn-light" onClick={this.checkout}><Spinner isLoading={isCheckingOut} /> &nbsp;Proceed to Checkout</button>
                                            <div className="text-danger-div">
                                                {(fatalErrorForm || authErrorForm) ? <span className="text-danger">{fatalErrorForm || authErrorForm}</span> : ''}
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
                                    <Spinner isLoading={isRemovingItem} /> &nbsp;Remove
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to remove this item?
                    </Modal>
                    <Modal
                        title="Error"
                        visible={this.state.showCartErrorModal}
                        onClose={this.onCloseCartErrorModal}
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
                                    onClick={this.onCloseCartErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.cartErrorModalMessage}</b>
                    </Modal>
                    <Modal
                        title="Error"
                        visible={this.state.showCheckoutErrorModal}
                        onClose={this.onCloseCheckoutErrorModal}
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
                                    onClick={this.onCloseCheckoutErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        {this.state.checkoutErrorModalMessage && this.renderCheckoutErrorModalMessage(this.state.checkoutErrorModalMessage)}
                    </Modal>
                </section>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingCart: createLoadingSelector(['AUTH_CHECK_CART'])(state),
        isUpdatingCart: createLoadingSelector(['ADD_QUANTITY_TO_CART', 'SUBTRACT_QUANTITY_FROM_CART'])(state),
        isCheckingOut: createLoadingSelector(['CHECKOUT'])(state),
        isRemovingItem: createLoadingSelector(['REMOVE_FROM_CART'])(state),
        cartData: state.cartData
    }
}

export default connect(mapStateToProps, { authCheckCart, addQuantityToCart, subtractQuantityFromCart, removeFromCart, checkout })(Cart);