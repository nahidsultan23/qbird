import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { titleCase } from "title-case";
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import WorkingHours from '../components/Common/WorkingHours';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchAd } from '../store/actions/detailsActions';
import { rateAd, adComment, adReply, adCommentDelete, adReplyDelete } from '../store/actions/adActions';
import { addToCart } from '../store/actions/cartActions';
import { addToWishlist } from '../store/actions/wishlistActions';
import { buyNow } from '../store/actions/buyNowActions';
import { reportAd } from '../store/actions/reportActions';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import RatingOverview from '../components/Common/RatingOverview';
import BuyOptions from '../components/Modal/BuyOptions';
import Report from '../components/Modal/Report';
import { getFormValues } from 'redux-form';
import Comments from '../components/Common/Comments';
import history from '../history';
import Spinner from '../components/Common/Spinner';
import Rate from '../components/Common/Rating';
import UserRating from '../components/Common/UserRating';
import AdSlider from '../components/Slider/AdSlider';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';
import Description from '../components/Common/Description';
import { twoDecimalPoints, thousandSeparators } from '../services/common';
import { bucketUrl } from '../constants/urls/bucket';

class AdDetails extends React.Component {

    state = {
        ad: {},
        nav1: null,
        nav2: null,
        buyOptions: false,
        quantity: 1,
        adID: null,
        mode: '',
        showModal: false,
        showCommentDeleteModal: false,
        showReplyDeleteModal: false,
        commentDeleteModalMessage: "",
        deletingCommentID: null,
        deletingReplyID: null,
        modalTitle: "",
        modalMessage: "",
        reportModal: false,
        errorMessage: {
            fatalError: null,
            contentUnavailable: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    handleQuantityChange = (e) => {
        let value = Number(e.target.value);
        if(Number.isInteger(value) && (value > 0)) {
            this.setState({
                quantity: value
            })
        }
        else {
            this.setState({
                quantity: 1
            })
        }
    }

    handleQuantitySubtract = () => {
        let quantity = this.state.quantity;
        if(quantity > 1) {
            let newValue = quantity - 1;
            this.setState({
                quantity: newValue
            });
            document.getElementById("quantity").value = newValue;
        }
        else {
            document.getElementById("quantity").value = quantity;
        }
    }

    handleQuantityAddition = () => {
        let quantity = this.state.quantity;
        const { numOfItems, numOfItemsPerOrder } = this.state.ad;
        let newValue = quantity + 1;
        if(numOfItemsPerOrder < numOfItems) {
            if(quantity < numOfItemsPerOrder) {
                this.setState({
                    quantity: newValue
                });
                document.getElementById("quantity").value = newValue;
            }
            else {
                this.setState({
                    quantity: numOfItemsPerOrder
                });
                document.getElementById("quantity").value = numOfItemsPerOrder;
            }
        }
        else {
            if(quantity < numOfItems) {
                this.setState({
                    quantity: newValue
                });
                document.getElementById("quantity").value = newValue;
            }
            else {
                this.setState({
                    quantity: numOfItems
                });
                document.getElementById("quantity").value = numOfItems;
            }
        }
    }

    handleOkBuyOptions = () => {
        this.setState({
            buyOptions: false,
        });
    };

    componentDidMount() {
        const { match } = this.props;
        const { adID } = match.params;
        this.setState({ adID: adID });
        this.props.fetchAd({ adID: adID }).then(() => {
            const { status, errorMessage } = this.props.details.payload;
            if(status === "success") {
                this.setState({ ad: this.props.details.payload });
            }
            else {
                const { fatalError, contentUnavailable } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        contentUnavailable: contentUnavailable
                    }
                });
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.adID !== prevProps.match.params.adID) {
            const { match } = this.props;
            const { adID } = match.params;
            this.setState({ adID: adID });
            this.props.fetchAd({ adID: adID }).then(() => {
                const { status, errorMessage } = this.props.details.payload;
                if(status === "success") {
                    this.setState({ ad: this.props.details.payload });
                }
                else {
                    const { fatalError, contentUnavailable } = errorMessage;
                    this.setState({
                        errorMessage: {
                            fatalError: fatalError,
                            contentUnavailable: contentUnavailable
                        }
                    });
                }
            });
        }
    }

    onCloseModal = () => {
        this.setState({ showModal: false });
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

    onClickedReport = () => {
        const { isAuthenticated } = this.props.auth;
        if (isAuthenticated) {
            this.setState({
                reportModal: true
            })
        }
        else {
            history.push('/log-in', {
                from:
                {
                    pathname: `/ad/${this.state.adID}`
                }
            });
        }
    }

    onCloseReportModal = () => {
        this.setState({
            reportModal: false
        })
    }

    reportSubmitted = (subject, otherSubject, comment) => {
        const { adID } = this.state;
        this.props.reportAd({adID, subject, otherSubject, comment}).then(() => {
            const { status, errorMessage } = this.props.reportDetails.payload;
            if(status === 'success') {
                this.setState({
                    reportModal: false
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                
                this.setState({
                    fatalErrorForm: fatalError,
                    authErrorForm: authError
                });
            }
        })
    }

    onAddToCart() {
        const { isAuthenticated } = this.props.auth;
        if (isAuthenticated) {
            const { options } = this.state.ad;
            if (options && options.length > 0) {
                this.setState({ buyOptions: true, mode: 'cart' });
            } else {
                this.addToCart([]);
            }
        } else {
            history.push('/log-in', {
                from:
                {
                    pathname: `/ad/${this.state.adID}`
                }
            });
        }

        if(!document.getElementById("quantity").value) {
            document.getElementById("quantity").value = 1;
        }
        else {
            document.getElementById("quantity").value = this.state.quantity;
        }
    }

    addToCart(options) {
        const item = { adID: this.state.adID, options: options, quantity: this.state.quantity };
        this.props.addToCart({ cart: item }).then(() => {
            const { status, errorMessage } = this.props.cartData.payload;
            if(status === 'failure') {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Item was not added to the Cart. " + message
                });
            }
        });
    }

    onBuyItNow() {
        const { isAuthenticated } = this.props.auth;
        if (isAuthenticated) {
            const { options } = this.state.ad;
            if (options && options.length > 0) {
                this.setState({ buyOptions: true, mode: 'buyNow' });
            } else {
                this.buyNow([]);
            }
        } else {
            history.push('/log-in', {
                from:
                {
                    pathname: `/ad/${this.state.adID}`
                }
            });
        }

        if(!document.getElementById("quantity").value) {
            document.getElementById("quantity").value = 1;
        }
        else {
            document.getElementById("quantity").value = this.state.quantity;
        }
    }

    buyNow(options) {
        const item = { adID: this.state.adID, options: options, quantity: this.state.quantity };
        this.props.buyNow(item).then(() => {
            const { status, errorMessage } = this.props.buyNowData.payload;
            if(status === 'success') {
                history.push(`/buy-now/${this.state.adID}`);
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Buy Now action failed. " + message
                });
            }
        });
    }

