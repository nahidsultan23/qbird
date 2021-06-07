import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { titleCase } from "title-case";
import Modal from 'rc-dialog';

import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import { fetchDemoAd, deleteDemoAd } from '../store/actions/demoAdActions';
import Spinner from '../components/Common/Spinner';
import AccountTab from '../components/HOC/AccountTab';
import Description from '../components/Common/Description';
import { twoDecimalPoints, thousandSeparators } from '../services/common';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { bucketUrl } from '../constants/urls/bucket';

class DemoAdDetailsComp extends React.Component {

    state = {
        ad: {},
        nav1: null,
        nav2: null,
        permissions: {},
        adID: null,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    openTabSection = (evt, tabNmae) => {
        let mainTabs = ["profileLink", "credentialsLink", "ordersLink", "adsLink", "demoAdsLink", "salesLink", "deliveriesLink"];
        let i, tablinks;
        const tabs = ['specification'];
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

        document.getElementById(tabNmae).style.display = "block";
        document.getElementById(tabNmae).className += " fadeInUp animated";
        evt.currentTarget.className += "current";
    }

    componentDidMount() {
        const { match } = this.props;
        const { adID } = match.params;
        this.props.fetchDemoAd({ adID: adID }).then(() => {
            const { status, permissions, errorMessage } = this.props.demoAdData.payload;

            if(status === "success") {
                this.setState({
                    ad: this.props.demoAdData.payload,
                    permissions: permissions,
                    adID: adID
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
                            <img src={bucketUrl + "photos/demoPhotos/photo-640/" + photo.replace("#","%23")} loading="lazy" alt="" />
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

    deleteDemoAd = () => {
        const adID = this.state.adID;
        this.props.deleteDemoAd({ adID: adID }).then(() => {
            const { status, errorMessage } = this.props.demoAdData.payload;

            if(status !== "success") {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showDeleteModal: false,
                    showErrorModal: true,
                    errorModalMessage: 'Demo Ad was not deleted. ' + message
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

    render() {
        const { adName, brandName, price, parcelPrice, specifications, expiryTime, options, category, subcategory, description, weight, weightUnit, parcelWeight, parcelWeightUnit, volume, volumeUnit, dimension, dimensionUnit, parcelDimension, parcelDimensionUnit } = this.state.ad;
        let dimensionRounded = (dimension && dimension.length) ? [thousandSeparators(twoDecimalPoints(dimension[0])), thousandSeparators(twoDecimalPoints(dimension[1])), thousandSeparators(twoDecimalPoints(dimension[2]))] : null;
        let parcelDimensionRounded = (parcelDimension && parcelDimension.length) ? [thousandSeparators(twoDecimalPoints(parcelDimension[0])), thousandSeparators(twoDecimalPoints(parcelDimension[1])), thousandSeparators(twoDecimalPoints(parcelDimension[2]))] : null;
        const { adID } = this.state;
        const { createDemoAd } = this.state.permissions;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { isFetchingDemoAd, isDeletingDemoAd } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-details-area">
                    {isFetchingDemoAd ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingDemoAd} /> &nbsp;Fetching...
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
                                        <h3 className="word-break">{adName && titleCase(adName)}</h3>
                                    </div>
                                    <div>
                                        <h3>
                                            <small>
                                                {createDemoAd && <span className="delete-shop-and-ad cursor-pointer float-right" onClick={() => this.setState({ showDeleteModal: true })}><i className="far fa-trash-alt"></i></span>}
                                                {createDemoAd && <Link className="float-right attach-ad-to-shop" to={{ pathname: `/account/demo-ads/${adID}/update-demo-ad` }} title="Edit Ad Info"><i className="fa fa-pencil-alt"></i>&nbsp;</Link>}
                                                <Link className="float-right" to={{ pathname: '/account/create-ad', state: { demoAdId: adID } }} title="Attach Ad to the Account"><i className="fa fa-paperclip"></i></Link>
                                            </small>
                                        </h3>
                                    </div>
                                    <div className="new-price-ad-details word-break">
                                        <span className="ad-price">৳{thousandSeparators(priceFull)}<sup>{priceDecimal}</sup></span> {parcelPrice ? <span className="ad-details-parcel-price">+ ৳{thousandSeparators(twoDecimalPoints(parcelPrice))} for shippable product</span> : ""}
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
                                                <li onClick={(e) => { e.preventDefault(); this.openTabSection(e, 'specification') }} className="current">
                                                    <span className="tabs-nav-text">
                                                        <div className="dot"></div> Specification</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="col-lg-12 col-md-12">
                                            <div className="tab_content auth-tab-content">
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
                                                                    {weight && weight !== "" ? <tr>
                                                                        <td>Weight</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(weight))} {weightUnit}</td>
                                                                    </tr> : null}
                                                                    {volume && volume !== "" && <tr>
                                                                        <td>Volume</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(volume))} {volumeUnit}</td>
                                                                    </tr>}
                                                                    {dimension && dimension.length > 0 && <tr>
                                                                        <td>Dimension (L x W x H)</td>
                                                                        <td className="word-break">{dimensionRounded.join(' x ')} {dimensionUnit}</td>
                                                                    </tr>}
                                                                    {parcelWeight && <tr>
                                                                        <td>Shipping Weight</td>
                                                                        <td className="word-break">{thousandSeparators(twoDecimalPoints(parcelWeight))} {parcelWeightUnit}</td>
                                                                    </tr>}
                                                                    {parcelDimension && parcelDimension.length > 0 && <tr>
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
                                                                                                <div key={item.optionName + childItem.option}><span className="dot option-dot"></span>{childItem.option}, Price: ৳{thousandSeparators(twoDecimalPoints(childItem.extraPrice))}, Weight: {thousandSeparators(twoDecimalPoints(childItem.extraWeight))} {childItem.extraWeightUnit}</div>
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
                                    onClick={this.deleteDemoAd}
                                >
                                    <Spinner isLoading={isDeletingDemoAd} /> &nbsp;Delete
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to delete this Demo Ad?
                    </Modal>
                </section>}
            </React.Fragment>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        isFetchingDemoAd: createLoadingSelector(['FETCH_DEMO_AD'])(state),
        isDeletingDemoAd: createLoadingSelector(['DEMO_AD_DELETE'])(state),
        demoAdData: state.demoAdReducer
    };
}

const DemoAdDetails = AccountTab(DemoAdDetailsComp, "demoAds");
export default connect(mapStateToProps, { fetchDemoAd, deleteDemoAd })(DemoAdDetails)