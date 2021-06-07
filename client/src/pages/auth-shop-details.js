import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { titleCase } from 'title-case';
import Moment from 'react-moment';
import Modal from 'rc-dialog';

import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchAuthShop, toggleShopStatus, toggleForceOpen, deleteShop, shopComment, shopReply, shopCommentDelete, shopReplyDelete } from '../store/actions/shopActions';
import Spinner from '../components/Common/Spinner';
import WorkingHours from '../components/Common/WorkingHours';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import Rating from '../components/Common/Rating';
import Comments from '../components/Common/Comments';
import AccountTab from '../components/HOC/AccountTab';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import Description from '../components/Common/Description';
import { twoDecimalPoints, thousandSeparators } from '../services/common';
import { bucketUrl } from '../constants/urls/bucket';

class AuthShopDetailsComp extends React.Component {

    state = {
        shop: {},
        nav1: null,
        nav2: null,
        shopID: null,
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
        const tabs = ['additionalInformation', 'comments'];
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
        const { shopID } = match.params;
        this.setState({ shopID: shopID });
        this.props.fetchAuthShop({ urlName: shopID }).then(() => {
            const { status, errorMessage } = this.props.shopData.payload;
            if(status === 'success') {
                this.setState({ shop: this.props.shopData.payload });
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
        if (this.state.shop && this.state.shop.photos && this.state.shop.photos.length > 0) {
            const { photos } = this.state.shop;
            return photos.map((photo, index) => {
                return (
                    <div key={index}>
                        <div className="item">
                            <img src={bucketUrl + "photos/photo-640/" + photo.replace("#","%23")} loading="lazy" alt="" />
                        </div>
                    </div >
                )
            })
        } else {
            return (
                <div key='dummy'>
                    <div className="item">
                        <img src={dummy} alt="" />
                    </div>
                </div >
            )
        }
    }

    onChangeStatus = (shopID) => {
        const { togglingStatus } = this.props;
        if (!togglingStatus) {
            this.setState({ shop: { ...this.state.shop, active: !this.state.shop.active } });
            this.props.toggleShopStatus({ urlName: shopID }).then(r => {
                const { status, forceOpen, publicActiveStatus, errorMessage } = this.props.shopData.payload;
                if(status === "success") {
                    this.setState({
                        shop: { ...this.state.shop, forceOpen, publicActiveStatus}
                    });
                }
                else {
                    const { fatalError, authError } = errorMessage;
                    const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                    this.setState({
                        shop: { ...this.state.shop, active: !this.state.shop.active },
                        showErrorModal: true,
                        errorModalMessage: 'Available status was not changed. ' + message
                    });
                }
            });
        }
    }

    onChangeForceOpen = (shopID) => {
        const { togglingForceOpen } = this.props;
        if(!togglingForceOpen) {
            this.setState({ shop: { ...this.state.shop, forceOpen: !this.state.shop.forceOpen } });
            this.props.toggleForceOpen({ urlName: shopID }).then(r => {
                const { status, active, publicActiveStatus, errorMessage } = this.props.shopData.payload;
                if(status === "success") {
                    this.setState({
                        shop: { ...this.state.shop, active, publicActiveStatus}
                    });
                }
                else {
                    const { fatalError, authError } = errorMessage;
                    const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                    this.setState({
                        shop: { ...this.state.shop, forceOpen: !this.state.shop.forceOpen },
                        showErrorModal: true,
                        errorModalMessage: 'Force open was not changed. ' + message
                    });
                }
            });
        }
    }

    deleteShop = () => {
        const shopID = this.state.shopID;
        this.props.deleteShop({ urlName: shopID }).then(() => {
            this.setState({
                showDeleteModal: false
            });
            const { status, errorMessage } = this.props.shopData.payload;
            if(status !== "success") {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showErrorModal: true,
                    errorModalMessage: 'Shop was not deleted. ' + message
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

    onComment = (message) => {
        const { shopID } = this.state;
        this.props.shopComment({ urlName: shopID, comment: message }).then(() => {
            const { status, comments, errorMessage } = this.props.shopData.payload;
            if(status === 'success') {
                this.setState({
                    shop: {
                        ...this.state.shop,
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
        const { shopID } = this.state;
        this.props.shopReply({ urlName: shopID, reply: message, commentID: commentID }).then(() => {
            const { status, comments, errorMessage } = this.props.shopData.payload;
            if(status === 'success') {
                this.setState({
                    shop: {
                        ...this.state.shop,
                        comments: comments
                    }
                });
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
        const { shopID } = this.state;
        const commentID = this.state.deletingCommentID;
        this.props.shopCommentDelete({ urlName: shopID, commentID: commentID }).then(() => {
            this.setState({
                showCommentDeleteModal: false,
                deletingCommentID: null
            });
            const { status, comments, errorMessage } = this.props.shopData.payload;
            if(status === 'success') {
                this.setState({
                    shop: {
                        ...this.state.shop,
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
        const { shopID } = this.state;
        const commentID = this.state.deletingCommentID;
        const replyID = this.state.deletingReplyID;
        this.props.shopReplyDelete({ urlName: shopID, commentID: commentID, replyID: replyID }).then(() => {
            this.setState({
                showReplyDeleteModal: false,
                deletingCommentID: null,
                deletingReplyID: null
            });
            const { status, comments, errorMessage } = this.props.shopData.payload;
            if(status === 'success') {
                this.setState({
                    shop: {
                        ...this.state.shop,
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
        const { contactNo, shopName, category, subcategory, description, coordinate, address, location, instruction, openingHours, avgRating, numberOfRatings, comments, shoppingCount, numberOfAds, governmentCharge, governmentChargeDescription, governmentChargeRegNo, extraCharge, extraChargeDescription, processingCapacity, productReturnApplicable, productReturnPolicy, midBreaks, discounts, discountTag, active, publicActiveStatus, forceOpen, createdOn, showableDiscountTag } = this.state.shop;
        const { shopID } = this.state;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { isDeletingShop, isDeletingComment, isDeletingReply, isFetchingShop } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-details-area">
                    {isFetchingShop ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingShop} /> &nbsp;Fetching...
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
                                                dots={true}
                                                ref={slider => (this.slider1 = slider)}>
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
                                            <h3 className="word-break">{shopName && titleCase(shopName)}</h3>
                                            <div>
                                                <div className="public-status-headline-div"><span className="public-status-headline">Public status:</span> {(publicActiveStatus === "Open") ? <span className="available-span"><span className="dot available-dot"></span>Open</span> : <span className="unavailable-span"><span className="dot unavailable-dot"></span>{publicActiveStatus}</span>}</div>
                                                <div className="form-check keep-always-open"><input type="checkbox" className="form-check-input keep-always-open-checkbox" checked={forceOpen} onChange={(e) => this.onChangeForceOpen(shopID)} /><span className="keep-always-open-line">Keep always open</span></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3>
                                                <small>
                                                    <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.setState({ showDeleteModal: true })}><i className="far fa-trash-alt"></i></span>
                                                    <Link className="float-right attach-ad-to-shop" to={{ pathname: `/account/ads/shops/${shopID}/update-shop` }} title="Edit Shop Info"><i className="fa fa-pencil-alt"></i>&nbsp;</Link>
                                                    <Link className="float-right" to={{ pathname: `/account/ads/shops/${shopID}/attach-ad` }} title="Attach Ad"><i className="fa fa-paperclip"></i></Link>
                                                </small>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="auth-shop-slider-availability">
                                        <div className="auth-shop-slider">
                                            <label className="switch" title={active === true ? 'Active' : 'Inactive'}>
                                                <input type="checkbox" checked={active ? true : false} onChange={(e) => this.onChangeStatus(shopID)} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        
                                        <div>{active ? <span className="available-span auth-shop-availability">Available</span> : <span className="unavailable-span auth-shop-availability">Unavailable</span>}</div>
                                    </div>
                                    {showableDiscountTag ? <div className="discount-tag-div-shop-details"><h6 className="voucher">{showableDiscountTag}</h6></div> : ""}
                                    {showableDiscountTag ? <div className="more-discount-details-shop-details">For more details about discounts, see "Additional Information" section below</div> : ""}
                                    <div className="rating-comment-counter">
                                        <div className="rating">
                                            <Rating rating={avgRating} disabled={true} />
                                        </div>
                                        <div className="rating-count-auth">
                                            {(comments && comments.length) ? thousandSeparators(comments.length) : 0} {(comments && (comments.length > 1)) ? 'Comments' : 'Comment'}
                                        </div>
                                    </div>
                                    <Description description={description} type='shop' />
                                </div>
                            </div>
                        </div>
                        <div className="row information-tab">
                            <div className="col-lg-12 col-md-12">
                                <div className="tab products-details-tab">
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12">
                                            <ul className="tabs">
                                                <li onClick={(e) => { e.preventDefault(); this.openTabSection(e, 'additionalInformation') }} className="current">
                                                    <span className="tabs-nav-text">
                                                        <div className="dot"></div> Additional Information</span>
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
                                                                    {shopID && <tr>
                                                                        <td>Shop ID</td>
                                                                        <td className="word-break">{shopID}</td>
                                                                    </tr>}
                                                                    <tr>
                                                                        <td>Public URL</td>
                                                                        <td>
                                                                            <div className="display-inline word-break" id="public-url">{`https://qbird.com/shop/${shopID}`}</div> <i className="fa fa-copy copy-public-link" title="Copy Public URL" onClick={() => this.copyUrl()}></i>
                                                                        </td>
                                                                    </tr>
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
                                                                        <td><a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate.lat},${coordinate.long}/@${coordinate.lat},${coordinate.long},17z`}>Check the Shop Location on Google Map</a></td>
                                                                    </tr>}
                                                                    {contactNo && <tr>
                                                                        <td>Contact No</td>
                                                                        <td className="word-break">{contactNo}</td>
                                                                    </tr>}
                                                                    {openingHours && <tr>
                                                                        <td>Opening Hours</td>
                                                                        <td>
                                                                            <WorkingHours openingHours={openingHours} midBreaks={midBreaks} />
                                                                        </td>
                                                                    </tr>}
                                                                    {governmentCharge && governmentCharge !== 0 ? <tr>
                                                                        <td>Government Charge</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(governmentCharge))}% ({governmentChargeDescription})</td>
                                                                    </tr> : null}
                                                                    {governmentCharge && governmentCharge !== 0 ? <tr>
                                                                        <td>Govt. Charge Reg No</td>
                                                                        <td className="word-break">{governmentChargeRegNo}</td>
                                                                    </tr> : null}
                                                                    {extraCharge && extraCharge !== 0 ? <tr>
                                                                        <td>Extra Charge</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(extraCharge))}% ({extraChargeDescription})</td>
                                                                    </tr> : null}
                                                                    {processingCapacity && <tr>
                                                                        <td>Processing Capacity</td>
                                                                        <td className="word-break">{thousandSeparators(processingCapacity)}</td>
                                                                    </tr>}
                                                                    {productReturnApplicable && <tr>
                                                                        <td>Product Return Policy</td>
                                                                        <td className="word-break whitespace-pre-wrap">{(productReturnApplicable === 'Applicable') ? productReturnPolicy : productReturnApplicable}</td>
                                                                    </tr>}
                                                                    {discounts && discounts.length > 0 ? <tr>
                                                                        <td>Discounts</td>
                                                                        <td className="word-break">{discounts.map((discount, index) => {
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
                                                                    {discountTag ? <tr>
                                                                        <td>Discount Tag</td>
                                                                        <td className="word-break">{discountTag}</td>
                                                                    </tr> : null}
                                                                    <tr>
                                                                        <td>Number of Ads</td>
                                                                        <td>{numberOfAds ? thousandSeparators(numberOfAds) : 0} {numberOfAds > 0 ? <button className="see-all-ads"><Link className="display-inline" to={`/account/ads/shops/${shopID}/ads`}>See all ads</Link></button> : ''}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Shopping Count</td>
                                                                        <td>{shoppingCount ? thousandSeparators(shoppingCount) : 0}</td>
                                                                    </tr>
                                                                    { avgRating ? <tr>
                                                                        <td>Rating</td>
                                                                        <td>{twoDecimalPoints(avgRating)} ({thousandSeparators(numberOfRatings)})</td>
                                                                    </tr> : null }
                                                                    {createdOn ? <tr>
                                                                        <td>Created on</td>
                                                                        <td><Moment format="MMM DD, YYYY, hh:mm:ss a">{createdOn}</Moment></td>
                                                                    </tr> : null}
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
                        onOk={this.deleteShop}
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
                                    onClick={this.deleteShop}
                                >
                                    <Spinner isLoading={isDeletingShop} /> &nbsp;Delete
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to delete this Shop? All Ads attached to it will also be deleted.
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
            </React.Fragment >
        )
    }

}


const mapStateToProps = (state) => {
    return {
        togglingStatus: createLoadingSelector(['TOGGLE_SHOP_STATUS'])(state),
        togglingForceOpen: createLoadingSelector(['TOGGLE_FORCE_OPEN'])(state),
        isFetchingShop: createLoadingSelector(['FETCH_AUTH_SHOP'])(state),
        isDeletingShop: createLoadingSelector(['SHOP_DELETE'])(state),
        isPostingComment: createLoadingSelector(['SHOP_COMMENT'])(state),
        isPostingReply: createLoadingSelector(['SHOP_REPLY'])(state),
        isDeletingComment: createLoadingSelector(['SHOP_COMMENT_DELETE'])(state),
        isDeletingReply: createLoadingSelector(['SHOP_REPLY_DELETE'])(state),
        shopData: state.shopReducer
    };
}

const AuthShopDetails = AccountTab(AuthShopDetailsComp, 'ads');

export default connect(mapStateToProps, { fetchAuthShop, toggleShopStatus, toggleForceOpen, deleteShop, shopComment, shopReply, shopCommentDelete, shopReplyDelete })(AuthShopDetails);
