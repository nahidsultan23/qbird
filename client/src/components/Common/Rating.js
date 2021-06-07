import React from 'react';
import Rating from 'react-rating';

class Rate extends React.Component {

    state = {
        rating: 0
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.rating !== this.state.rating) {
            this.setState({ rating: nextProps.rating });
        }
    }

    componentDidMount() {
        this.setState({ disabled: this.props.disabled });
    }

    render() {
        const { rating, disabled } = this.state;
        return (
            <Rating
                emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                initialRating={rating}
                readonly={disabled}
                onChange={this.props.onChange} />
        )
    }
}

export default Rate;