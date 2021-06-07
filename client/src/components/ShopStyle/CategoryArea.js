import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel2';
import { connect } from 'react-redux';

import { thousandSeparators } from '../../services/common';
import { bucketUrl } from '../../constants/urls/bucket';

const options = {
    loop: true,
    nav: true,
    dots: false,
    autoplayHoverPause: true,
    autoplay: true,
    navText: [
        "<i class='fas fa-chevron-left'></i>",
        "<i class='fas fa-chevron-right'></i>"
    ],
    responsive: {
        0: {
            items: 1,
        },
        221: {
            items: 2,
        },
        301: {
            items: 3,
        },
        561: {
            items: 4,
        },
        701: {
            items: 5,
        },
        841: {
            items: 6,
        },
        981: {
            items: 7,
        },
        1121: {
            items: 8,
        },
        1261: {
            items: 9,
        },
        1401: {
            items: 10,
        }
    }
}

class CategoryArea extends Component {

    state = {
        display: false,
        panel: true
    };

    componentDidMount() {
        this.setState({ display: true })
    }

    renderPhoto = (photo) => {
        if(photo) {
            return `${bucketUrl}photos/homePhotos/${photo.replace("#","%23")}`
        } else {
            return require('../../img/NoPhotoAvailable/262x262.png')
        }
    }

    renderSliderDetails = (index) => {
        const { data } = this.props;
        if (data && data[index]) {
            const { categoryName, numberOfItems, photo } = data[index];
            return (
                <React.Fragment>
                    <img src={this.renderPhoto(photo)} loading="lazy" alt="" />
                    <div className="offer-content">
                        <div className="category-name">{categoryName}</div>
                        <div className="number-of-items">{thousandSeparators(numberOfItems)} {(numberOfItems > 1) ? "Items" : "Item"}</div>
                    </div>
                    <Link to={`/search-result?category=${categoryName}`}></Link>
                </React.Fragment>
            );
        }
    }

    render() {
        return (
            <section className="products-collections-area ptb-60">
                <div className="items-container">
                    <div className="homepage-slider-area-container">
                        <div className="homepage-portion-heading">
                            Categories
                        </div>
                        <div className="categories-container">
                            {this.state.display ? <OwlCarousel
                                className="offer-slides owl-carousel owl-theme"
                                options={options}
                            >
                                <div className="category" key={0}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(0)}
                                    </div>
                                </div>

                                <div className="category" key={1}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(1)}
                                    </div>
                                </div>

                                <div className="category" key={2}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(2)}
                                    </div>
                                </div>

                                <div className="category" key={3}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(3)}
                                    </div>
                                </div>

                                <div className="category" key={4}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(4)}
                                    </div>
                                </div>

                                <div className="category" key={5}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(5)}
                                    </div>
                                </div>

                                <div className="category" key={6}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(6)}
                                    </div>
                                </div>

                                <div className="category" key={7}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(7)}
                                    </div>
                                </div>
                                
                                <div className="category" key={8}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(8)}
                                    </div>
                                </div>

                                <div className="category" key={9}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(9)}
                                    </div>
                                </div>

                                <div className="category" key={10}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(10)}
                                    </div>
                                </div>

                                <div className="category" key={11}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(11)}
                                    </div>
                                </div>

                                <div className="category" key={12}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(12)}
                                    </div>
                                </div>

                                <div className="category" key={13}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(13)}
                                    </div>
                                </div>

                                <div className="category" key={14}>
                                    <div className="single-offer-box">
                                        {this.renderSliderDetails(14)}
                                    </div>
                                </div>
                            </OwlCarousel> : ''}
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.home.payload.secondSlider
    }
}

export default connect(mapStateToProps)(CategoryArea);