import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { general } from '../store/actions/authActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';

class MessageSendSuccess extends Component {

    state = {
        redirectedFrom: null,
        errorMessage: {
            fatalError: null
        }
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.general().then(() => {
            const { fatalError } = this.props.auth.payload.errorMessage;
            this.setState({
                errorMessage: {
                    fatalError: fatalError
                }
            });
        });

        const { state } = this.props.location;
        if (state && state.redirectedFrom) {
            this.setState({
                redirectedFrom: state.redirectedFrom
            });
        }
    }

    render() {
        const { redirectedFrom } = this.state;
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : redirectedFrom ?
                <section className="signup-area ptb-60">
                    <div className="container">
                        <div className="signup-content">
                            <div className="section-title">
                                <h2>Thank you for contacting us. Complaints and feedbacks from you help us to improve our products and services. One of our agents will contact you soon. Check your email inbox for further communication.</h2>
                            </div>
                            <div className="col-lg-12 text-center">
                                <Link type="button" className="btn btn-primary" to={'/'}>Home</Link>
                            </div>
                            <br />
                            <div className="col-lg-12 text-center">
                                <Link type="button" className="btn btn-primary" to={'/account'}>Profile</Link>
                            </div>
                        </div>
                    </div>
                </section> : <NoContentFound />}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
}
export default connect(mapStateToProps, { general })(MessageSendSuccess);