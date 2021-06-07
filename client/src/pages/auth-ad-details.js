import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { titleCase } from "title-case";
import Moment from 'react-moment';
import Modal from 'rc-dialog';

import WorkingHours from '../components/Common/WorkingHours';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchAd, toggleAdStatus, deleteAd, adComment, adReply, adCommentDelete, adReplyDelete } from '../store/actions/adActions';
import Spinner from '../components/Common/Spinner';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import Rating from '../components/Common/Rating';
import Comments from '../components/Common/Comments';
import AccountTab from '../components/HOC/AccountTab';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import Description from '../components/Common/Description';
import { twoDecimalPoints, thousandSeparators } from '../services/common';
import { bucketUrl } from '../constants/urls/bucket';

class AuthAdDeatilsComp extends React.Component {

    state = {
        ad: {},
        nav1: null,
        nav2: null,
        adID: null,
        showErrorModal: false,
        showDeleteModal: false,
        showCommentDeleteModal: false,
        showReplyDeleteModal: false,
        commentDeleteModalMessage: "",
        deletingCommentID: null,
        deletingReplyID: null,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    openTabSection = (evt, tabName) => {
        let mainTabs = ["profileLink", "credentialsLink", "ordersLink", "adsLink", "demoAdsLink", "salesLink", "deliveriesLink"];
        let i, tablinks;
        const tabs = ['additionalInformation', 'specification', 'comments'];
        for (i = 0; i < tabs.length; i++) {
            let element = document.getElementById(tabs[i]);
            element.classList.remove("fadeInUp");
            element.style.display = "none";
        }

        tablinks = document.getElementsByTagName("li");
        for (i = 0; i < tablinks.length; i++) {
            if(mainTabs.indexOf(tablinks[i].id) < 0) {
                tablinks[i].className = tablinks[i].className.replace("current", "");
            }
        }

        document.getElementById(tabName).style.display = "block";
        document.getElementById(tabName).className += " fadeInUp animated";
        evt.currentTarget.className += "current";
    }

    componentDidMount() {
        const { match } = this.props;
        const { adID } = match.params;
        this.setState({ adID: adID });
        this.props.fetchAd({ adID: adID }).then(() => {
            const { status, errorMessage } = this.props.adData.payload;
            if (status === 'success') {
                this.setState({ ad: this.props.adData.payload });
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
        this.setState({
            nav1: this.slider1,
            nav2: this.slider2
        });
    }

    renderSliderMainImages = () => {
        if (this.state.ad && this.state.ad.photos && this.state.ad.photos.length > 0) {
            const { photos } = this.state.ad;
            return photos.map((photo, index) => {
                return (
                    <div key={index}>
                        <div className="item">
                            <img src={bucketUrl + "photos/photo-640/" + photo.replace("#","%23")} loading="lazy" alt="" />
                        </div>
                    </div>
                )
            })
        } else {
            return (
                <div key='dummy'>
                    <div className="item">
                        <img src={dummy} alt="" />
                    </div>
                </div>
            )
        }
    }

    onChangeStatus = (adID) => {
        const { togglingStatus } = this.props;
        if (!togglingStatus) {
            this.setState({ ad: { ...this.state.ad, available: !this.state.ad.available } });
            this.props.toggleAdStatus({ adID: adID }).then(r => {
                const { status, publicAvailableStatus, errorMessage } = this.props.adData.payload;
                if(status === "success") {
                    this.setState({ ad: { ...this.state.ad, publicAvailableStatus } });
                }
                else {
                    const { fatalError, authError } = errorMessage;
                    const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                    this.setState({
                        ad: { ...this.state.ad, available: !this.state.ad.available },
                        showErrorModal: true,
                        errorModalMessage: 'Available status was not changed. ' + message
                    });
                }
            });
        }
    }

    deleteAd = () => {
        const adID = this.state.adID;
        this.props.deleteAd({ adID: adID }).then(() => {
            this.setState({
                showDeleteModal: false
            });

            const { status, errorMessage } = this.props.adData.payload;
            if(status !== "success") {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showErrorModal: true,
                    errorModalMessage: 'Ad was not deleted. ' + message
                });
            }
        });
    }

    onCloseErrorModal = () => {
        this.setState({ showErrorModal: false });
    }

    onCloseDeleteModal = () => {
        this.setState({ showDeleteModal: false });
    }

    copyUrl = () => {
        let range = document.createRange();
        range.selectNode(document.getElementById("public-url"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
    }

    prepareOptionString = (option, price, weight, weightUnit) => {
        let preparedOption = option;
        if(price > 0) {
            preparedOption = preparedOption + ", Extra Price: ৳" + thousandSeparators(twoDecimalPoints(price));
        }

        if(weight > 0) {
            preparedOption = preparedOption + ", Extra Weight: " + thousandSeparators(twoDecimalPoints(weight)) + " " + weightUnit;
        }
        return preparedOption;
    }

    onComment = (message) => {
        const { adID } = this.state;
        this.props.adComment({ adID: adID, comment: message }).then(() => {
            const { status, comments, errorMessage } = this.props.adData.payload;
            if(status === "success") {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                });
            }
            else {
                const { fatalError, authError, comment } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : comment;
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Comment was not posted. " + message
                });
            }
        });
    }

