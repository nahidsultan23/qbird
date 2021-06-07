import React, { Component } from 'react';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class ReduceShippingCharges extends Component {

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
                                    <h2>How to reduce Shipping Charges?</h2>

                                    <p>You may also want to read <Link to="/documentation/how-shipping-charges-are-calculated" className="display-inline">How Shipping Charges are calculated?</Link></p>

                                    <p>There are 5 (five) types of charges which may be applicable when an order is shipped. They are: <b>Base Charge, Extra Stoppage Charge, Extra Weight Charge, Extra Waiting Charge and Extra Distance Charge</b>. These 5 (five) charges together are referred as Shipping Charges.
                                    If you think your Shipping Charges are more than your expectation, you can reduce the charges by following some tricks described below.</p>

                                    <h4>How to reduce Base Charge?</h4>
                                    <p>Base Charge of a Shipping may vary from 20 BDT - Bangladeshi Taka to 30 BDT - Bangladeshi Taka based on the type of Shop you are shopping from. If the items you are buying from a shop have a cumulative waiting time less than 10 minutes, the base price of that Shipping will be 20 BDT - Bangladeshi Taka. Otherwise, it will be 30 BDT - Bangladeshi Taka.</p>

                                    <h4>How to reduce Extra Stoppage Charge?</h4>
                                    <p>"Stoppage" is the place from where your products will be bought. This term is mostly used to refer to a shop. But if the item you are buying is not from a shop, then its originating place will be considered as an individual stoppage. To reduce the Extra Stoppage Charge, you may follow the following tricks.
                                        <ul>
                                            <li>Order all the items from the same stoppage (shop). There is no Extra Stoppage Charge if all the items of your order are from the same stoppage. If the item you are ordering does not have a shop, you may order only that item to avoid Extra Stoppage Charge.</li>
                                            <li>There is no Extra Stoppage Charge for a stoppage which is within 100 m - Meter range of the previous stoppage. If your order contains several stoppages and each stoppage is within the 100 m - Meter from its previous stoppage, no Extra Stoppage Charge will be imposed.</li>
                                        </ul>
                                        To know about how the Extra Stoppage charge is calculated, <Link to="/documentation/how-shipping-charges-are-calculated" className="display-inline">click here</Link>.
                                    </p>

                                    <h4>How to reduce Extra Weight Charge?</h4>
                                    <p>If the total weight of your order is more than 5 kg - Kilogram, Extra Weight Charge will be applied. <Link to="/documentation/how-shipping-charges-are-calculated" className="display-inline">Click here</Link> to know about how the Extra Weight Charge is calculated. To avoid Extra Weight Charge, keep the total weight of your order below or equal to 5 kg - Kilogram</p>

                                    <h4>How to reduce Extra Waiting Charge?</h4>
                                    <p>Extra Waiting Charge is applied when the waiting time of the order is more than 60 minutes. It is only applied to the items which have lead times more than 10 minutes. <Link to="/documentation/how-shipping-charges-are-calculated" className="display-inline">Click here</Link> to know how the waiting time and Extra Waiting Charge are calculated. To avoid Extra Waiting Charge, keep the waiting time less than 60 minutes.</p>

                                    <h4>How to reduce Extra Distance Charge?</h4>
                                    <p>Extra Distance Charge is applied when the total distance is more than 500 m - Meter. <Link to="/documentation/how-shipping-charges-are-calculated" className="display-inline">Click here</Link> to know how the total distance and the Extra Distance Charge are calculated. To reduce Extra Distance Charge, order items from the nearest places around you. To avoid this charge, keep the total distance less than or equal to 500 m - Meter.</p>
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

export default connect(mapStateToProps, { general })(ReduceShippingCharges);