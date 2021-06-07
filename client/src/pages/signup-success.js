import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { general } from '../store/actions/authActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';

class SignupSuccess extends Component {

    state = {
        from: '/',
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
        if (state && state.from) {
            this.setState({
                from: state.from,
                redirectedFrom: state.redirectedFrom
            });
        }
    }

    render() {
        const { from, redirectedFrom } = this.state;
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : redirectedFrom ?
                <section className="signup-area ptb-60">
                    <div className="container">
                        <div className="signup-content">
                            <div className="section-title">
                                <h2><span className="dot"></span>Registration Successful!!</h2>
                            </div>
                            <div className="col-lg-12 text-center">
                                <Link type="button" className="btn btn-primary" to={'/'}>Home</Link>
                            </div>
                            <br />
                            <div className="col-lg-12 text-center">
                                <Link type="button" className="btn btn-primary" to={'/account'}>Profile</Link>
                            </div>
                            <br />
                            {from && from !== '/' && <div className="col-lg-12 text-center">
                                <Link type="button" className="btn btn-primary" to={from}>Continue from where you left</Link>
                            </div>}
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
export default connect(mapStateToProps, { general })(SignupSuccess);

