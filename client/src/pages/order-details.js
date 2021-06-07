import React from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import 'rc-dialog/assets/index.css';
import Modal from 'rc-dialog';

import { fetchOrderDetails, cancelOrder, completeOrder, rateOrder, closeRatingForever } from '../store/actions/orderActions';
import { connect } from 'react-redux';
import Spinner from '../components/Common/Spinner';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import searchingDeliveryPerson from '../img/searching-delivery-person/searching-delivery-person.gif';
import CancelOrder from '../components/Order/CancelOrder';
import NoContentFound from '../components/Common/NoContentFound';
import AccountTab from '../components/HOC/AccountTab';
import { truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import OrderRating from '../components/Common/OrderRating';
import DeliveryPersonRating from '../components/Common/DeliveryPersonRating';
import { bucketUrl } from '../constants/urls/bucket';

class OrderDetailsComp extends React.Component {

    state = {
        orderDetails: {},
        modalError: {},
        deliveryPersonPhoto: null,
        deliveryPersonPhoneNumberVisible: true,
        deliveryPersonRating: 0,
        cancelOrderId: null,
        cancelModalError: {},
        visible: false,
        orderID: null,
        showVerifyDeliveryModal: false,
        showErrorModal: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        const { match } = this.props;
        const { params } = match;
        const { orderID } = params;
        this.props.fetchOrderDetails({ orderID: orderID }).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if (status === 'success') {
                let orderDetails = this.props.orderData.payload;
                this.setState({ orderDetails: orderDetails, orderID: orderID });
                if(orderDetails.adsAndShops) {
                    let adsAndShops = [];
                    let i = 0;
                    while(orderDetails.adsAndShops[i]) {
                        adsAndShops.push({
                            type: orderDetails.adsAndShops[i].type,
                            itemID: orderDetails.adsAndShops[i].itemID,
                            rating: 0,
                            comment: ""
                        })
                        i++;
                    }

                    this.setState({
                        adsAndShops: adsAndShops
                    })
                }
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

    renderImage = (photo) => {
        if(photo) {
            return (
                <img src={bucketUrl + "photos/photo-96/" + photo.replace("#","%23")} loading="lazy" alt="" />
            );
        } else {
            return (
                <img src={dummy} alt="" />
            );
        }
    }

    renderDeliveryPersonPhoto = (photo) => {
        if (photo) {
            return (
                <img src={bucketUrl + "photos/photo-320/" + photo.replace("#","%23")} loading="lazy" alt="" />
            );
        } else {
            return (
                <img src={dummy} alt="" />
            );
        }
    }

    renderOptions(options, available) {
        return options.map(({ _id, optionName, option }) => {
            return (<ul key={_id}>
                <li style={available ? {} : {color: "red"}}><strong>{truncate(optionName, 12)}</strong>: {truncate(option, 12)}</li>
            </ul>)
        })
    }

    renderStateRecord(stateRecord) {
        var moment = require('moment');
        return stateRecord.map(({ _id, state, time }, index) => {
            return ((stateRecord[index+1] &&
                (moment(time).year() === moment(stateRecord[index+1].time).year()) &&
                (moment(time).month() === moment(stateRecord[index+1].time).month()) &&
                (moment(time).date() === moment(stateRecord[index+1].time).date())
                ) ? <li key={_id}>{state} <span><Moment format="hh:mm:ss a">{time}</Moment></span></li>
                : <li key={_id}>{state} <span><Moment format="MMM DD, YYYY, hh:mm:ss a">{time}</Moment></span></li>
            )
        })
    }

    onChangeDeliveryPersonRating = (rating) => {
        this.setState({
            deliveryPersonRating: rating
        })
    }

    onChangeDeliveryPersonComment = (e) => {
        this.setState({
            deliveryPersonComment: e.target.value
        })
    }

    onChangeRating = (type, itemID, rating) => {
        let index = this.state.adsAndShops.findIndex(p => ((p.type === type) && (p.itemID === itemID)));
        if(index > -1) {
            let adsAndShops = this.state.adsAndShops;
            adsAndShops[index] = {
                ...adsAndShops[index],
                rating: rating
            }

            this.setState({
                adsAndShops: adsAndShops
            })
        }
    }

    onChangeComment = (e, type, itemID) => {
        let index = this.state.adsAndShops.findIndex(p => ((p.type === type) && (p.itemID === itemID)));
        if(index > -1) {
            let adsAndShops = this.state.adsAndShops;
            adsAndShops[index] = {
                ...adsAndShops[index],
                comment: e.target.value
            }

            this.setState({
                adsAndShops: adsAndShops
            })
        }
    }

    onCloseRatingModal = () => {
        this.setState({
            orderDetails: {
                ...this.state.orderDetails,
                rateableByUser: false
            }
        })
    }

    onCloseForeverRatingModal = () => {
        const { orderID } = this.state;

        this.setState({
            orderDetails: {
                ...this.state.orderDetails,
                rateableByUser: false
            }
        })

        this.props.closeRatingForever({orderID: orderID});
    }

    submitRating = () => {
        const { orderID, adsAndShops, deliveryPersonRating, deliveryPersonComment } = this.state;
        const deliveryPerson = {
            rating: deliveryPersonRating,
            comment: deliveryPersonComment
        }

        this.props.rateOrder({orderID: orderID, adsAndShops: adsAndShops, deliveryPerson: deliveryPerson}).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
                this.setState({
                    orderDetails: {
                        ...this.state.orderDetails,
                        rateableByUser: false
                    }
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showErrorModal: true,
                    showVerifyDeliveryModal: false,
                    modalError: {
                        errorMessage: message
                    }
                })
            }
        });
    }

    renderAdsAndShopsRating = (adsAndShops) => {
        return adsAndShops.map(({ type, itemID, name }, index) => {
            return (
                <div className="order-details-name-rating-comment" key={index}>
                    <Link  className="word-break" to={(type === 'ad') ? `/ad/${itemID}` : `/shop/${itemID}`}><b>{name}</b></Link>
                    <div className="order-details-rating">
                        <OrderRating onChange={this.onChangeRating} rating={this.state.adsAndShops.find(p => ((p.type === type) && (p.itemID === itemID))).rating} type={type} itemID={itemID} />
                    </div>
                    <div className="comments-area">
                        <div className="comment-respond">
                            <textarea onChange={(e) => this.onChangeComment(e, type, itemID)} name="comment" placeholder="Comment (if you have any)" cols="45" rows="1" maxLength="2000"></textarea>
                        </div>
                    </div>
                </div>
            )
        });
    }
    
    renderOrderItem = (items) => {
        return items.map(({ _id, adID, available, adName, unitPrice, quantity, numberOfUnavailableQuantity, netPrice, governmentCharge, extraCharge, netWeight, options, photo, errorMessage }) => {
            return (
                <tr key={_id} title={errorMessage}>
                    <td className="product-thumbnail">
                        <Link to={`/ad/${adID}`}>
                            {this.renderImage(photo)}
                        </Link>
                    </td>
                    <td className="product-name">
                        <Link style={available ? {} : {color: "red"}} to={`/ad/${adID}`}>{adName}</Link>
                        {options && this.renderOptions(options, available)}
                    </td>
                    <td className="product-price">
                        <span className="unit-amount" style={available ? {} : {color: "red"}}>{thousandSeparators(twoDecimalPoints(netWeight))} kg</span>
                    </td>
                    <td className="product-price">
                        <span className="unit-amount" style={available ? {} : {color: "red"}}>৳{thousandSeparators(twoDecimalPoints(unitPrice))}</span>
                    </td>
                    <td className="product-quantity">
                        <span style={available ? {} : {color: "red"}}>{numberOfUnavailableQuantity ? thousandSeparators(quantity - numberOfUnavailableQuantity) + " of " + thousandSeparators(quantity) : thousandSeparators(quantity)}</span>
                    </td>
                    <td className="product-subtotal">
                        <span className="subtotal-amount" style={available ? {} : {color: "red"}}>
                            ৳{thousandSeparators(twoDecimalPoints(Number(extraCharge) + Number(governmentCharge)))}
                        </span>
                    </td>
                    <td className="product-subtotal">
                        <span className="subtotal-amount" style={available ? {} : {color: "red"}}>৳{thousandSeparators(twoDecimalPoints(netPrice))}</span>
                    </td>
                </tr>
            )
        })
    }

    onCancelOrder = (formValues) => {
        const { cancelOrderId } = this.state;
        const { reason } = formValues;
        this.props.cancelOrder({ orderID: cancelOrderId, reason: reason }).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
                let stateRecord = this.state.orderDetails.stateRecord.unshift({
                    _id: 'order_canceled',
                    state: 'Order Canceled',
                    time: Date()
                });
                this.setState({
                    orderDetails: {
                        ...this.state.orderDetails,
                        currentState: {
                            ...this.state.orderDetails.currentState,
                            state: 'Order Canceled'
                        },
                        reason: reason ? reason : "User's mind changed"
                    },
                    visible: false,
                    stateRecord: stateRecord
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    cancelModalError: {
                        errorMessage: message
                    }
                })
            }
        })
    }

    onClose = () => {
        this.setState({ visible: false, cancelOrderId: null });
    }

    onShow = (orderID) => {
        this.setState({ visible: true, cancelOrderId: orderID });
    }

    onVerifyDelivery = (orderID) => {
        this.setState({ showVerifyDeliveryModal: true });
    }

    onCloseVerifyModal = () => {
        this.setState({ showVerifyDeliveryModal: false });
    }

    verifyOrder = () => {
        const { orderID } = this.state;
        this.props.completeOrder({ orderID: orderID }).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
                let stateRecord = this.state.orderDetails.stateRecord.unshift({
                    _id: 'delivery_completed',
                    state: 'Delivery Completed',
                    time: Date()
                });
                this.setState({
                    orderDetails: {
                        ...this.state.orderDetails,
                        rateableByUser: true,
                        currentState: {
                            ...this.state.orderDetails.currentState,
                            state: 'Delivery Completed'
                        }
                    },
                    deliveryPersonPhoneNumberVisible: false,
                    showVerifyDeliveryModal: false,
                    stateRecord: stateRecord
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showErrorModal: true,
                    showVerifyDeliveryModal: false,
                    modalError: {
                        errorMessage: message
                    }
                })
            }
        })
    }

    onCloseErrorModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    render() {
        const { orderDetails, deliveryPersonPhoneNumberVisible } = this.state;
        const { items, totalWeight, subtotal, discount, netPayable, totalGovernmentCharge, totalExtraCharge, extraStoppageCharge, extraWeightCharge, extraWaitingCharge, address, coordinate, extraDistanceCharge, shippingCharge, currentState, stateRecord, deliveryPersonID, deliveryPersonName, deliveryPersonPhoneNumber, numberOfCompletedDeliveries, avgRating, numberOfRatings, reason, rateableByUser, adsAndShops, deliveryPersonPhoto } = orderDetails;
        const { orderID } = this.state;
        const { isFetchingOrderDetails, isCompletingOrder, isSubmittingRating } = this.props;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;

        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="cart-area">
                    {isFetchingOrderDetails ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingOrderDetails} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
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
                                                {items && this.renderOrderItem(items)}
                                            </tbody>
                                        </table>
                                    </div>
                                    {currentState && currentState.state === "Waiting for User Response" &&
                                    <div className="cart-totals">
                                        <ul className="order-details">
                                            <b>The Delivery Person has stated that this Order has been successfully delivered. We need a verification from you to mark this Order as "Complete".</b>
                                            <button title="Verify Delivery" type="button" className="btn complete-order-button complete-button-order-details" onClick={() => this.onVerifyDelivery()}>Verify Delivery</button>
                                        </ul>
                                    </div>}
                                    <div className="cart-totals">
                                        <div className="order-details-and-cancel-button">
                                            <h3 className="order-details-heading">Order Details</h3>
                                            <div className="cancel-button-order-details">
                                                {currentState && currentState.state === "Order Placed" ? <button title="Cancel Order" type="button" className="btn btn-danger btn-sm" onClick={() => this.onShow(orderID)}>Cancel Order</button> : ''}
                                            </div>
                                        </div>
                                        <ul className="order-details">
                                            <li>State <span>{currentState && currentState.state}</span></li>
                                            { reason ? <li className="word-break">Reason of Cancellation<span>{reason}</span></li> : ''}
                                            <li className="word-break whitespace-pre-wrap">Address<span>{address}</span></li>
                                            <li className="word-break">Location<span><a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate && coordinate.lat},${coordinate && coordinate.long}/@${coordinate && coordinate.lat},${coordinate && coordinate.long},17z`}>Check the Location on Google Map</a></span></li>
                                            <li>Total Weight<span>{thousandSeparators(twoDecimalPoints(totalWeight))} kg - Kilogram</span></li>
                                            <li>Shipping Method <span>Express Shipping</span></li>
                                            <li>Payment Method <span>Cash on Delivery</span></li>
                                            <li>Subtotal<span>৳{thousandSeparators(twoFixedDecimalPoints(subtotal))}</span></li>
                                            { totalGovernmentCharge ? <li>Government Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(totalGovernmentCharge))}</span></li> : ''}
                                            { totalExtraCharge ? <li>Extra Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(totalExtraCharge))}</span></li> : ''}
                                            <li>Shipping Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(shippingCharge + extraWeightCharge + extraWaitingCharge + extraStoppageCharge + extraDistanceCharge))}</span></li>
                                            {discount ? <li style={{color: "red"}}>Discount<span className="order-discount">- ৳{thousandSeparators(twoFixedDecimalPoints(discount))}</span></li> : ""}
                                            <li>Total<span>৳{thousandSeparators(twoFixedDecimalPoints(netPayable))}</span></li>
                                        </ul>
                                    </div>
                                    { (currentState && currentState.state === 'Order Placed') ? <div className="order-details-searching-delivery-person">
                                        <h3 className="order-details-heading">Searching for a Delivery Person</h3>
                                        <img src={searchingDeliveryPerson} loading="lazy" alt="" />
                                    </div> : ''}
                                    { deliveryPersonID ? <div className="cart-totals">
                                        <h3>Delivery Person Details</h3>
                                        <div className="delivery-person-photo text-center">{this.renderDeliveryPersonPhoto(deliveryPersonPhoto)}</div>
                                        <ul className="order-details">
                                            <li>Delivery Person <span>{deliveryPersonName}</span></li>
                                            { (deliveryPersonPhoneNumber && deliveryPersonPhoneNumberVisible) ? <li>Contact No <span>{deliveryPersonPhoneNumber}</span></li> : ''}
                                            <li>Number of Completed Deliveries <span>{thousandSeparators(numberOfCompletedDeliveries)}</span></li>
                                            <li>Rating <span>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)})</span></li>
                                        </ul>
                                    </div> : ''}
                                    
                                    <div className="cart-totals">
                                        <h3>Order State Records</h3>
                                        <ul className="order-details">
                                            {stateRecord && this.renderStateRecord(stateRecord)}
                                        </ul>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>}
                    {this.state.visible === true ? <CancelOrder onCancelOrder={this.onCancelOrder} onClose={this.onClose} errorMessage={this.state.cancelModalError.errorMessage} /> : ''}
                </section>}
                <Modal
                    title="Confirmation"
                    visible={this.state.showVerifyDeliveryModal}
                    onOk={this.verifyOrder}
                    onClose={this.onCloseVerifyModal}
                    closable={true}
                    animation="slide-fade"
                    maskAnimation="fade"
                    footer={
                        [
                            <button
                                type="button"
                                className="btn btn-light"
                                key="close"
                                onClick={this.onCloseVerifyModal}
                            >
                                Cancel
                            </button>,
                            <button
                                type="button"
                                className="btn complete-order-button modal-remove-button"
                                key="save"
                                onClick={this.verifyOrder}
                            >
                                <Spinner isLoading={isCompletingOrder} /> &nbsp;Confirm
                            </button>,
                        ]
                    }
                >
                    Are you sure you want to mark this Order as "Complete"? Confirm only if you have recieved the delivery successfully.
                </Modal>
                <Modal
                    title="Rate Order"
                    visible={rateableByUser}
                    onOk={this.submitRating}
                    onClose={this.onCloseRatingModal}
                    closable={true}
                    animation="slide-fade"
                    maskAnimation="fade"
                    footer={
                        [
                            <button
                                type="button"
                                className="btn btn-light close-forever-rating"
                                key="close-forever"
                                onClick={this.onCloseForeverRatingModal}
                            >
                                Never ask again for this Order
                            </button>,
                            <button
                                type="button"
                                className="btn btn-primary modal-remove-button"
                                key="save"
                                onClick={this.submitRating}
                            >
                                <Spinner isLoading={isSubmittingRating} /> &nbsp;Submit
                            </button>
                        ]
                    }
                >
                    {deliveryPersonID && <div>
                        <div className="word-break"><b><i className="delivery-person-title">Delivery Person</i> : {deliveryPersonName}</b></div>
                        <div className="order-details-rating">
                            <DeliveryPersonRating onChange={this.onChangeDeliveryPersonRating} rating={this.state.deliveryPersonRating} />
                        </div>
                        <div className="comments-area">
                            <div className="comment-respond">
                                <textarea onChange={(e) => this.onChangeDeliveryPersonComment(e)} name="comment" placeholder="Comment (if you have any)" cols="45" rows="1" maxLength="2000"></textarea>
                            </div>
                        </div>
                    </div>}
                    {this.state.adsAndShops && this.state.adsAndShops.length && this.renderAdsAndShopsRating(adsAndShops)}
                </Modal>
                <Modal
                    title="Error"
                    visible={this.state.showErrorModal}
                    onClose={this.onCloseErrorModal}
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
                                onClick={this.onCloseErrorModal}
                            >
                                OK
                            </button>
                        ]
                    }
                >
                    {this.state.modalError.errorMessage}
                </Modal>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingOrderDetails: createLoadingSelector(['FETCH_ORDER_DETAILS'])(state),
        isCompletingOrder: createLoadingSelector(['COMPLETE_ORDER'])(state),
        isSubmittingRating: createLoadingSelector(['RATE_ORDER'])(state),
        orderData: state.orderReducer
    }
}

const OrderDetails = AccountTab(OrderDetailsComp, 'orders');

export default connect(mapStateToProps, { fetchOrderDetails, cancelOrder, completeOrder, rateOrder, closeRatingForever })(OrderDetails);