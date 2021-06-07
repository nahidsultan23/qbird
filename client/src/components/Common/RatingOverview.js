import React from 'react'
import Rating from 'react-rating';

import { thousandSeparators, twoDecimalPoints } from '../../services/common';

class RatingOverview extends React.Component {
    render() {
        const { numberOfRatings, avgRating, ratingOverview} = this.props;
        return (
            <div className="rating-overview">
                <div className="rating-overview-title">Customer ratings</div>
                <div className="rating-and-rating-details">
                    <div className="rating">
                        <Rating
                            emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                            fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                            initialRating={avgRating}
                            readonly={true} />
                    </div>
                    <div className="rating-details">
                        {twoDecimalPoints(avgRating)} out of 5
                    </div>
                </div>
                <div className="number-of-ratings">
                    {thousandSeparators(numberOfRatings)} {(numberOfRatings > 1) ? "ratings" : "rating"}
                </div>
                <div className="rating-visualization-container">
                    <div className="rating-visualization">
                        <div className="star-count">5 star</div>
                        <div className="rating-bar-container">
                            <div className="rating-bar-outside">
                                <div className="rating-bar" style={(ratingOverview && ratingOverview.five > 0) ? (ratingOverview.five === 100) ? {width: "100%", borderRadius: "7px"} : {width: ratingOverview.five + "%"} : {display: "none"}}></div>
                            </div>
                        </div>
                        <div className="rating-percentage">{ratingOverview ? ratingOverview.five : 0}%</div>
                    </div>
                    <div className="rating-visualization">
                        <div className="star-count">4 star</div>
                        <div className="rating-bar-container">
                            <div className="rating-bar-outside">
                                <div className="rating-bar" style={(ratingOverview && ratingOverview.four > 0) ? (ratingOverview.four === 100) ? {width: "100%", borderRadius: "7px"} : {width: ratingOverview.four + "%"} : {display: "none"}}></div>
                            </div>
                        </div>
                        <div className="rating-percentage">{ratingOverview ? ratingOverview.four : 0}%</div>
                    </div>
                    <div className="rating-visualization">
                        <div className="star-count">3 star</div>
                        <div className="rating-bar-container">
                            <div className="rating-bar-outside">
                                <div className="rating-bar" style={(ratingOverview && ratingOverview.three > 0) ? (ratingOverview.three === 100) ? {width: "100%", borderRadius: "7px"} : {width: ratingOverview.three + "%"} : {display: "none"}}></div>
                            </div>
                        </div>
                        <div className="rating-percentage">{ratingOverview ? ratingOverview.three : 0}%</div>
                    </div>
                    <div className="rating-visualization">
                        <div className="star-count">2 star</div>
                        <div className="rating-bar-container">
                            <div className="rating-bar-outside">
                                <div className="rating-bar" style={(ratingOverview && ratingOverview.two > 0) ? (ratingOverview.two === 100) ? {width: "100%", borderRadius: "7px"} : {width: ratingOverview.two + "%"} : {display: "none"}}></div>
                            </div>
                        </div>
                        <div className="rating-percentage">{ratingOverview ? ratingOverview.two : 0}%</div>
                    </div>
                    <div className="rating-visualization">
                        <div className="star-count">1 star</div>
                        <div className="rating-bar-container">
                            <div className="rating-bar-outside">
                                <div className="rating-bar" style={(ratingOverview && ratingOverview.one > 0) ? (ratingOverview.one === 100) ? {width: "100%", borderRadius: "7px"} : {width: ratingOverview.one + "%"} : {display: "none"}}></div>
                            </div>
                        </div>
                        <div className="rating-percentage">{ratingOverview ? ratingOverview.one : 0}%</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default RatingOverview;