import React from 'react'
import { connect } from 'react-redux';
import { Field, getFormValues, reduxForm } from 'redux-form';
import 'rc-dialog/assets/index.css';
import { Link } from 'react-router-dom';
import Modal from 'rc-dialog';

import { userAddressCalculations, placeOrder } from '../store/actions/checkoutActions';
import { userAddressDelete } from '../store/actions/userAddressActions';
import { fetchLocation } from '../store/actions/locationActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Map from '../components/Maps/Map';
import history from '../history';
import Spinner from '../components/Common/Spinner';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import renderSelect from '../constants/forms/renderSelect';
import { getDistanceFromKm, truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators, convertTimeFromSeconds } from '../services/common';

class Checkout extends React.Component {

    state = {
        checkoutID: null,
        address: [],
        checkoutData: {},
        userAddress: "",
        fatalErrorForm: null,
        showLocationErrorModal: false,
        showCheckoutErrorModal: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    userAddressCalculations = (checkoutID) => {
        this.props.userAddressCalculations({ checkoutID: checkoutID }).then(() => {
            const { status, errorMessage } = this.props.checkoutData.payload;

            const { address, newUnsavedAddress } = this.props.checkoutData.payload;
            let userAddress = "";
            let center = {};
            let addressID = "";
            let addressName = "";

            if(address || newUnsavedAddress) {
                let currentAddressIndex = address.findIndex(item => item.current === true);
                if(currentAddressIndex > -1) {
                    this.props.change("user-address", address[currentAddressIndex]._id);

                    addressID = address[currentAddressIndex]._id;
                    addressName = address[currentAddressIndex].addressName;
                    center = {
                        lat: address[currentAddressIndex].coordinate.lat,
                        lng: address[currentAddressIndex].coordinate.long
                    };
                    userAddress = address[currentAddressIndex].address;
                }
                else if(newUnsavedAddress) {
                    this.props.change("user-address", "");

                    addressName = "New Unsaved Address";
                    center = {
                        lat: newUnsavedAddress.coordinate.lat,
                        lng: newUnsavedAddress.coordinate.long
                    };
                    userAddress = newUnsavedAddress.address;
                }
                else if(address.length) {
                    this.props.change("user-address", address[0]._id);

                    addressID = address[0]._id;
                    addressName = address[0].name;
                    center = {
                        lat: address[0].coordinate.lat,
                        lng: address[0].coordinate.long
                    };
                    userAddress = address[0].address;
                }
            }

            if(status === "success") {
                this.setState({
                    checkoutData: this.props.checkoutData.payload,
                    address: address,
                    newUnsavedAddress: newUnsavedAddress,
                    center: center,
                    userAddress: userAddress,
                    currentAddressState: {
                        addressID: addressID,
                        addressName: addressName,
                        coordinate: center,
                        address: userAddress
                    }
                });
            }
            else {
                const { fatalError, authError, locationError } = errorMessage;
                this.setState({
                    address: address,
                    newUnsavedAddress: newUnsavedAddress,
                    center: center,
                    userAddress: userAddress,
                    currentAddressState: {
                        addressID: addressID,
                        addressName: addressName,
                        coordinate: center,
                        address: userAddress
                    },
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError,
                        locationError: locationError
                    }
                });

                if(locationError) {
                    this.setState({
                        showLocationErrorModal: true
                    })
                }
            }
        });
    }

    componentDidMount() {
        const { state } = this.props.location;
        if (!state || !state.checkoutID) {
            return history.replace('/cart');
        }
        const { checkoutID } = state;
        this.setState({ checkoutID: checkoutID });
        
        this.userAddressCalculations(checkoutID);
    }

