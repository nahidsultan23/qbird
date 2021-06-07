import React from 'react'
import { Link } from 'react-router-dom';
import Rating from 'react-rating';

import dummy from '../../img/NoPhotoAvailable/../../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import { getDistance, truncate } from '../../services/common';
import { bucketUrl } from '../../constants/urls/bucket';


class SingleShopBox extends React.Component {

    state = {
        shop: {},
        meta: {},
        showName: true,
        showAdsCount: true,
        showDescription: true,
        showRating: true,
        showDistance: false,
        detailLink: '/'
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
            shop: this.props.shop,
            meta: this.props.meta,
            showName: this.props.showName === undefined ? this.state.showName : this.props.showName,
            showAdsCount: this.props.showAdsCount === undefined ? this.state.showAdsCount : this.props.showAdsCount,
            showDescription: this.props.showDescription === undefined ? this.state.showDescription : this.props.showDescription,
            showRating: this.props.showRating === undefined ? this.state.showRating : this.props.showRating,
            showDistance: this.props.showDistance === undefined ? this.state.showDistance : this.props.showDistance,
            detailLink: this.props.detailLink
        })
    }

    renderAdsCount = (numberOfAds) => {
        if (numberOfAds && Number(numberOfAds) > 0) {
            return (
                <div className="unit-shop-box-num-of-ads" title='Shop Ads'>{numberOfAds} {numberOfAds > 1 ? 'Ads' : 'Ad'}</div>);
        }
    }

    render() {
        const { shop, showName, showRating, showDistance, detailLink } = this.state;
        const { shopName, rating, numberOfAds, distance, showableDiscountTag, photo } = shop;
        return (
            <div className="unit-ad-box-container">
                <div className="unit-ad-box word-break">
                    <Link to={detailLink}>
                        <div className="unit-ad-box-photo">
                            {showableDiscountTag ? <h6 className="vc">{showableDiscountTag}</h6> : ""}
                            {this.renderImage(photo)}
                            {this.renderAdsCount(numberOfAds)}
                        </div>
                        <div className="unit-ad-box-description">
                            {showName === true ? <div className="unit-ad-box-name">
                                {truncate(shopName, 25)}
                            </div> : null}
                            {showRating === true ? <div className="unit-ad-box-rating">
                                <Rating
                                    emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                                    fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                                    initialRating={rating}
                                    readonly={true} />
                            </div> : null}
                            {showDistance === true ? <div className="distance">
                                <span>{(distance || (distance === 0)) ? getDistance(distance) + ' away' : ''}</span>
                            </div> : ""}
                        </div>
                    </Link>
                </div>
            </div>
        );
    }
}

export default SingleShopBox;