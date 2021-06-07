import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel2';
import Rating from 'react-rating';

import { truncate, thousandSeparators, twoDecimalPoints } from '../../services/common';
import dummy from '../../img/NoPhotoAvailable/../../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import { bucketUrl } from '../../constants/urls/bucket';

const options = {
    loop: false,
    nav: true,
    dots: false,
    autoplayHoverPause: true,
    autoplay: false,
    navText: [
        "<i class='fas fa-chevron-left'></i>",
        "<i class='fas fa-chevron-right'></i>"
    ],
    responsive: {
        0: {
            items: 1,
        },
        201: {
            items: 2,
        },
        401: {
            items: 3,
        },
        601: {
            items: 4,
        },
        951: {
            items: 5,
        },
        1201: {
            items: 6,
        },
        1401: {
            items: 7,
        }
    }
}

class AdSlider extends Component {

    state = {
        ads: []
    };

    componentDidMount() {
        const { ads } = this.props;
        this.setState({
            ads: ads
        })
    }

    renderPhoto = (photo) => {
        if (photo) {
            return (
                <React.Fragment>
                    <img src={bucketUrl + "photos/photo-320/" + photo.replace("#","%23")} loading="lazy" alt="" />
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <img src={dummy} alt="" />
                </React.Fragment>
            );
        }
    }

    renderSliderDetails = (ad) => {
        const { showableShopDiscountTag } = this.props;
        const { adID, price, originalPrice, adName, pricePer, condition, rating, showableDiscountTag, photo } = ad;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        return (
            <React.Fragment>
                <Link to={`/ad/${adID}`}>
                    <div className="single-ad-box-photo">
                        {showableDiscountTag ? <h6 className="vc">{showableDiscountTag}</h6> : ""}
                        {(showableDiscountTag && showableShopDiscountTag) ? <h6 className="vc-shop">{showableShopDiscountTag}</h6> : showableShopDiscountTag ? <h6 className="vc">{showableShopDiscountTag}</h6> : ""}
                        {condition && condition !== 'New' ? <div className="unit-ad-box-condition">
                            {condition}
                        </div> : null}
                        {this.renderPhoto(photo)}
                    </div>
                    <div className="single-ad-box-description">
                        <div className="unit-ad-box-name">
                            {truncate(adName, 25)}
                        </div>
                        <div className="unit-ad-box-rating">
                            <Rating
                                emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                                fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                                initialRating={rating}
                                readonly={true} />
                        </div>
                        <div className="unit-ad-box-price">
                            <span className="currency-sign">৳</span><span className="new-price">{(priceFull > 0) ? thousandSeparators(priceFull) : '0'}</span><span className="price-decimal">{priceDecimal}</span>{originalPrice ? <span className="old-price">৳{thousandSeparators(twoDecimalPoints(originalPrice))}</span> : null} {pricePer ? <span className="per-time">/{pricePer}</span> : null}
                        </div>
                    </div>
                </Link>
            </React.Fragment>
        );
    }

    render() {
        const { ads } = this.props;
        return (
            <OwlCarousel
                className="offer-slides owl-carousel owl-theme"
                options={options}
            >
            
                {
                    ads.map((ad, index) => {
                        return(
                            <div className="single-ad-box-container" key={index}>
                                <div className="single-ad-box word-break">
                                    {this.renderSliderDetails(ad)}
                                </div>
                            </div>
                        )
                    })
                }
            </OwlCarousel>
        )
    }
}

export default AdSlider;