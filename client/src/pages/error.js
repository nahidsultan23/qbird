import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { general } from '../store/actions/authActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class Error extends Component {

    state = {
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.general();
    }

    render() {
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <section className="error-area ptb-60">
                    <div className="container">
                        <div className="error-content">
                            <h3>Page Not Found!!</h3>
                            <p>The page you are looking for might have been removed, had its name changed or, is temporarily unavailable.</p>

                            <Link to={'/'} className="btn btn-light">Visit Home
                            </Link>
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth
    }
}

export default connect(mapStateToProps, { general })(Error);