    renderErrorItems = (errorItems) => {
        return errorItems.map((errorItem) => {
            return (<div key={errorItem.adID} className="child-options">
                <span className="dot option-dot"></span>{errorItem.adName} ({errorItem.adID})
            </div>)
        })
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

    onCloseCheckoutErrorModal = () => {
        this.setState({ showCheckoutErrorModal: false });
    }

    onCloseChargeDetails = () => {
        this.setState({ showChargeDetails: false });
    }

    showChargeDetails = (e, isFetchingUserAddressCalculations) => {
        e.preventDefault();
        if(!isFetchingUserAddressCalculations) {
            this.setState({
                showChargeDetails: true
            })
        }
    }

    onCloseLocationErrorModal = () => {
        this.setState({ showLocationErrorModal: false });
    }

    onUserAddressChange = (e) => {
        let addressID = e.target.value;
        let deleteAddressID = false;
        const { checkoutID, address, newUnsavedAddress } = this.state;

        if(addressID) {
            let currentAddressIndex = address.findIndex(item => item._id === addressID);
            if(currentAddressIndex > -1) {
                deleteAddressID = undefined;
                let currentCenter = {
                    lat: address[currentAddressIndex].coordinate.lat,
                    lng: address[currentAddressIndex].coordinate.long
                }
                this.setState({
                    center: currentCenter,
                    userAddress: address[currentAddressIndex].address,
                    currentAddressState: {
                        addressID: addressID,
                        addressName: address[currentAddressIndex].addressName,
                        coordinate: currentCenter,
                        address: address[currentAddressIndex].address
                    }
                })
            }
            else {
                return;
            }
        }
        else {
            if(newUnsavedAddress) {
                addressID = undefined;
                deleteAddressID = true;

                let currentCenter = {
                    lat: newUnsavedAddress.coordinate.lat,
                    lng: newUnsavedAddress.coordinate.long
                }
                this.setState({
                    center: currentCenter,
                    userAddress: newUnsavedAddress.address,
                    currentAddressState: {
                        addressID: addressID,
                        addressName: "New Unsaved Address",
                        coordinate: currentCenter,
                        address: newUnsavedAddress.address
                    }
                })
            }
            else {
                return;
            }
        }

        this.props.userAddressCalculations({ checkoutID: checkoutID, addressID: addressID, deleteAddressID: deleteAddressID }).then(() => {
            const { status, errorMessage } = this.props.checkoutData.payload;
            if(status === "success") {
                this.setState({
                    checkoutData: this.props.checkoutData.payload
                });
            }
            else {
                const { fatalError, authError, locationError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError,
                        locationError: locationError
                    }
                });

                if(locationError) {
                    this.setState({
                        showLocationErrorModal: true
                    })
                }
            }
        });
    }

    renderUserAddresses = () => {
        const { newUnsavedAddress } = this.state;
        let address = this.state.address;
        let arrangedAddresses = [];
        if(newUnsavedAddress) {
            newUnsavedAddress.addressName = "New Unsaved Address";
            newUnsavedAddress._id = "";
            arrangedAddresses.push(newUnsavedAddress);
        }

        if(address && address.length > 0) {
            arrangedAddresses = arrangedAddresses.concat(address);
        }

        return arrangedAddresses;
    }

    onCloseDeleteAddressModal = () => {
        this.setState({
            showDeleteAddressModal: false
        })
    }

    onYesDeleteAddressModal =() => {
        const { currentAddressState, checkoutID } = this.state;
        this.props.userAddressDelete({ addressID: (currentAddressState && currentAddressState.addressID) ? currentAddressState.addressID : "" }).then(() => {
            const { status, errorMessage } = this.props.userAddressData.payload;
            if(status === "success") {
                this.userAddressCalculations(checkoutID);
                
                this.setState({
                    showDeleteAddressModal: false,
                    address: [],
                    userAddress: "",
                    center: undefined
                })
            }
            else {
                const { fatalError, authError, locationError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError,
                        locationError: locationError
                    }
                });

                if(locationError) {
                    this.setState({
                        showLocationErrorModal: true
                    })
                }
            }
        });
    }

    onPlacesChanged = () => {
        // This is needed for the map to operate. Nothing needs to be written here.
    }

    changeNewShippingAddress = () => {
        const { checkoutID } = this.state;
        history.push('/user-address', { checkoutID: checkoutID });
    }

    showStoppages = (stoppages) => {
        return stoppages.map((c, index) => {
            let distance = (index === (stoppages.length - 1)) ? 0 : getDistanceFromKm(stoppages[index+1].distance);
            return (
                (index === (stoppages.length - 1)) ? null : <div key={index} className={((index === (stoppages.length - 2)) && (stoppages[index+1].distance > 10)) || ((index !== (stoppages.length - 2)) && (stoppages[index+1].distance > 5)) ? "word-break distance-exceeded" : "word-break"}>{c.stoppageName} - {stoppages[index+1].stoppageName} : {distance}</div>
            );
        })
    }

    onPlaceOrder = () => {
        const { checkoutID } = this.state;
        this.props.placeOrder({ checkoutID: checkoutID }).then(() => {
            const { status, errorMessage, errorMessages } = this.props.checkoutData.payload;
            if(status !== 'success') {
                const { fatalError, authError, locationError } = errorMessage;

                if(locationError) {
                    this.setState({
                        showLocationErrorModal: true,
                        locationError: locationError
                    })
                }
                else {
                    this.setState({
                        fatalErrorForm: fatalError,
                        authErrorForm: authError,
                        checkoutErrorModalMessage: errorMessages,
                        showCheckoutErrorModal: (fatalError || authError) ? false : true
                    })
                }
            }
        });
    }

    renderItems(checkout) {
        return checkout.map((c) => {
            const { id, adID, adName, quantity, price, checkoutErrorMessage } = c;
            return (
                <tr key={id} title={checkoutErrorMessage}>
                    <td className="product-name">
                        <Link style={checkoutErrorMessage ? {color: "red"} : {}} to={`/ad/${adID}`}>{truncate(adName, 25)}</Link>
                    </td>
                    <td className="product-total">
                        <span style={checkoutErrorMessage ? {color: "red"} : {}}>
                            {thousandSeparators(quantity)}
                        </span>
                    </td>
                    <td className="product-total">
                        <span className="subtotal-amount" style={checkoutErrorMessage ? {color: "red"} : {}}>৳{thousandSeparators(twoDecimalPoints(price))}</span>
                    </td>
                </tr>
            );
        })
    }

    render() {
        const { userAddress, checkoutID, currentAddressState } = this.state;
        const { name, phoneNumber, checkout, subtotal, extraDistanceCharge, extraWeightCharge, extraStoppageCharge, extraWaitingCharge, discount, totalPrice, shippingCharge, distance, deliveryTime, stoppages } = this.state.checkoutData;
        const { submitting, isFetchingUserAddressCalculations, isPlacingOrder, isDeletingUserAddress } = this.props;
        const { fatalErrorForm, authErrorForm } = this.state;
        const { fatalError, authError } = this.state.errorMessage;
        let expressDeliveryTime = convertTimeFromSeconds(deliveryTime);
        let totalShippingCharge = shippingCharge + (extraWeightCharge ? extraWeightCharge : 0) + (extraStoppageCharge ? extraStoppageCharge : 0) + (extraWaitingCharge ? extraWaitingCharge : 0) + (extraDistanceCharge ? extraDistanceCharge : 0);
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="checkout-area ptb-60">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="order-details checkout-order-details">
                                    <div className="order-table table-responsive">
                                        <div className="order-details-title">Your Order</div>
                                        <table className="table table-bordered text-center">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Quantity</th>
                                                    <th scope="col">Price</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {checkout && this.renderItems(checkout)}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="checkout">
                                    <div className="shipping-method">
                                        <div className="shipping-method-title">Shipping Method</div>
                                        <input type="radio" name="shipping-method" defaultChecked />
                                        <label>Express Shipping {isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : "( " + expressDeliveryTime + ")"}</label>
                                    </div>
                                </div>

                                <div className="checkout billing-method">
                                    <div className="shipping-method">
                                        <div className="payment-method-title">Payment Method</div>
                                        <input type="radio" name="payment-method" defaultChecked />
                                        <label htmlFor="direct-bank-transfer">Cash on Delivery</label>
                                    </div>
                                </div>
                                
                                <div className="cart-totals p-20 checkout-total">
                                    <h3>Grand Total {isFetchingUserAddressCalculations ? null : <Link to="/documentation/how-to-reduce-shipping-charges" className="too-much-charges-checkout display-inline">How to reduce charges?</Link>}</h3>
                                    <ul>
                                        <li>Subtotal<span>{isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : <span>৳{(subtotal && subtotal > 0) ? thousandSeparators(twoFixedDecimalPoints(subtotal)) : 0}</span>}</span></li>
                                        <li>Shipping Charge {(extraDistanceCharge || extraWeightCharge || extraStoppageCharge || extraWaitingCharge) ? <button className="checkout-shipping-charge-details-button" onClick={(e) => this.showChargeDetails(e, isFetchingUserAddressCalculations)}>?</button> : null}<span>{isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : <span>৳{(totalShippingCharge && totalShippingCharge > 0) ? thousandSeparators(twoFixedDecimalPoints(totalShippingCharge)) : 0}</span>}</span></li>
                                        {(discount && discount > 0) ? <li className="discount-checkout">Discount<span>{isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : <span className="discount-checkout">- ৳{thousandSeparators(twoFixedDecimalPoints(discount))}</span>}</span></li> : ''}
                                        <li>Total<span>{isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : <span>৳{(totalPrice && totalPrice) > 0 ? thousandSeparators(twoFixedDecimalPoints(totalPrice)) : 0}</span>}</span></li>
                                    </ul>
                                </div>
                                <div className="billing-method-gap-checkout"></div>
                                
                            </div>
                            
                            <div className="col-lg-6 col-md-12">
                                <div className="billing-details">
                                    <h3 className="shipping-address-title">Shipping Address Details</h3>

                                    <div className="row">
                                        <div className="col-lg-12 col-md-12">
                                            <strong>Receiver:</strong> {name}
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <strong>Contact No:</strong> {phoneNumber}
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <button type="submit" className="btn btn-primary change-shipping-address-btn" onClick={this.changeNewShippingAddress} disabled={submitting || isPlacingOrder}>Change to a new Shipping Address</button>
                                            <form className="user-address-select">
                                                <Field type="select" name="user-address" component={renderSelect} onChange={this.onUserAddressChange}>
                                                    {
                                                        this.renderUserAddresses() && this.renderUserAddresses().map((s) => <option key={s._id} value={s._id}>{s.addressName}</option>)
                                                    }
                                                </Field>
                                            </form>
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <div className="shipping-location-title"><label className="label mt-10"><strong>Shipping Location</strong></label></div>
                                            {currentAddressState && currentAddressState.addressName && !isFetchingUserAddressCalculations && <div className="shipping-location-modify">
                                                <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.setState({ showDeleteAddressModal: true })}><i className="far fa-trash-alt"></i></span>
                                                <Link className="float-right" to={{ pathname: "/edit-user-address", state: { checkoutID: checkoutID, addressID: currentAddressState ? currentAddressState.addressID : "", addressName: currentAddressState ? currentAddressState.addressName : "", coordinate: currentAddressState ? currentAddressState.coordinate : "", address: currentAddressState ? currentAddressState.address : "" } }} title="Edit Shipping Address"><i className="fa fa-pencil-alt"></i></Link>
                                            </div>}
                                        </div>
                                        {this.state.center && this.state.center.lat && this.state.center.lng && <div className="col-lg-12 col-md-12">
                                            <Map center={this.state.center} onPlacesChanged={this.onPlacesChanged} canMakeChanges={false} />
                                        </div>}
                                        <div className="col-lg-12 col-md-12">
                                            <label className="label mt-10 total-distance"><strong>Total Distance:</strong> {isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : getDistanceFromKm(distance)}</label>
                                        </div>
                                        <div className="col-lg-12 col-md-12 stoppages-area">
                                            <label className="label mt-10"><strong>Stoppages</strong></label>
                                            {isFetchingUserAddressCalculations ? <Spinner isLoading={isFetchingUserAddressCalculations} /> : stoppages && stoppages.length && this.showStoppages(stoppages)}
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <label className="label mt-10"><strong>Shipping Address</strong></label>
                                            <div className="word-break whitespace-pre-wrap">{userAddress}</div>
                                        </div>
                                        <div className="col-lg-12 col-md-12">
                                            <button type="submit" className="btn btn-primary order-btn place-order-button" onClick={this.onPlaceOrder} disabled={submitting || isFetchingUserAddressCalculations || isPlacingOrder}><Spinner isLoading={isPlacingOrder} /> &nbsp;Place Order</button>
                                            {(fatalErrorForm || authErrorForm) && <div className="text-danger-div">
                                                <span className="text-danger">{fatalErrorForm || authErrorForm}</span>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <Link key="return-to-cart" className="btn btn-primary" to="/cart">Return to Cart</Link>
                            ]
                        }
                    >
                        {this.state.checkoutErrorModalMessage && this.renderCheckoutErrorModalMessage(this.state.checkoutErrorModalMessage)}
                    </Modal>
                    <Modal
                        title="Confirmation"
                        visible={this.state.showDeleteAddressModal}
                        onClose={this.onCloseDeleteAddressModal}
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
                                    onClick={this.onCloseDeleteAddressModal}
                                >
                                    Cancel
                                </button>,
                                <button
                                    type="button"
                                    className="btn btn-light modal-remove-button"
                                    key="delete"
                                    onClick={this.onYesDeleteAddressModal}
                                >
                                    <Spinner isLoading={isDeletingUserAddress} /> &nbsp;Delete
                                </button>
                            ]
                        }
                    >
                        Do you really want to delete <b>{currentAddressState ? currentAddressState.addressName : "this address"}</b>?
                    </Modal>
                    <Modal
                        title="Error"
                        visible={this.state.showLocationErrorModal}
                        onClose={this.onCloseLocationErrorModal}
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
                                    onClick={this.onCloseLocationErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        {this.state.errorMessage.locationError}
                    </Modal>
                    <Modal
                        title="Shipping Charge Details"
                        visible={this.state.showChargeDetails}
                        onClose={this.onCloseChargeDetails}
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
                                    onClick={this.onCloseChargeDetails}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <table className="checkout-charge-details-table">
                            <tbody>
                                <tr>
                                    <td>Base Charge</td>
                                    <td>৳{(shippingCharge && shippingCharge > 0) ? thousandSeparators(twoFixedDecimalPoints(shippingCharge)) : 0}</td>
                                </tr>
                                {(extraWeightCharge && extraWeightCharge > 0) ? <tr>
                                    <td>Extra Weight Charge</td>
                                    <td>৳{thousandSeparators(twoFixedDecimalPoints(extraWeightCharge))}</td>
                                </tr> : null}
                                {(extraWaitingCharge && extraWaitingCharge > 0) ? <tr>
                                    <td>Extra Waiting Charge</td>
                                    <td>৳{thousandSeparators(twoFixedDecimalPoints(extraWaitingCharge))}</td>
                                </tr> : null}
                                {(extraStoppageCharge && extraStoppageCharge > 0) ? <tr>
                                    <td>Extra Stoppage Charge</td>
                                    <td>৳{thousandSeparators(twoFixedDecimalPoints(extraStoppageCharge))}</td>
                                </tr> : null}
                                {(extraDistanceCharge && extraDistanceCharge > 0) ? <tr>
                                    <td>Extra Distance Charge</td>
                                    <td>৳{thousandSeparators(twoFixedDecimalPoints(extraDistanceCharge))}</td>
                                </tr> : null}
                            </tbody>
                        </table>
                    </Modal>
                </section >}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('user-address-select')(state),
        isFetchingUserAddressCalculations: createLoadingSelector(['USER_ADDRESS_CALCULATIONS'])(state),
        isPlacingOrder: createLoadingSelector(['PLACE_ORDER'])(state),
        isDeletingUserAddress: createLoadingSelector(['USER_ADDRESS_DELETE'])(state),
        userAddressData: state.userAddressReducer,
        checkoutData: state.checkoutData
    }
}

Checkout = reduxForm({
    form: 'userAddressSelect',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(Checkout);

export default connect(mapStateToProps, { userAddressCalculations, placeOrder, fetchLocation, userAddressDelete })(Checkout);