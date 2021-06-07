import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class PrivacyPolicy extends Component {

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
                                    <h2>Privacy Policy</h2>

                                    <h6 style={{fontWeight: "bold"}}>Last updated: September 16, 2020</h6>
                                    <p>We know that you care how information about you is used and shared and we appreciate your trust that we will do so carefully and sensibly. This Privacy Policy describes how qbird.com and its affiliates (collectively “Qbird Inc.”) collect and process your personal information through Qbird websites, devices, products, services, online and physical stores and applications that reference this Privacy Policy (together “Qbird Services”). By using Qbird Services, you are consenting to the practices described in this Privacy Policy.</p>

                                    <h4>What Personal Information About Customers Does Qbird Collect?</h4>
                                    <p>We collect your personal information in order to provide and continually improve our services.
                                        Here are the types of personal information we collect:
                                        <ul>
                                            <li>
                                                <b>Information You Give Us:</b> We receive and store any information you provide in relation to Qbird Services. You can choose not to provide certain information, but then you might not be able to take advantage of our Qbird Services.
                                            </li>
                                            <li>
                                                <b>Automatic Information:</b> We automatically collect and store certain types of information about your use of Qbird Services, including information about your interaction with content and services available through Qbird Services. Like many websites, we use "cookies" and other unique identifiers and we obtain certain types of information when your web browser or device accesses Qbird Services and other content served by or on behalf of Qbird on other websites.
                                            </li>
                                        </ul>
                                    </p>

                                    <h4>For What Purpose Does Qbird Use Your Personal Information?</h4>
                                    <p>We use your personal information to operate, provide, develop and improve the services that we offer our customers. These purposes include:
                                        <ul>
                                            <li>
                                                <b>Order services:</b> We use your personal information to take and handle orders, process payments and communicate with you about orders, services and promotional offers.
                                            </li>
                                            <li>
                                                <b>Provide, troubleshoot and improve Qbird Services:</b> We use your personal information to provide functionality, analyze performance, fix errors and improve the usability and effectiveness of the Qbird Services.
                                            </li>
                                            <li>
                                                <b>Recommendations and personalization:</b> We use your personal information to recommend features and services that might be of interest to you, identify your preferences and personalize your experience with Qbird Services.
                                            </li>
                                            <li>
                                                <b>Comply with legal obligations:</b> In certain cases, we collect and use your personal information to comply with laws.
                                            </li>
                                            <li>
                                                <b>Communicate with you:</b> We use your personal information to communicate with you in relation to Qbird Services via different channels (e.g., by phone, e-mail, chat).
                                            </li>
                                            <li>
                                                <b>Advertising:</b> We use your personal information to display ads for features and services that might be of interest to you. We do not use information that personally identifies you to display ads.
                                            </li>
                                            <li>
                                                <b>Fraud Prevention and Credit Risks:</b> We use personal information to prevent and detect fraud and abuse in order to protect the security of our customers, Qbird and others. We may also use scoring methods to assess and manage credit risks.
                                            </li>
                                        </ul>
                                    </p>

                                    <h4>When will your personal information be shared to other users?</h4>
                                    <p>
                                        In general case, a user cannot see personal information of another user. But there are some cases when your personal information will be shared to certain people.
                                        <ul>
                                            <li><b>You are the owner:</b> If you are the owner of an ad or shop, your name and contact number will be displayed publicly below the ad or shop. You will have the control to choose which contact number to show in public.</li>
                                            <li><b>You have a comment:</b> If you comment on any ad, shop, user, order or delivery person, your name and the comment will be shown in public. Also if you rate any ad, shop, user, order or delivery person, your rating may appear in public in some cases.</li>
                                            <li><b>Delivering your order:</b> If you have an order to be delivered, some of your personal information such as your name, contact no, address, shipping location, profile photo and other information necessary to deliver the order will be available to the delivery person. However, your contact number will be removed from the delivery person's view once the delivery is complete.</li>
                                            <li><b>Completing your sale:</b> If you are a seller, your name, shop name or ad name, shop or ad photo, contact number and some other information necessary to complete an order will be available to the delivery person.</li>
                                            <li><b>Completing delivery:</b> If you you are a delivery person, some of your personal information such as your name, contact no, location, profile photo and some other information will be available to the user and the seller. However, your contact number will be removed from the views of the user and the seller once the delivery is complete.</li>
                                        </ul>
                                    </p>

                                    <h4>What about cookies and other identifiers?</h4>
                                    <p>To enable our systems to recognize your browser or device and to provide and improve Qbird Services, we use cookies and other identifiers. We use cookies, pixels and other technologies (collectively, "cookies") to recognize your browser or device, learn more about your interests and provide you with essential features and services and for additional purposes, including:
                                        <ul>
                                            <li>Recognizing you when you sign-in to use our services. This allows us to provide you with recommendations, display personalized content and provide other customized features and services.</li>
                                            <li>Keeping track of your specified preferences.</li>
                                            <li>Keeping track of items stored in your shopping basket.</li>
                                            <li>Conducting research and diagnostics to improve Qbird's content and services.</li>
                                            <li>Preventing fraudulent activity.</li>
                                            <li>Improving security.</li>
                                            <li>Delivering content, including ads, relevant to your interests on Qbird sites and third-party sites.</li>
                                            <li>Reporting. This allows us to measure and analyze the performance of our services.</li>
                                        </ul>
                                        Qbird’s cookies allow you to take advantage of some of Qbird's essential features. For instance, if you block or otherwise reject our cookies, you will not be able to add items to your Shopping Cart, proceed to Checkout, or use any Qbird services that require you to sign in.
                                        Approved third parties may also set cookies when you interact with Qbird services. Third parties include search engines, providers of measurement and analytics services, social media networks and advertising companies. Third parties use cookies in the process of delivering content, including ads relevant to your interests, to measure the effectiveness of their ads and to perform services on behalf of Qbird.
                                    </p>

                                    <h4>Does Qbird Share Your Personal Information?</h4>
                                    <p>Information about our customers is an important part of our business and we are not in the business of selling our customers’ personal information to others. We share customers’ personal information only as described below and with subsidiaries Qbird Inc. controls that either are subject to this Privacy Policy or follow practices at least as protective as those described in this Privacy Policy.
                                        <ul>
                                            <li><b>Protection of Qbird and Others:</b> We release account and other personal information when we believe release is appropriate to comply with the law; enforce or apply our <Link to="/terms-&-conditions" className="display-inline">Terms & Conditions</Link> and other agreements; or protect the rights, property, or safety of Qbird, our users, or others. This includes exchanging information with other companies and organizations for fraud protection and credit risk reduction.</li>
                                        </ul>
                                        Other than as set out above, you will receive notice when personal information about you might be shared with third parties and you will have an opportunity to choose not to share the information.
                                    </p>

                                    <h4>How Secure Is Information About Me?</h4>
                                    <p>We design our systems with your security and privacy in mind. We always work hard to keep your information protected. It is important for you to protect against unauthorized access to your password and to your computers, devices and applications. Be sure to sign off when finished using a shared computer.</p>
                                
                                    <h4>Are Children Allowed to Use Qbird Services?</h4>
                                    <p>Qbird does not offer services for purchase by children. If you are under 18, you may use Qbird Services only with the involvement of a parent or guardian. We do not knowingly collect personal information from children under the age of 13 without the consent of the child's parent or guardian.</p>
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

export default connect(mapStateToProps, { general })(PrivacyPolicy);