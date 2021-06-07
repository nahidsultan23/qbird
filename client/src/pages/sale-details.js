import React from 'react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import 'rc-dialog/assets/index.css';

import { fetchSaleDetails } from '../store/actions/saleActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import searchingDeliveryPerson from '../img/searching-delivery-person/searching-delivery-person.gif';
import AccountTab from '../components/HOC/AccountTab';
import { truncate, twoDecimalPoints, twoFixedDecimalPoints, thousandSeparators } from '../services/common';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { bucketUrl } from '../constants/urls/bucket';

class SaleDetailsComp extends React.Component {

    state = {
        saleDetails: {},
        deliveryPersonPhoto: null,
        saleID: null,
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
        const { saleID } = params;
        this.props.fetchSaleDetails({ saleID: saleID }).then(() => {
            const { status, errorMessage } = this.props.salesData.payload;

            if(status === 'success') {
                this.setState({ saleDetails: this.props.salesData.payload, saleID: saleID });
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
    
    renderSaleItem = (items) => {
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
        const { saleDetails } = this.state;
        const { items, totalWeight, subtotal, discount, grossTotal, totalGovernmentCharge, totalExtraCharge, currentState, stateRecord, deliveryPersonID, deliveryPersonName, deliveryPersonPhoneNumber, numberOfCompletedDeliveries, avgRating, numberOfRatings, deliveryPersonPhoto } = saleDetails;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { isFetchingSaleDetails } = this.props;

        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="cart-area">
                    {isFetchingSaleDetails ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingSaleDetails} /> &nbsp;Fetching...
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
                                                {items && this.renderSaleItem(items)}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="cart-totals">
                                        <div className="order-details-and-cancel-button">
                                            <h3 className="order-details-heading">Sale Details</h3>
                                        </div>
                                        <ul className="order-details">
                                            <li>State <span>{currentState && currentState.state}</span></li>
                                            <li>Total Weight<span>{thousandSeparators(twoDecimalPoints(totalWeight))} kg - Kilogram</span></li>
                                            <li>Subtotal<span>৳{thousandSeparators(twoFixedDecimalPoints(subtotal))}</span></li>
                                            <li>Government Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(totalGovernmentCharge))}</span></li>
                                            <li>Extra Charge<span>৳{thousandSeparators(twoFixedDecimalPoints(totalExtraCharge))}</span></li>
                                            {discount ? <li style={{color: "red"}}>Discount<span className="order-discount">- ৳{thousandSeparators(twoFixedDecimalPoints(discount))}</span></li> : ""}
                                            <li>Total<span>৳{thousandSeparators(twoFixedDecimalPoints(grossTotal))}</span></li>
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
                                            { deliveryPersonPhoneNumber ? <li>Contact No <span>{deliveryPersonPhoneNumber}</span></li> : ''}
                                            <li>Number of Completed Deliveries <span>{thousandSeparators(numberOfCompletedDeliveries)}</span></li>
                                            <li>Rating <span>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)})</span></li>
                                        </ul>
                                    </div> : ''}
                                    
                                    <div className="cart-totals">
                                        <h3>Sale State Records</h3>
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
        isFetchingSaleDetails: createLoadingSelector(['FETCH_SALE_DETAILS'])(state),
        salesData: state.saleReducer
    }
}

const SaleDetails = AccountTab(SaleDetailsComp, 'sales');

export default connect(mapStateToProps, { fetchSaleDetails })(SaleDetails);