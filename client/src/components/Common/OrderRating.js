import React from 'react';
import Rating from 'react-rating';

class OrderRating extends React.Component {

    state = {
        rating: 0
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.rating !== this.state.rating) {
            this.setState({ rating: nextProps.rating });
        }
    }

    onChange = (newRating) => {
        this.props.onChange(this.props.type, this.props.itemID, newRating);
    }

    render() {
        const { rating } = this.state;
        return (
            <Rating
                emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                initialRating={rating}
                onChange={(e) => this.onChange(e)} />
        )
    }
}

export default OrderRating;