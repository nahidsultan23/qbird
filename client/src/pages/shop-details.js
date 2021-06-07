import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { titleCase } from "title-case";
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import WorkingHours from '../components/Common/WorkingHours';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchShop } from '../store/actions/detailsActions';
import { shopComment, shopReply, rateShop, shopCommentDelete, shopReplyDelete } from '../store/actions/shopActions';
import { reportShop } from '../store/actions/reportActions';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import RatingOverview from '../components/Common/RatingOverview';
import Comments from '../components/Common/Comments';
import Rate from '../components/Common/Rating';
import Spinner from '../components/Common/Spinner';
import UserRating from '../components/Common/UserRating';
import AdSlider from '../components/Slider/AdSlider';
import Description from '../components/Common/Description';
import { twoDecimalPoints, thousandSeparators } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';
import Report from '../components/Modal/Report';
import history from '../history';
import { bucketUrl } from '../constants/urls/bucket';

class ShopDetails extends React.Component {

    state = {
        shop: {},
        nav1: null,
        nav2: null,
        shopId: null,
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

    componentDidMount() {
        const { match } = this.props;
        const { shopID } = match.params;
        this.setState({ shopID: shopID });
        this.props.fetchShop({ urlName: shopID }).then(() => {
            const { status, errorMessage } = this.props.details.payload;

            if(status === 'success') {
                this.setState({ shop: this.props.details.payload });
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

    onCloseModal = () => {
        this.setState({ showModal: false });
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

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.shopDetails !== nextProps.shopDetails) {
            this.setState({
                shop: nextProps.shopDetails,
            });
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
                    pathname: `/shop/${this.state.shopID}`
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
        const { shopID } = this.state;
        this.props.reportShop({urlName: shopID, subject, otherSubject, comment}).then(() => {
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

    onChangeRating = (newRating) => {
        const { shopID } = this.state;
        this.props.rateShop({ urlName: shopID, rating: newRating }).then(() => {
            const { status, avgRating, userRating, numberOfRatings, ratingOverview, errorMessage } = this.props.shopReducer.payload;
            if(status === 'success') {
                this.setState({
                    shop: {
                        ...this.state.shop,
                        avgRating: avgRating,
                        userRating: userRating,
                        numberOfRatings: numberOfRatings,
                        ratingOverview: ratingOverview
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

    onComment = (message) => {
        const { shopID } = this.state;
        this.props.shopComment({ urlName: shopID, comment: message }).then(() => {
            const { status, comments, errorMessage } = this.props.shopReducer.payload;
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
            const { status, comments, errorMessage } = this.props.shopReducer.payload;
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
            const { status, comments, errorMessage } = this.props.shopReducer.payload;
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
            const { status, comments, errorMessage } = this.props.shopReducer.payload;
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
        const { category, subcategory, contactNo, active, shopName, description, coordinate, address, instruction, openingHours, midBreaks, governmentCharge, governmentChargeDescription, governmentChargeRegNo, extraCharge, extraChargeDescription, processingCapacity, productReturnApplicable, productReturnPolicy, avgRating, discounts, showableDiscountTag, numberOfRatings, userRating, comments, shoppingCount, location, numberOfAds, ads, ratingOverview } = this.state.shop;
        const { shopID } = this.state;
        const { fatalError, contentUnavailable } = this.state.errorMessage;
        const { isDeletingComment, isDeletingReply, isSubmittingReport, isFetchingShop } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-collections-area ptb-60">
                    {isFetchingShop ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingShop} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="items-container shop-details">
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
                                <h3 className="word-break">{shopName && titleCase(shopName)}</h3>
                                <span className="report-item cursor-pointer float-right" onClick={() => this.onClickedReport()}>! Report this Shop</span>
                                <div className="shop-availability-div">{(active === "Open") ? <span className="available-span"><span className="dot available-dot"></span>Open</span> : <span className="unavailable-span"><span className="dot unavailable-dot"></span>{active}</span>}</div>
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
                                                Get {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit}  discount {discount.maxAmount ? "up to " + thousandSeparators(twoDecimalPoints(discount.maxAmount)) + " " + discount.maxAmountUnit : ""} on {discount.discountOn}{(discount.minOrder && discount.maxOrder) ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka to {discount.maxOrder} BDT - Bangladeshi Taka at this shop.</span> : <span>{discount.minOrder ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka or more at this shop.</span> : <span>{discount.maxOrder ? <span> for order amount {discount.minOrder} BDT - Bangladeshi Taka or less at this shop.</span> : " for any order amount at this shop."}</span>}</span>}
                                            </div>
                                        )
                                    })}
                                </div>

                                <Description description={description} type='shop' />
                            </div>
                            <div className="info-container">
                                <table className="table table-bordered info-table">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Shop Info</th>
                                        </tr>
                                        {shopID && <tr>
                                            <td>Shop ID</td>
                                            <td className="word-break">{shopID}</td>
                                        </tr>}
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
                                            <td><a className="check-shop-location" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate.lat},${coordinate.long}/@${coordinate.lat},${coordinate.long},17z`}>Check Shop Location</a></td>
                                        </tr>}
                                        {contactNo && <tr>
                                            <td>Contact No</td>
                                            <td className="word-break">{contactNo}</td>
                                        </tr>}
                                        <tr>
                                            <td>Number of Ads</td>
                                            <td>{numberOfAds ? thousandSeparators(numberOfAds) : 0} {numberOfAds > 0 ? <Link className="see-all-ads display-inline" to={`/search-result-of-shop?shopID=${shopID}`}>See all ads</Link> : ''}</td>
                                        </tr>
                                        <tr>
                                            <td>Shopping Count</td>
                                            <td>{shoppingCount ? thousandSeparators(shoppingCount) : 0}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="user-rating">
                            <UserRating rating={userRating} type={'this Shop'} onChange={this.onChangeRating} redirectPath={`/shop/${shopID}`} />
                        </div>
                        {(ads && ads.length) ? <React.Fragment>
                            <div className="shop-name-container">
                                <div className="shop-name">Ads from this shop</div>
                                <div className="visit-shop">
                                    <Link className="visit-shop-link" to={`/search-result-of-shop?shopID=${shopID}`}>See all</Link>
                                </div>
                            </div>
                            <div className="ads-slider">
                                <AdSlider ads={ads} showableShopDiscountTag={showableDiscountTag} />
                            </div>
                        </React.Fragment> : null}
                        <div className="opening-hours-additional-information-container">
                            <div className="opening-hours-container">
                                <table className="table table-bordered info-table">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Opening Hours</th>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="opening-hours-table-container">
                                    <table className="opening-hours">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <WorkingHours openingHours={openingHours} midBreaks={midBreaks} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="additional-information-container">
                                <table className="table table-bordered info-table additional-information">
                                    <tbody>
                                        <tr>
                                            <th colSpan="2">Additional Information</th>
                                        </tr>
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
                    title="Report Shop"
                    visible={this.state.reportModal}
                    onOk={this.onCloseReportModal}
                    onClose={this.onCloseReportModal}
                    closable={true}
                >
                    <Report isSubmittingReport={isSubmittingReport} onReportSubmitted={this.reportSubmitted} reportError={this.state.fatalErrorForm || this.state.authErrorForm} />

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
        isFetchingShop: createLoadingSelector(['FETCH_SHOP'])(state),
        isRating: createLoadingSelector(['RATE_SHOP'])(state),
        isPostingComment: createLoadingSelector(['SHOP_COMMENT'])(state),
        isPostingReply: createLoadingSelector(['SHOP_REPLY'])(state),
        isDeletingComment: createLoadingSelector(['SHOP_COMMENT_DELETE'])(state),
        isDeletingReply: createLoadingSelector(['SHOP_REPLY_DELETE'])(state),
        isSubmittingReport: createLoadingSelector(['SHOP_REPORT'])(state),
        auth: state.auth,
        details: state.details,
        shopReducer: state.shopReducer,
        reportDetails: state.reportReducer
    };
}

export default connect(mapStateToProps, { fetchShop, rateShop, shopComment, shopReply, shopCommentDelete, shopReplyDelete, reportShop })(ShopDetails);