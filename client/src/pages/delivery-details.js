import React from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import 'rc-dialog/assets/index.css';

import { fetchDeliveryDetails } from '../store/actions/deliveryActions';
import { connect } from 'react-redux';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import NoContentFound from '../components/Common/NoContentFound';
import AccountTab from '../components/HOC/AccountTab';
import { truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { bucketUrl } from '../constants/urls/bucket';

class DeliveryDetailsComp extends React.Component {

    state = {
        deliveryDetails: {},
        deliveryID: null,
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
        const { deliveryID } = params;
        this.props.fetchDeliveryDetails({ deliveryID: deliveryID }).then(() => {
            const { status, errorMessage } = this.props.deliveriesData.payload;

            if(status === 'success') {
                this.setState({ deliveryDetails: this.props.deliveriesData.payload, deliveryID: deliveryID });
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

    renderUserPhoto = (photo) => {
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
    
    renderDeliveryItem = (items) => {
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

    render() {
        const { deliveryDetails } = this.state;
        const { items, totalWeight, subtotal, netPayable, totalGovernmentCharge, totalExtraCharge, address, coordinate, shippingCharge, qbirdCharge, waiver, currentState, stateRecord, userName, userPhoneNumber, numberOfCompletedOrders, avgRating, numberOfRatings, reason, userPhoto } = deliveryDetails;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { isFetchingDeliveryDetails } = this.props;

        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="cart-area">
                    {isFetchingDeliveryDetails ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingDeliveryDetails} /> &nbsp;Fetching...
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
                                                {items && this.renderDeliveryItem(items)}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="cart-totals">
                                        <div className="order-details-and-cancel-button">
                                            <h3 className="order-details-heading">Delivery Details</h3>
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
                                            <li>Shipping Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(shippingCharge))}</span></li>
                                            <li>Qbird Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(qbirdCharge))}</span></li>
                                            {waiver ? <li style={{color: "red"}}>Waiver<span className="order-discount">- ৳{thousandSeparators(twoFixedDecimalPoints(waiver))}</span></li> : null}
                                            <li>Total<span>৳{thousandSeparators(twoFixedDecimalPoints(netPayable))}</span></li>
                                        </ul>
                                    </div>
                                    <div className="cart-totals">
                                        <h3>User Details</h3>
                                        <div className="delivery-person-photo text-center">{this.renderUserPhoto(userPhoto)}</div>
                                        <ul className="order-details">
                                            <li>User <span>{userName}</span></li>
                                            { userPhoneNumber ? <li>Contact No <span>{userPhoneNumber}</span></li> : ''}
                                            <li>Number of Completed Orders <span>{thousandSeparators(numberOfCompletedOrders)}</span></li>
                                            <li>Rating <span>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)})</span></li>
                                        </ul>
                                    </div>
                                    
                                    <div className="cart-totals">
                                        <h3>Delivery State Records</h3>
                                        <ul className="order-details">
                                            {stateRecord && this.renderStateRecord(stateRecord)}
                                        </ul>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>}
                </section>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingDeliveryDetails: createLoadingSelector(['FETCH_DELIVERY_DETAILS'])(state),
        deliveriesData: state.deliveryReducer
    }
}

const DeliveryDetails = AccountTab(DeliveryDetailsComp, 'deliveries');

export default connect(mapStateToProps, { fetchDeliveryDetails })(DeliveryDetails);