    onAddToWishlist() {
        const { isAuthenticated } = this.props.auth;
        if (isAuthenticated) {
            this.props.addToWishlist({ adID: this.state.adID }).then(() => {
                const { status, errorMessage } = this.props.wishlistData.payload;
                if(status === 'failure') {
                    const { fatalError, authError } = errorMessage;
                    const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                    this.setState({
                        showModal: true,
                        modalTitle: "Error",
                        modalMessage: "Item was not added to the Wishlist. " + message
                    });
                }
            });
        } else {
            history.push('/log-in', {
                from:
                {
                    pathname: `/ad/${this.state.adID}`
                }
            });
        }

        if(document.getElementById("quantity") && !document.getElementById("quantity").value) {
            document.getElementById("quantity").value = 1;
        }
    }

    onOptionsSubmitted = ({ options }) => {
        this.setState({ buyOptions: false });
        if (this.state.mode === 'buyNow') {
            this.buyNow(options);
        } else if (this.state.mode === 'cart') {
            this.addToCart(options);
        }
    }

    onCloseBuyOptions = () => {
        this.setState({
            buyOptions: false,
        });
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.adDetails !== nextProps.adDetails) {
            this.setState({
                ad: nextProps.adDetails,
            });
        }
    }

    onChangeRating = (newRating) => {
        const { adID } = this.state;
        this.props.rateAd({ adID: adID, rating: newRating }).then(() => {
            const { status, avgRating, userRating, numberOfRatings, errorMessage } = this.props.adReducer.payload;
            if(status === "success") {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        avgRating: avgRating,
                        userRating: userRating,
                        numberOfRatings: numberOfRatings
                    }
                })
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showModal: true,
                    modalTitle: "Error",
                    modalMessage: "Rating was not posted. " + message
                });
            }
        });
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
            const { status, comments, errorMessage } = this.props.adReducer.payload;
            if(status === "success") {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                })
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
            const { status, comments, errorMessage } = this.props.adReducer.payload;
            if(status === 'success') {
                this.setState({
                    ad: {
                        ...this.state.ad,
                        comments: comments
                    }
                })
            }
            else {
                const { fatalError, authError, reply } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : reply;
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

            const { status, comments, errorMessage } = this.props.adReducer.payload;
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

            const { status, comments, errorMessage } = this.props.adReducer.payload;
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
        const { contactNo, adName, brandName, price, originalPrice, pricePer, parcelPrice, specifications, numOfItems, numOfItemsPerOrder, leadTime, expiryTime, options, available, urlName, shopName,
            coordinate, address, instruction, availableHours, midBreaks, category, subcategory, description, condition, parcel, weight, weightUnit, parcelWeight, parcelWeightUnit, volume, volumeUnit, dimension, dimensionUnit, parcelDimension, parcelDimensionUnit, area, areaUnit, governmentChargeApplicable, governmentCharge, governmentChargeDescription, governmentChargeRegNo, extraChargeApplicable, extraCharge, extraChargeDescription, processingCapacity, productReturnApplicable, productReturnPolicy, discounts, shopDiscounts, shoppingCount, comments, location, avgRating, numberOfRatings, userRating, ratingOverview, adsFromThisShop } = this.state.ad;
        let dimensionRounded = (dimension && dimension.length) ? [thousandSeparators(twoDecimalPoints(dimension[0])), thousandSeparators(twoDecimalPoints(dimension[1])), thousandSeparators(twoDecimalPoints(dimension[2]))] : null;
        let parcelDimensionRounded = (parcelDimension && parcelDimension.length) ? [thousandSeparators(twoDecimalPoints(parcelDimension[0])), thousandSeparators(twoDecimalPoints(parcelDimension[1])), thousandSeparators(twoDecimalPoints(parcelDimension[2]))] : null;
        const forfor = this.state.ad.for;
        const { isFetchingAd, isAddingToCart, isAddingToWishlist, isBuyingNow, isDeletingComment, isDeletingReply, isSubmittingReport } = this.props;
        const { adID } = this.state;
        const { fatalError, contentUnavailable } = this.state.errorMessage;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-collections-area ptb-60">
                    {isFetchingAd ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingAd} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="items-container shop-details ad-details">
                        <div className="photo-description-info-container">
                            <div className="photo-container">
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
                            <div className="description-container">
                                <h3 className="word-break">{adName && titleCase(adName)}</h3>
                                <span className="report-item cursor-pointer float-right" onClick={() => this.onClickedReport()}>! Report this Ad</span>
                                <div className="shop-availability-div">{(available === "Available") ? <span className="available-span"><span className="dot available-dot"></span>Available</span> : <span className="unavailable-span"><span className="dot unavailable-dot"></span>{available}</span>}</div>
                                <div className="new-price-ad-details word-break">
                                    <span className="ad-price"><span className="currency-sign">৳</span>{(priceFull > 0) ? thousandSeparators(priceFull) : '0'}<span className="price-decimal">{priceDecimal}</span>{originalPrice ? <span className="ad-old-price"> <del>৳{thousandSeparators(twoDecimalPoints(originalPrice))}</del> </span> : ""}{pricePer && <React.Fragment>/{pricePer}</React.Fragment>}</span> {parcelPrice ? <span className="ad-details-parcel-price">+ ৳{thousandSeparators(twoDecimalPoints(parcelPrice))} for shippable product</span> : ""}
                                </div>
                                <div className="product-review">
                                    <div className="rating">
                                        <Rate rating={avgRating} disabled={true} />
                                    </div>
                                    <span className="number-of-comments">{(comments && comments.length) ? thousandSeparators(comments.length) : 0} {(comments && (comments.length > 1)) ? 'Comments' : 'Comment'}</span>
                                </div>
                                
                                <div className="discounts-container">
                                    {discounts && discounts.map((discount, index) => {
                                        return(
                                            <div className="discounts"  key={index}>
                                                Get {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit}  discount {(discount.discountOn && (discount.discountOn === "Shippable Product Price")) ? "on " + discount.discountOn : null}{(discount.minOrder && discount.maxOrder) ? <span> by purchasing {discount.minOrder} {(discount.minOrder > 1) ? "items" : "item"} to {discount.maxOrder} {(discount.maxOrder > 1) ? "items" : "item"}.</span> : <span>{discount.minOrder ? <span> by purchasing {discount.minOrder} {(discount.minOrder > 1) ? "items" : "item"} or more.</span> : <span>{discount.maxOrder ? <span> by purchasing {discount.maxOrder} {(discount.maxOrder > 1) ? "items" : "item"} or less.</span> : null}</span>}</span>}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="discounts-container">
                                    {shopDiscounts && shopDiscounts.map((discount, index) => {
                                        return(
                                            <div className="discounts"  key={index}>
                                                Get {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit}  discount {discount.maxAmount ? "up to " + thousandSeparators(twoDecimalPoints(discount.maxAmount)) + " " + discount.maxAmountUnit : ""} on {discount.discountOn}{(discount.minOrder && discount.maxOrder) ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka to {discount.maxOrder} BDT - Bangladeshi Taka at this shop.</span> : <span>{discount.minOrder ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka or more at this shop.</span> : <span>{discount.maxOrder ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka or less at this shop.</span> : " for any order amount at this shop."}</span>}</span>}
                                            </div>
                                        )
                                    })}
                                </div>

                                <Description description={description} type='ad' />
                                {parcel ? <div className="product-info-btn shipping-availability">
                                    <i className="fas fa-truck fa-truck-shipping"></i> <span className="shipping-available"><b>Shipping Available</b></span>
                                </div> : <div className="product-info-btn" style={{ marginTop: '10px' }}>
                                    <span className="shipping-icon-container"><i className="fa fa-ban"></i><i className="fas fa-truck fa-truck-shipping"></i></span> <span className="shipping-unavailable"><b>Shipping not available</b></span>
                                </div>}
                                
                                {parcel && ((available === "Available")) ? <div className="add-to-cart-container">
                                    {numOfItems && (numOfItems > 0) && numOfItemsPerOrder ? (numOfItemsPerOrder < numOfItems) ? <div className="maximum-per-order">Maximum {thousandSeparators(numOfItemsPerOrder)} per order</div>
                                    : <div className="maximum-per-order">Only {thousandSeparators(numOfItems)} left in stock</div>
                                    : null}
                                    <div className="product-add-to-cart">
                                        <div className="input-counter">
                                            <span className="minus-btn" onClick={this.handleQuantitySubtract}><i className="fas fa-minus"></i></span>
                                            <input type="text" name="quantity" id="quantity" defaultValue="1" onChange={this.handleQuantityChange} />
                                            <span className="plus-btn" onClick={this.handleQuantityAddition}><i className="fas fa-plus"></i></span>
                                        </div>

                                        <button type="button" className="btn btn-primary" disabled={isFetchingAd || isAddingToCart}
                                            onClick={e => {
                                                e.preventDefault(); this.onAddToCart();
                                            }}
                                        ><i className="fas fa-cart-plus"></i> {isAddingToCart ? <Spinner isLoading={isAddingToCart} /> : 'Add to Cart'}</button>
                                    </div>
                                </div>: null}
                                
                                <div className="wishlist-compare-btn add-to-wishlist-container">
                                    <button type="button" className="btn btn-light" disabled={isFetchingAd || isAddingToWishlist} onClick={() => this.onAddToWishlist()}>
                                        <i className="far fa-heart"></i> {isAddingToWishlist ? <Spinner isLoading={isAddingToWishlist} /> : 'Add to Wishlist'}</button>
                                </div>

                                {parcel && (available === "Available") &&
                                    <div className="buy-checkbox-btn buy-now-container">
                                        <div className="item">
                                            <button className="btn btn-primary btn-block" disabled={isFetchingAd || isBuyingNow}
                                                onClick={e => {
                                                    e.preventDefault(); this.onBuyItNow();
                                                }}
                                            >{isBuyingNow ? <Spinner isLoading={isBuyingNow} /> : 'Buy it now!'}</button>
                                        </div>
                                    </div>}
                            </div>
                            <div className="info-container">
                                <table className="table table-bordered info-table">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Ad Info</th>
                                        </tr>
                                        {adID ? <tr>
                                            <td>Ad ID</td>
                                            <td className="word-break">{adID}</td>
                                        </tr> : null}
                                        {brandName && brandName !== "" ? <tr>
                                            <td>Brand Name</td>
                                            <td className="word-break">{brandName}</td>
                                        </tr> : null}
                                        {urlName ? <tr>
                                            <td>Shop</td>
                                            <td className="word-break">
                                                <Link className="display-inline" to={`/shop/${urlName}`}>{shopName}</Link>
                                            </td>
                                        </tr> : null}
                                        {category && <tr>
                                            <td>Category</td>
                                            <td className="word-break">{category}</td>
                                        </tr>}
                                        {subcategory && <tr>
                                            <td>Subcategory</td>
                                            <td className="word-break">{subcategory}</td>
                                        </tr>}
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
                                            <td><a className="check-shop-location" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate.lat},${coordinate.long}/@${coordinate.lat},${coordinate.long},17z`}>Check {urlName ? "Shop" : "Ad"} Location</a></td>
                                        </tr>}
                                        {contactNo && <tr>
                                            <td>Contact No</td>
                                            <td className="word-break">{contactNo}</td>
                                        </tr>}
                                        {parcel ? <tr>
                                            <td>Shopping Count</td>
                                            <td>{shoppingCount ? thousandSeparators(shoppingCount) : 0}</td>
                                        </tr> : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="user-rating">
                            <UserRating rating={userRating} type={'this Ad'} onChange={this.onChangeRating} redirectPath={`/ad/${adID}`} />
                        </div>
                        {(adsFromThisShop && adsFromThisShop.length) ? <React.Fragment>
                            <div className="shop-name-container">
                                <div className="shop-name word-break">Other ads from {shopName}</div>
                                <div className="visit-shop">
                                    <Link className="visit-shop-link" to={`/search-result-of-shop?shopID=${urlName}`}>See all</Link>
                                </div>
                            </div>
                            <div className="ads-slider">
                                <AdSlider ads={adsFromThisShop} showableShopDiscountTag={adsFromThisShop[0].showableDiscountTag} />
                            </div>
                        </React.Fragment> : null}
                        <div className="opening-hours-additional-information-container">
                            <div className="opening-hours-container">
                                <table className="table table-bordered info-table">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Available Hours</th>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="opening-hours-table-container">
                                    <table className="opening-hours">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <WorkingHours openingHours={availableHours} midBreaks={midBreaks} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="additional-information-container">
                                <table className="table table-bordered info-table specifications">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Specifications</th>
                                        </tr>
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
                                        {parcel && parcelWeight && <tr>
                                            <td>Shipping Weight</td>
                                            <td className="word-break">{thousandSeparators(twoDecimalPoints(parcelWeight))} {parcelWeightUnit}</td>
                                        </tr>}
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
                                                        {item.optionName}
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
                                <table className="table table-bordered info-table additional-information">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Additional Information</th>
                                        </tr>
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
                                        {(category !== 'Job' && category !== 'Service' && category !== 'Property' && forfor !== 'Rent') && parcel && productReturnApplicable && <tr>
                                            <td>Product Return Policy</td>
                                            <td className="word-break whitespace-pre-wrap">{(productReturnApplicable === 'Applicable') ? productReturnPolicy ? productReturnPolicy : "Not applicable" : productReturnApplicable}</td>
                                        </tr>}
                                        { avgRating ? <tr>
                                            <td>Rating</td>
                                            <td>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)} {(numberOfRatings > 1) ? "ratings" : "rating"})</td>
                                        </tr> : null }
                                    </tbody>
                                </table>
                            </div>
                            <div className="fill-blank-space"></div>
                        </div>
                        <div className="comment-rating-container">
                            <div className="rating-container">
                                <div className="ratings-overview">
                                    <RatingOverview numberOfRatings={numberOfRatings} avgRating={avgRating} ratingOverview={ratingOverview} />
                                </div>
                            </div>
                            <div className="comments-container">
                                <div className="comments">
                                    <Comments comments={comments} onReply={this.onReply} onComment={this.onComment} onDeleteComment={this.onDeleteComment} onDeleteReply={this.onDeleteReply} canMakeChanges={true} />
                                </div>
                            </div>
                        </div>
                    </div>}
                </section>}
                <Modal
                    title="Report Ad"
                    visible={this.state.reportModal}
                    onOk={this.onCloseReportModal}
                    onClose={this.onCloseReportModal}
                    closable={true}
                >
                    <Report isSubmittingReport={isSubmittingReport} onReportSubmitted={this.reportSubmitted} reportError={this.state.fatalErrorForm || this.state.authErrorForm} />

                </Modal>
                <Modal
                    title="Buying Options"
                    visible={this.state.buyOptions}
                    onOk={this.handleOkBuyOptions}
                    onClose={this.onCloseBuyOptions}
                    closable={true}
                >
                    <BuyOptions options={options} onOptionsSubmitted={this.onOptionsSubmitted} />

                </Modal>
                <Modal
                    title={this.state.modalTitle}
                    visible={this.state.showModal}
                    onClose={this.onCloseModal}
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
                                onClick={this.onCloseModal}
                            >
                                OK
                            </button>
                        ]
                    }
                >
                    {this.state.modalMessage}
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
            </React.Fragment>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        isFetchingAd: createLoadingSelector(['FETCH_AD'])(state),
        isAddingToCart: createLoadingSelector(['ADD_TO_CART'])(state),
        isAddingToWishlist: createLoadingSelector(['ADD_TO_WISHLIST'])(state),
        isBuyingNow: createLoadingSelector(['BUY_NOW'])(state),
        isRating: createLoadingSelector(['RATE_AD'])(state),
        isPostingComment: createLoadingSelector(['AD_COMMENT'])(state),
        isPostingReply: createLoadingSelector(['AD_REPLY'])(state),
        isDeletingComment: createLoadingSelector(['AD_COMMENT_DELETE'])(state),
        isDeletingReply: createLoadingSelector(['AD_REPLY_DELETE'])(state),
        isSubmittingReport: createLoadingSelector(['AD_REPORT'])(state),
        auth: state.auth,
        details: state.details,
        adReducer: state.adReducer,
        cartData: state.cartData,
        buyNowData: state.buyNowData,
        wishlistData: state.wishlistData,
        reportDetails: state.reportReducer,
        selectedOptions: getFormValues('options-form')(state)
    };
}

export default connect(mapStateToProps, { fetchAd, addToCart, addToWishlist, buyNow, rateAd, adComment, adReply, adCommentDelete, adReplyDelete, reportAd })(AdDetails);
