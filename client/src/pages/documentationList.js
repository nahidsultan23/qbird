import React, { Component } from 'react';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class DocumentationList extends Component {

    state = {
        errorMessage: {
            fatalError: null
        }
    };

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
    }

    render() {
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <section className="about-area ptb-60">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-12 col-md-12">
                                <div className="about-content">
                                    <h2>Documentation</h2>

                                    <ul>
                                        <li><p><Link to="/documentation/how-shipping-charges-are-calculated">How Shipping Charges are calculated?</Link></p></li>
                                        <li><p><Link to="/documentation/how-to-reduce-shipping-charges">How to reduce Shipping Charges?</Link></p></li>
                                    </ul>
                                </div>
                            </div>
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
    };
}

export default connect(mapStateToProps, { general })(DocumentationList);