import React from 'react'
import { Link } from 'react-router-dom';

import Spinner from '../Common/Spinner';
import { truncate, thousandSeparators } from '../../services/common';
import dummy from '../../img/NoPhotoAvailable/../../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import { bucketUrl } from '../../constants/urls/bucket';

class DemoSingleAdBox extends React.Component {

    renderImage = (photo) => {
        if (photo) {
            return (
                <React.Fragment>
                    <img src={bucketUrl + "photos/demoPhotos/photo-320/" + photo.replace("#","%23")} loading="lazy" alt="" />
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

    renderAdminButton = () => {
        const { listedDemoAds, ongoingListModification, isModifyingList } = this.props;
        const { ad } = this.props;
        let isModifying = false;
        if(ongoingListModification && ongoingListModification.length) {
            let index = ongoingListModification.findIndex(a => a === ad.adID);
            if(index > -1) {
                isModifying = true;
            }
        }
        if (listedDemoAds && listedDemoAds.length > 0) {
            if (listedDemoAds.find(a => a === ad.adID)) {
                return <button className="btn more-similar-ads list-remove-button-demo-ad" onClick={() => this.props.onRemoveFromList(ad.adID)}><Spinner isLoading={isModifyingList && isModifying} /> &nbsp;Remove from List</button>;
            }
        }
        return <button className="btn btn-light more-similar-ads" onClick={() => this.props.onAddToList(ad.adID)}><Spinner isLoading={isModifyingList && isModifying} /> &nbsp;Add to List</button>;
    }

    render() {
        const { ad, redirectUrl, attachDemoAd } = this.props;
        const { price, adName, description, adID, pricePer, photo } = ad;
        const price100 = price * 100;
        const priceFull = price ? Math.floor(price) : null;
        const priceDecimal = Math.floor(price100 - (priceFull * 100)) ? Math.floor(price100 - (priceFull * 100)) : '00';
        return (
            <div className="col-lg-4 col-md-6 products-col-item">
                <div className="single-product-box word-break">
                    <Link to={redirectUrl}>
                        <div className="product-image">
                            {this.renderImage(photo)}
                        </div>
                        <div className="product-content">
                            <h3>
                                {truncate(adName, 25)}
                            </h3>
                            <div className="product-price">
                                <span className="new-price">৳{(priceFull > 0) ? thousandSeparators(priceFull) : '0'}<sup>{priceDecimal}</sup>{pricePer && <React.Fragment>/{pricePer}</React.Fragment>}</span>
                            </div>
                            <div className="product-descrption" style={{ marginBottom: '10px' }}>
                                <span className="word-break">{truncate(description, 65)}</span>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="product-bottom-button">
                    <Link className="btn btn-light more-similar-ads" to={{
                        pathname: '/account/create-ad',
                        state: {
                            demoAdId: adID
                        }
                    }}>
                        Attach to the Account
                    </Link>
                </div>

                {attachDemoAd ? <div className="product-bottom-button">
                    {this.renderAdminButton()}
                </div> : ''}
            </div>
        )
    }
}

export default DemoSingleAdBox;