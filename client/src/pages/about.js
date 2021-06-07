import React, { Component } from 'react';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class About extends Component {

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
                                    <h2>About Us</h2>
                                    <p>Welcome to Qbird. We are the leading online shopping store in Bangladesh. We offer the best products at the most reasonable prices and ensure on-time delivery for every location. We have created an extremely user-friendly interface where you can easily navigate and specify your requirements without any difficulties. We make sure that you have a pleasant shopping experience and get the best deal when you shop with us.</p>

                                    <p>Qbird offers you access to a wide variety of products. From Luxury items to your day to day necessary products are available here. We have laid out every detail and specification of the product so that when you order, you can order without any confusion. Qbird guarantees a service that will make you come back again and again.</p>
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

export default connect(mapStateToProps, { general })(About);