    onReply = ({ message, commentID }) => {
        const { adID } = this.state;
        this.props.adReply({ adID: adID, reply: message, commentID: commentID }).then(() => {
            const { status, comments, errorMessage } = this.props.adData.payload;
            if(status === "success") {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                });
            }
            else {
                const { fatalError, authError, comment } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : comment;
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Reply was not posted. " + message
                });
            }
        });
    }

    onDeleteComment = (commentID) => {
        this.setState({
            showCommentDeleteModal: true,
            commentDeleteModalMessage: "Are you sure you want to delete this comment?",
            deletingCommentID: commentID
        });
    }

    onDeleteReply = (commentID, replyID) => {
        this.setState({
            showReplyDeleteModal: true,
            commentDeleteModalMessage: "Are you sure you want to delete this reply?",
            deletingCommentID: commentID,
            deletingReplyID: replyID
        });
    }

    onCloseCommentDeleteModal = () => {
        this.setState({
            showCommentDeleteModal: false,
            deletingCommentID: null
        });
    }

    onCloseReplyDeleteModal = () => {
        this.setState({
            showReplyDeleteModal: false,
            deletingCommentID: null,
            deletingReplyID: null
        });
    }

    deleteComment = () => {
        const { adID } = this.state;
        const commentID = this.state.deletingCommentID;
        this.props.adCommentDelete({ adID: adID, commentID: commentID }).then(() => {
            this.setState({
                showCommentDeleteModal: false,
                deletingCommentID: null
            });
            const { status, comments, errorMessage } = this.props.adData.payload;

            if(status === "success") {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Comment was not deleted. " + message
                });
            }
        });
    }

    deleteReply = () => {
        const { adID } = this.state;
        const commentID = this.state.deletingCommentID;
        const replyID = this.state.deletingReplyID;
        this.props.adReplyDelete({ adID: adID, commentID: commentID, replyID: replyID }).then(() => {
            this.setState({
                showReplyDeleteModal: false,
                deletingCommentID: null,
                deletingReplyID: null
            });
            const { status, comments, errorMessage } = this.props.adData.payload;

            if(status === 'success') {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Reply was not deleted. " + message
                });
            }
        });
    }

    render() {
        const { adName, brandName, contactNo, price, originalPrice, pricePer, parcelPrice, specifications, numOfItems, numOfItemsPerOrder, leadTime, expiryTime, options, available, publicAvailableStatus, coordinate, address, availableHours, category, subcategory, description, condition, parcel, weight, weightUnit, parcelWeight, parcelWeightUnit, volume, volumeUnit, dimension, dimensionUnit, parcelDimension, parcelDimensionUnit, area, areaUnit, avgRating, numberOfRatings,  shoppingCount, createdOn, instruction, midBreaks, extraChargeApplicable, extraCharge, extraChargeDescription, governmentChargeApplicable, governmentCharge, governmentChargeDescription, governmentChargeRegNo, processingCapacity, productReturnApplicable, productReturnPolicy, discounts, discountTag, shopDiscounts, urlName, shopName, location, comments, showableDiscountTag, showableShopDiscountTag } = this.state.ad;
        let dimensionRounded = (dimension && dimension.length) ? [thousandSeparators(twoDecimalPoints(dimension[0])), thousandSeparators(twoDecimalPoints(dimension[1])), thousandSeparators(twoDecimalPoints(dimension[2]))] : null;
        let parcelDimensionRounded = (parcelDimension && parcelDimension.length) ? [thousandSeparators(twoDecimalPoints(parcelDimension[0])), thousandSeparators(twoDecimalPoints(parcelDimension[1])), thousandSeparators(twoDecimalPoints(parcelDimension[2]))] : null;
        const forfor = this.state.ad.for;
        const { adID } = this.state;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { isDeletingAd, isDeletingComment, isDeletingReply, isFetchingAd } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-details-area">
                    {isFetchingAd ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingAd} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-12 product-details-slider">
                                <div className="products-page-gallery">
                                    <div className="product-page-gallery-main">
                                        <div>
                                            <Slider
                                                slidesToShow={1}
                                                swipeToSlide={true}
                                                focusOnSelect={true}
                                                dots={true}>
                                                {
                                                    this.renderSliderMainImages()
                                                }
                                            </Slider>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-12 product-details-information">
                                <div className="product-details-content">
                                    <div>
                                        <div>
                                            <h3 className="word-break">{adName && titleCase(adName)}</h3>
                                            <div><span className="public-status-headline">Public status:</span> {(publicAvailableStatus === "Available") ? <span className="available-span"><span className="dot available-dot"></span>Available</span> : <span className="unavailable-span"><span className="dot unavailable-dot"></span>{publicAvailableStatus}</span>}</div>
                                        </div>
                                        <div>
                                            <h3>
                                                <small>
                                                    <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.setState({ showDeleteModal: true })}><i className="far fa-trash-alt"></i></span>
                                                    <Link className="float-right" to={{ pathname: `/account/ads/${adID}/update-ad` }} title="Edit Ad Info"><i className="fa fa-pencil-alt"></i></Link>
                                                </small>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="auth-shop-slider-availability">
                                        <div className="auth-shop-slider">
                                            <label className="switch" title={available === true ? 'Available' : 'Not available'}>
                                                <input type="checkbox" checked={available ? true : false} onChange={(e) => this.onChangeStatus(adID)} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        
                                        <div>{available ? <span className="available-span auth-shop-availability">Available</span> : <span className="unavailable-span auth-shop-availability">Unavailable</span>}</div>
                                    </div>
                                    {showableDiscountTag ? <div className="discount-tag-div"><h6 className="voucher">{showableDiscountTag}</h6></div> : ""}
                                    {showableShopDiscountTag ? <div className="shop-discount-tag-div"><h6 className="voucher">{showableShopDiscountTag}</h6></div> : ""}
                                    {(showableDiscountTag || showableShopDiscountTag) ? <div className="more-discount-details">For more details about discounts, see "Additional Information" section below</div> : ""}
                                    <div className="new-price-ad-details word-break">
                                        <span className="ad-price">৳{(priceFull > 0) ? thousandSeparators(priceFull) : '0'}<sup>{priceDecimal}</sup>{originalPrice ? <span className="ad-old-price"> <del>৳{thousandSeparators(twoDecimalPoints(originalPrice))}</del> </span> : ""}{pricePer && <React.Fragment>/{pricePer}</React.Fragment>}</span> {parcelPrice ? <span className="ad-details-parcel-price">+ ৳{thousandSeparators(twoDecimalPoints(parcelPrice))} for shippable product</span> : ""}
                                    </div>

                                    
                                    <div className="rating-comment-counter">
                                        <div className="rating">
                                            <Rating rating={avgRating} disabled={true} />
                                        </div>
                                        <div className="rating-count-auth">
                                            {(comments && comments.length) ? thousandSeparators(comments.length) : 0} {(comments && (comments.length > 1)) ? 'Comments' : 'Comment'}
                                        </div>
                                    </div>
                                    <Description description={description} type='shop' />
                                    {parcel ? <div className="product-info-btn" style={{ marginTop: '20px' }}>
                                        <i className="fas fa-truck fa-truck-shipping"></i> <span className="shipping-available"><b>Shipping Available</b></span>
                                    </div> : <div className="product-info-btn" style={{ marginTop: '20px' }}>
                                        <span className="shipping-icon-container"><i className="fa fa-ban"></i><i className="fas fa-truck fa-truck-shipping"></i></span> <span className="shipping-unavailable"><b>Shipping not available</b></span>
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="row  information-tab">
                            <div className="col-lg-12 col-md-12">
                                <div className="tab products-details-tab">
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12">
                                            <ul className="tabs">
                                                <li onClick={(e) => { e.preventDefault(); this.openTabSection(e, 'additionalInformation') }} className="current">
                                                    <span className="tabs-nav-text">
                                                        <div className="dot"></div> Additional Information</span>
                                                </li>
                                                <li onClick={(e) => { e.preventDefault(); this.openTabSection(e, 'specification') }}>
                                                    <span className="tabs-nav-text">
                                                        <div className="dot"></div> Specification</span>
                                                </li>
                                                <li onClick={(e) => { e.preventDefault(); this.openTabSection(e, 'comments') }}>
                                                    <span className="tabs-nav-text">
                                                        <div className="dot"></div> Comments</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="col-lg-12 col-md-12">
                                            <div className="tab_content auth-tab-content">

                                                <div id="additionalInformation" className="tabs_item">
                                                    <div className="products-details-tab-content">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered">
                                                                <tbody>
                                                                    {adID ? <tr>
                                                                        <td>Item ID</td>
                                                                        <td className="word-break">
                                                                            {adID}
                                                                        </td>
                                                                    </tr> : null}
                                                                    <tr>
                                                                        <td>Public URL</td>
                                                                        <td>
                                                                            <div className="display-inline word-break" id="public-url">{`https://qbird.com/ad/${adID}`}</div> <i className="fa fa-copy copy-public-link" title="Copy Public URL" onClick={() => this.copyUrl()}></i>
                                                                        </td>
                                                                    </tr>
                                                                    {urlName ? <tr>
                                                                        <td>Shop</td>
                                                                        <td className="word-break">
                                                                            <Link to={`/account/ads/shops/${urlName}`}>{shopName}</Link>
                                                                        </td>
                                                                    </tr> : null}
                                                                    {address && <tr>
                                                                        <td>Address</td>
                                                                        <td className="word-break whitespace-pre-wrap">{address}</td>
                                                                    </tr>}
                                                                    {instruction && instruction !== "" ? <tr>
                                                                        <td>Instruction to Find the Address</td>
                                                                        <td className="word-break whitespace-pre-wrap">{instruction}</td>
                                                                    </tr> : null}
                                                                    {coordinate && location && <tr>
                                                                        <td>Location</td>
                                                                        <td><a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate.lat},${coordinate.long}/@${coordinate.lat},${coordinate.long},17z`}>Check the Location on Google Map</a></td>
                                                                    </tr>}
                                                                    {contactNo && contactNo !== "" ? <tr>
                                                                        <td>Contact No</td>
                                                                        <td className="word-break">{contactNo}</td>
                                                                    </tr> : null}
                                                                    {availableHours && <tr>
                                                                        <td>{((category === 'Job') || (category === 'Property')) ? 'Contact Hours' : 'Available Hours'}</td>
                                                                        <td>
                                                                            <WorkingHours openingHours={availableHours} midBreaks={midBreaks} />
                                                                        </td>
                                                                    </tr>}
                                                                    {governmentChargeApplicable && governmentCharge && governmentCharge !== 0 ? <tr>
                                                                        <td>Government Charge</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(governmentCharge))}% ({governmentChargeDescription})</td>
                                                                    </tr> : null}
                                                                    {governmentChargeApplicable && governmentCharge && governmentCharge !== 0 ? <tr>
                                                                        <td>Govt. Charge Reg No</td>
                                                                        <td className="word-break">{governmentChargeRegNo}</td>
                                                                    </tr> : null}
                                                                    {extraChargeApplicable && extraCharge && extraCharge !== 0 ? <tr>
                                                                        <td>Extra Charge</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(extraCharge))}% ({extraChargeDescription})</td>
                                                                    </tr> : null}
                                                                    {leadTime && leadTime !== "" && <tr>
                                                                        <td>Lead Time</td>
                                                                        <td>{leadTime}</td>
                                                                    </tr>}
                                                                    {parcel && processingCapacity && <tr>
                                                                        <td>Processing Capacity</td>
                                                                        <td className="word-break">{thousandSeparators(processingCapacity)}</td>
                                                                    </tr>}
                                                                    {parcel ? <tr>
                                                                        <td>Number of Items in Stock</td>
                                                                        <td>{numOfItems ? thousandSeparators(numOfItems) : 0}</td>
                                                                    </tr> : ""}
                                                                    {parcel && numOfItemsPerOrder ? <tr>
                                                                        <td>Maximum Number of Items per Order</td>
                                                                        <td>{numOfItemsPerOrder ? thousandSeparators(numOfItemsPerOrder) : 0}</td>
                                                                    </tr> : null}
                                                                    {(category !== 'Job' && category !== 'Service' && category !== 'Property' && forfor !== 'Rent') && parcel && productReturnApplicable && <tr>
                                                                        <td>Product Return Policy</td>
                                                                        <td className="word-break whitespace-pre-wrap">{(productReturnApplicable === 'Applicable') ? productReturnPolicy ? productReturnPolicy : "Not applicable" : productReturnApplicable}</td>
                                                                    </tr>}
                                                                    {discounts && discounts.length > 0 ? <tr>
                                                                        <td>Discounts</td>
                                                                        <td className="word-break">{discounts.map((discount, index) => {
                                                                            return(
                                                                                <div className="ad-options"  key={index}>
                                                                                    <b>Discount on:</b> {discount.discountOn}
                                                                                    <div className="child-options">
                                                                                        <div><b>Discount:</b> {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit}</div>
                                                                                        {discount.minOrder ? <div><b>Minimum Order:</b> {thousandSeparators(discount.minOrder)} Unit</div> : ""}
                                                                                        {discount.maxOrder ? <div><b>Maximum Order:</b> {thousandSeparators(discount.maxOrder)} Unit</div> : ""}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}</td>
                                                                    </tr> : null}
                                                                    {discountTag ? <tr>
                                                                        <td>Discount Tag</td>
                                                                        <td className="word-break">{discountTag}</td>
                                                                    </tr> : null}
                                                                    {shopDiscounts && shopDiscounts.length > 0 ? <tr>
                                                                        <td>Shop Discounts</td>
                                                                        <td className="word-break">{shopDiscounts.map((discount, index) => {
                                                                            return(
                                                                                <div className="ad-options"  key={index}>
                                                                                    <b>Discount on:</b> {discount.discountOn}
                                                                                    <div className="child-options">
                                                                                        <div><b>Discount:</b> {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit} {discount.maxAmount ? "up to " + thousandSeparators(twoDecimalPoints(discount.maxAmount)) + " " + discount.maxAmountUnit : ""}</div>
                                                                                        {discount.minOrder ? <div><b>Minimum Order Amount:</b> {thousandSeparators(twoDecimalPoints(discount.minOrder))} {discount.minOrderUnit}</div> : ""}
                                                                                        {discount.maxOrder ? <div><b>Maximum Order Amount:</b> {thousandSeparators(twoDecimalPoints(discount.maxOrder))} {discount.maxOrderUnit}</div> : ""}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}</td>
                                                                    </tr> : null}
                                                                    {parcel ? <tr>
                                                                        <td>Shopping Count</td>
                                                                        <td>{shoppingCount ? thousandSeparators(shoppingCount) : 0}</td>
                                                                    </tr> : null}
                                                                    {avgRating ? <tr>
                                                                        <td>Rating</td>
                                                                        <td>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)})</td>
                                                                    </tr> : null}
                                                                    {createdOn ? <tr>
                                                                        <td>Created on</td>
                                                                        <td><Moment format="MMM DD, YYYY, hh:mm:ss a">{createdOn}</Moment></td>
                                                                    </tr> : null}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="specification" className="tabs_item">
                                                    <div className="products-details-tab-content">
                                                        <div className="table-responsive">
                                                            <table className="table table-striped">
                                                                <tbody>
                                                                    {brandName && brandName !== "" ? <tr>
                                                                        <td>Brand Name</td>
                                                                        <td className="word-break">{brandName}</td>
                                                                    </tr> : null
                                                                    }
                                                                    {category && category !== "" ? <tr>
                                                                        <td>Category</td>
                                                                        <td className="word-break">{category}</td>
                                                                    </tr> : null}
                                                                    {subcategory && subcategory !== "" ? <tr>
                                                                        <td>Subcategory</td>
                                                                        <td className="word-break">{subcategory}</td>
                                                                    </tr> : null}
                                                                    {(category !== 'Food and Drinks') && forfor && forfor !== "" ? <tr>
                                                                        <td>For</td>
                                                                        <td>{forfor}</td>
                                                                    </tr> : null}
                                                                    {(category !== 'Food and Drinks') && condition && condition !== "" ? <tr>
                                                                        <td>Condition</td>
                                                                        <td>{condition}</td>
                                                                    </tr> : null}
                                                                    {weight && weight !== "" ? <tr>
                                                                        <td>Weight</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(weight))} {weightUnit}</td>
                                                                    </tr> : null}
                                                                    {area && area !== "" && <tr>
                                                                        <td>Area</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(area))} {areaUnit}</td>
                                                                    </tr>}
                                                                    {volume && volume !== "" && <tr>
                                                                        <td>Volume</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(volume))} {volumeUnit}</td>
                                                                    </tr>}
                                                                    {dimension && dimension.length > 0 && <tr>
                                                                        <td>Dimension (L x W x H)</td>
                                                                        <td className="word-break">{dimensionRounded.join(' x ')} {dimensionUnit}</td>
                                                                    </tr>}
                                                                    {parcel && parcelWeight && <tr>
                                                                        <td>Shipping Weight</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(parcelWeight))} {parcelWeightUnit}</td>
                                                                    </tr>}
                                                                    {parcel && parcelDimension && parcelDimension.length > 0 && <tr>
                                                                        <td>Shipping Dimension (L x W x H)</td>
                                                                        <td className="word-break">{parcelDimensionRounded.join(' x ')} {parcelDimensionUnit}</td>
                                                                    </tr>}
                                                                    {specifications && specifications.length > 0 && <React.Fragment>
                                                                        {specifications.map(specification => {
                                                                            return(
                                                                                <tr key={specification.specificationName}>
                                                                                    <td className="word-break">{specification.specificationName}</td>
                                                                                    <td className="word-break">{specification.specification}</td>
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </React.Fragment>}
                                                                    {options && options.length > 0 ? <tr>
                                                                        <td>Options</td>
                                                                        <td className="word-break">{options.map(item => {
                                                                            return(
                                                                                <div className="ad-options"  key={item.optionName}>
                                                                                    {item.optionName} {(item.optionType === 'Mandatory') ? <span>(Mandatory)</span> : ''}
                                                                                    <div className="child-options">
                                                                                        {item.options.map(childItem => {
                                                                                            return(
                                                                                                <div key={item.optionName + childItem.option}><span className="dot option-dot"></span>{this.prepareOptionString(childItem.option, childItem.extraPrice, childItem.extraWeight, childItem.extraWeightUnit)}</div>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}</td>
                                                                    </tr> : null}
                                                                    {expiryTime && expiryTime !== "" && <tr>
                                                                        <td>Expiry Time of the Product</td>
                                                                        <td>{expiryTime}</td>
                                                                    </tr>}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="comments" className="tabs_item">
                                                    <Comments comments={comments} onReply={this.onReply} onComment={this.onComment} onDeleteComment={this.onDeleteComment} onDeleteReply={this.onDeleteReply} canMakeChanges={true} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
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
                        <b>{this.state.errorModalMessage}</b>
                    </Modal>
                    <Modal
                        title="Confirmation"
                        visible={this.state.showDeleteModal}
                        onOk={this.deleteAd}
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
                                    onClick={this.deleteAd}
                                >
                                    <Spinner isLoading={isDeletingAd} /> &nbsp;Delete
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to delete this Ad?
                    </Modal>
                <Modal
                    title="Confirmation"
                    visible={this.state.showCommentDeleteModal}
                    onOk={this.deleteComment}
                    onClose={this.onCloseCommentDeleteModal}
                    closable={true}
                    animation="slide-fade"
                    maskAnimation="fade"
                    footer={
                        [
                            <button
                                type="button"
                                className="btn btn-primary"
                                key="close"
                                onClick={this.onCloseCommentDeleteModal}
                            >
                                Keep
                            </button>,
                            <button
                                type="button"
                                className="btn btn-light modal-remove-button"
                                key="save"
                                onClick={this.deleteComment}
                            >
                                <Spinner isLoading={isDeletingComment} /> &nbsp;Delete
                            </button>,
                        ]
                    }
                >
                    {this.state.commentDeleteModalMessage}
                </Modal>
                <Modal
                    title="Confirmation"
                    visible={this.state.showReplyDeleteModal}
                    onOk={this.deleteReply}
                    onClose={this.onCloseReplyDeleteModal}
                    closable={true}
                    animation="slide-fade"
                    maskAnimation="fade"
                    footer={
                        [
                            <button
                                type="button"
                                className="btn btn-primary"
                                key="close"
                                onClick={this.onCloseReplyDeleteModal}
                            >
                                Keep
                            </button>,
                            <button
                                type="button"
                                className="btn btn-light modal-remove-button"
                                key="save"
                                onClick={this.deleteReply}
                            >
                                <Spinner isLoading={isDeletingReply} /> &nbsp;Delete
                            </button>,
                        ]
                    }
                >
                    {this.state.commentDeleteModalMessage}
                </Modal>
                </section>}
            </React.Fragment>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        isFetchingAd: createLoadingSelector(['FETCH_AUTH_AD'])(state),
        togglingStatus: createLoadingSelector(['TOGGLE_AD_STATUS'])(state),
        isDeletingAd: createLoadingSelector(['AD_DELETE'])(state),
        isPostingComment: createLoadingSelector(['AD_COMMENT'])(state),
        isPostingReply: createLoadingSelector(['AD_REPLY'])(state),
        isDeletingComment: createLoadingSelector(['AD_COMMENT_DELETE'])(state),
        isDeletingReply: createLoadingSelector(['AD_REPLY_DELETE'])(state),
        adData: state.adReducer
    };
}

const AuthAdDeatils = AccountTab(AuthAdDeatilsComp, 'ads');

export default connect(mapStateToProps, { fetchAd, toggleAdStatus, deleteAd, adComment, adReply, adCommentDelete, adReplyDelete })(AuthAdDeatils);
