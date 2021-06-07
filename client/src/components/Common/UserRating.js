import React from 'react';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { connect } from 'react-redux';
import Rating from 'react-rating';

import history from '../../history';

class UserRating extends React.Component {

    state = {
        visible: false,
        newRating: 0,
        rating: undefined
    }

    showPopup() {
        const { isAuthenticated } = this.props.auth;
        if (!isAuthenticated) {
            const { redirectPath } = this.props;
            history.push('/log-in', {
                from: {
                    pathname: redirectPath
                }
            });
        } else {
            const { rating } = this.props;
            this.setState({ visible: true, newRating: rating });
        }
    }

    onClose = () => {
        this.setState({ visible: false });
    }

    onChange = (newRating) => {
        this.setState({ newRating: newRating });
    }

    onSubmit() {
        if (this.state.newRating > 0) {
            this.props.onChange(this.state.newRating);
            this.setState({ visible: false });
        }
    }

    renderRateButton() {
        const { isAuthenticated } = this.props.auth;
        const { rating, type } = this.props;
        if (!isAuthenticated)
            return <span className="display-inline cursor-pointer rate-button" onClick={() => this.showPopup()}>Log in to rate</span>;
        else
            return <span className="display-inline cursor-pointer rate-button" onClick={() => this.showPopup()}>{rating ? 'Change' : "Rate " + type}</span>;
    }

    renderRating(rating) {
        if (rating === undefined || rating === null) {
            return (
                <React.Fragment>
                    <span>No rating from you</span>&nbsp;
                    <u>{this.renderRateButton()}</u>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    Your Rating&nbsp;&nbsp;<Rating
                        emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                        fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                        initialRating={rating}
                        readonly={true} />&nbsp;&nbsp;{this.renderRateButton()}
                </React.Fragment >
            )
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.rating !== this.state.rating) {
            this.setState({ rating: nextProps.rating });
            this.forceUpdate()
        }
    }

    componentDidMount() {
        this.setState({ rating: this.props.rating });
    }

    render() {
        const { visible, newRating, rating } = this.state;
        return (
            <React.Fragment>
                {this.renderRating(rating)}
                <Modal
                    title="Rate"
                    visible={visible}
                    onClose={this.onClose}
                    closable={true}
                    footer={
                        <button className="btn btn-primary" type="button" onClick={() => this.onSubmit()}>Submit</button>
                    }>
                    <div className="text-center"><Rating
                        emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                        fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                        initialRating={newRating}
                        onChange={(e) => this.onChange(e)} /></div>
                </Modal>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth
    }
}
export default connect(mapStateToProps)(UserRating);