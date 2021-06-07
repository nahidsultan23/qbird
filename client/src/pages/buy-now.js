import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import { authCheckBuyNow, addQuantityInBuyNow, subtractQuantityFromBuyNow, checkout } from '../store/actions/buyNowActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png'
import Spinner from '../components/Common/Spinner';
import history from '../history';
import { truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators } from '../services/common';
import { bucketUrl } from '../constants/urls/bucket';

class BuyNow extends React.Component {

    _isMounted = false;

    state = {
        buyNowData: {},
        updatingBuyNowId: null,
        adID: null,
        showBuyNowErrorModal: false,
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
        const { match } = this.props;
        const { params } = match;
        const { adID } = params;
        this.setState(({ adID: adID }));
        this.props.authCheckBuyNow({ adID: adID }).then(() => {
            const { status, errorMessage } = this.props.buyNowData.payload;
            if(status === "success") {
                this.setState({
                    buyNowData: this.props.buyNowData.payload
                });
            }
            else {
                const { fatalError, authError, contentUnavailable } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError,
                        contentUnavailable: contentUnavailable
                    }
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    subtractQuantityFromBuyNow(id, quantity) {
        if (quantity === 1)
            return;
        this.setState({ updatingBuyNowId: id });
        this.props.subtractQuantityFromBuyNow({ quantity: 1, adID: id }).then(() => {
            this.setState({
                updatingBuyNowId: null
            });

            const { status, errorMessage } = this.props.buyNowData.payload;
            if(status === "success") {
                this.setState({
                    buyNowData: this.props.buyNowData.payload
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showBuyNowErrorModal: true,
                    buyNowErrorModalMessage: message
                });
            }
        });
    }

    addQuantityInBuyNow(id) {
        this.setState({ updatingBuyNowId: id });
        this.props.addQuantityInBuyNow({ quantity: 1, adID: id }).then(() => {
            this.setState({
                updatingBuyNowId: null
            });

            const { status, errorMessage } = this.props.buyNowData.payload;
            if(status === "success") {
                this.setState({
                    buyNowData: this.props.buyNowData.payload
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showBuyNowErrorModal: true,
                    buyNowErrorModalMessage: message
                });
            }
        });
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

    onCloseBuyNowErrorModal = () => {
        this.setState({ showBuyNowErrorModal: false });
    }

    renderOptions(options, buyNowErrorMessage) {
        return options.map(({ optionName, option }) => {
            return (<ul key={optionName}>
                <li style={buyNowErrorMessage ? {color: "red"} : {}}><strong>{truncate(optionName, 12)}</strong>: {truncate(option, 12)}</li>
            </ul>)
        })
    }

    checkout = () => {
        this.props.checkout({ from: 'buy-now' }).then(() => {
            const { status, errorMessage } = this.props.buyNowData.payload;
            if(this._isMounted) {
                if(status === "success") {
                    const { checkoutID, defaultAddress } = this.props.buyNowData.payload;
                    this.setState({ fatalErrorForm: null, authErrorForm: null });

                    if(defaultAddress) {
                        history.push('/checkout', { checkoutID: checkoutID });
                    }
                    else {
                        history.push('/user-address', { checkoutID: checkoutID });
                    }
                }
                else {
                    const { fatalError, authError } = errorMessage;
                    this.setState({
                        fatalErrorForm: fatalError,
                        authErrorForm: authError
                    });
                }
            }
        })
    }

    renderItem(buyNowData) {
        const { isFetchingBuyNow, isUpdatingBuyNow, isCheckingOut } = this.props;
        const { adID, updatingBuyNowId } = this.state;
        const { fatalErrorForm, authErrorForm } = this.state;
        if (!buyNowData.adName && !isFetchingBuyNow) {
            return (
                <div className="col-lg-12 col-md-12">
                    <p>Looks like you have no item in the Buy Now list. <Link className="display-inline" to={'/'}>Click here</Link> to continue shopping.</p>
                </div>
            );
        }
        else {
            const { adName, options, unitPrice, quantity, totalPrice, governmentCharge, extraCharge, otherCharges, netPrice, weight, netPayable, buyNowErrorMessage, photo } = buyNowData;
            return (
                <div className="col-lg-12 col-md-12" title={buyNowErrorMessage}>
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
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td className="product-thumbnail">
                                            <Link to={`/ad/${adID}`}>
                                                {this.renderImage(photo)}
                                            </Link>
                                        </td>
                                        <td className="product-name">
                                            <Link style={buyNowErrorMessage ? {color: "red"} : {}} to={`/ad/${adID}`}>{truncate(adName, 25)}</Link>
                                            {options && this.renderOptions(options, buyNowErrorMessage)}
                                        </td>
                                        <td className="product-price">
                                            <span className="unit-amount" style={buyNowErrorMessage ? {color: "red"} : {}}>
                                                {isUpdatingBuyNow && updatingBuyNowId !== null && updatingBuyNowId === adID ? <Spinner isLoading={isUpdatingBuyNow} /> : <span>{thousandSeparators(twoDecimalPoints(weight))} kg</span>}
                                            </span>
                                        </td>
                                        <td className="product-price">
                                            <span className="unit-amount" style={buyNowErrorMessage ? {color: "red"} : {}}>৳{thousandSeparators(twoDecimalPoints(unitPrice))}</span>
                                        </td>
                                        <td className="product-quantity" style={buyNowErrorMessage ? {color: "red"} : {}}>
                                            {isUpdatingBuyNow && updatingBuyNowId !== null && updatingBuyNowId === adID ? <Spinner isLoading={isUpdatingBuyNow} /> :
                                                <div className="input-counter">
                                                    <span className="minus-btn" onClick={() => this.subtractQuantityFromBuyNow(adID, quantity)}><i className="fas fa-minus"></i></span>
                                                    <input type="text" style={buyNowErrorMessage ? {color: "red"} : {}} readOnly value={quantity ? quantity : 1} />
                                                    <span className="plus-btn" onClick={() => this.addQuantityInBuyNow(adID)}><i className="fas fa-plus"></i></span>
                                                </div>}
                                        </td>
                                        <td className="product-subtotal">
                                            <span className="subtotal-amount" style={buyNowErrorMessage ? {color: "red"} : {}}>
                                                ৳{thousandSeparators(twoDecimalPoints(Number(otherCharges)))}
                                            </span>
                                        </td>
                                        <td className="product-subtotal">
                                            <span className="subtotal-amount" style={buyNowErrorMessage ? {color: "red"} : {}}>
                                                {isUpdatingBuyNow && updatingBuyNowId !== null && updatingBuyNowId === adID ? <Spinner isLoading={isUpdatingBuyNow} /> : '৳' + thousandSeparators(twoDecimalPoints(netPrice))}</span>
                                        </td>
                                    </tr>

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
                            <h3>Totals</h3>

                            <ul>
                                <li>Subtotal
                        {isUpdatingBuyNow ? <Spinner isLoading={isUpdatingBuyNow} /> : (
                                        <span>
                                            ৳
                                            {thousandSeparators(twoFixedDecimalPoints(totalPrice))}
                                        </span>
                                    )}
                                </li>
                                <li>Government Charge
                        {isUpdatingBuyNow ? <Spinner isLoading={isUpdatingBuyNow} /> : (
                                        <span>
                                            ৳
                                            {thousandSeparators(twoFixedDecimalPoints(governmentCharge))}
                                        </span>
                                    )}
                                </li>
                                <li>Extra Charge
                        {isUpdatingBuyNow ? <Spinner isLoading={isUpdatingBuyNow} /> : (
                                        <span>
                                            ৳
                                            {thousandSeparators(twoFixedDecimalPoints(extraCharge))}
                                        </span>
                                    )}
                                </li>
                                <li>Total
                        {isUpdatingBuyNow ? <Spinner isLoading={isUpdatingBuyNow} /> : (
                                        <span>
                                            ৳
                                            {thousandSeparators(twoFixedDecimalPoints(netPayable))}
                                        </span>
                                    )}
                                </li>
                            </ul>
                            <button type="button" disabled={isFetchingBuyNow || isUpdatingBuyNow || isCheckingOut} className="btn btn-light" onClick={this.checkout}><Spinner isLoading={isCheckingOut} /> &nbsp;Proceed to Checkout</button>
                            <div className="text-danger-div">
                                {(fatalErrorForm || authErrorForm) ? <span className="text-danger">{fatalErrorForm || authErrorForm}</span> : ''}
                            </div>
                        </div>
                    </form>
                </div>
            );
        }
    }

    render() {
        const { isFetchingBuyNow } = this.props;
        const { buyNowData } = this.state;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="cart-area ptb-60">
                    <div className="container">
                        <div className="section-title">
                            <h2><span className="dot"></span> Buy Now</h2>
                        </div>
                        {isFetchingBuyNow ? <React.Fragment><div className="row align-items-center">
                                <div className="col d-flex justify-content-center">
                                    <Spinner isLoading={isFetchingBuyNow} /> &nbsp;Fetching...
                                </div>
                            </div>
                        </React.Fragment> :
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                {buyNowData && this.renderItem(buyNowData)}
                            </div>
                        </div>}
                    </div>
                    <Modal
                        title="Error"
                        visible={this.state.showBuyNowErrorModal}
                        onClose={this.onCloseBuyNowErrorModal}
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
                                    onClick={this.onCloseBuyNowErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.buyNowErrorModalMessage}</b>
                    </Modal>
                </section>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingBuyNow: createLoadingSelector(['AUTH_CHECK_BUY_NOW'])(state),
        isUpdatingBuyNow: createLoadingSelector(['ADD_QUANTITY_IN_BUY_NOW', 'SUBTRACT_QUANTITY_FROM_BUY_NOW'])(state),
        isCheckingOut: createLoadingSelector(['CHECKOUT'])(state),
        buyNowData: state.buyNowData
    }
}

export default connect(mapStateToProps, { authCheckBuyNow, addQuantityInBuyNow, subtractQuantityFromBuyNow, checkout })(BuyNow);