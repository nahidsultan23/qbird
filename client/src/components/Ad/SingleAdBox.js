import React from 'react'
import { Link } from 'react-router-dom';
import Rating from 'react-rating';

import dummy from '../../img/NoPhotoAvailable/../../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import { getDistance, truncate, thousandSeparators, twoDecimalPoints } from '../../services/common';
import { bucketUrl } from '../../constants/urls/bucket';

class SingleAdBox extends React.Component {

    state = {
        ad: {},
        meta: {},
        showName: true,
        showDescription: true,
        showPrice: true,
        showRating: true,
        showDistance: false,
        showSimilarAds: false,
        showAddToCart: false,
        detailLink: '/'
    }

    getUrl = (shopID, meta, matchingAdsNumber) => {
        if (meta) {
            const { category, forfor, filterCondition, searchString } = meta;
            let url = `/search-result-of-shop?shopID=${shopID}`;
            if (category && category !== "")
                url += `&category=${category}`;
            if (forfor && forfor !== "")
                url += `&for=${forfor}`;
            if (filterCondition && filterCondition !== "")
                url += `&condition=${filterCondition}`;
            if (searchString && searchString !== "")
                url += `&searchString=${searchString}`;
        return <Link to={url} className="more-similar-ads">{thousandSeparators(matchingAdsNumber)} more similar {(matchingAdsNumber > 1) ? 'ads' : 'ad'} from this shop</Link>
        }
    }


    renderImage = (photo) => {
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

    componentDidMount() {
        this.setState({
            ad: this.props.ad,
            meta: this.props.meta,
            showName: this.props.showName === undefined ? this.state.showName : this.props.showName,
            showDescription: this.props.showDescription === undefined ? this.state.showDescription : this.props.showDescription,
            showPrice: this.props.showPrice === undefined ? this.state.showPrice : this.props.showPrice,
            showRating: this.props.showRating === undefined ? this.state.showRating : this.props.showRating,
            showDistance: this.props.showDistance === undefined ? this.state.showDistance : this.props.showDistance,
            showSimilarAds: this.props.showSimilarAds === undefined ? this.state.showSimilarAds : this.props.showSimilarAds,
            showAddToCart: this.props.showAddToCart === undefined ? this.state.showAddToCart : this.props.showAddToCart,
            detailLink: this.props.detailLink
        })
    }

    render() {
        const { ad, meta, showName, showPrice, showRating, showDistance, showSimilarAds, detailLink } = this.state;
        const { price, originalPrice, adName, shopName, pricePer, condition, matchingAdsNumber, rating, distance, shopID, urlName, showableDiscountTag, showableShopDiscountTag, photo } = ad;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        return (
            <div className="unit-ad-box-container">
                <div className="unit-ad-box word-break">
                    <Link to={detailLink}>
                        <div className="unit-ad-box-photo">
                            {showableDiscountTag ? <h6 className="vc">{showableDiscountTag}</h6> : ""}
                            {(showableDiscountTag && showableShopDiscountTag) ? <h6 className="vc-shop">{showableShopDiscountTag}</h6> : showableShopDiscountTag ? <h6 className="vc">{showableShopDiscountTag}</h6> : ""}
                            {condition && condition !== 'New' ? <div className="unit-ad-box-condition">
                                {condition}
                            </div> : null}
                            {this.renderImage(photo)}
                        </div>
                        <div className="unit-ad-box-description">
                            {showName === true ? <div className="unit-ad-box-name">
                                    {truncate(adName, 25)}
                            </div> : null}
                            {shopName ? <div className="unit-ad-box-shop-name">
                                    by {truncate(shopName, 25)}
                            </div> : null}
                            {showRating === true ? <div className="unit-ad-box-rating">
                                <Rating
                                    emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                                    fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                                    initialRating={rating}
                                    readonly={true} />
                            </div> : null}
                            {showPrice === true ? <div className="unit-ad-box-price">
                                <span className="currency-sign">৳</span><span className="new-price">{(priceFull > 0) ? thousandSeparators(priceFull) : '0'}</span><span className="price-decimal">{priceDecimal}</span>{originalPrice ? <span className="old-price">৳{thousandSeparators(twoDecimalPoints(originalPrice))}</span> : null} {pricePer ? <span className="per-time">/{pricePer}</span> : null}
                            </div> : ""}
                            {showDistance === true ? <div className="distance">
                                <span>{(distance || (distance === 0)) ? getDistance(distance) + ' away' : ''}</span>
                            </div> : ""}
                        </div>
                    </Link>
                    {(showSimilarAds === true && shopID && matchingAdsNumber > 0) ? <div className="more-similar-ads-container">
                        {shopID && matchingAdsNumber > 0 ? this.getUrl(urlName, meta, matchingAdsNumber) : ''}
                    </div> : ""}
                </div>
            </div>
        );
    }
}

export default SingleAdBox;