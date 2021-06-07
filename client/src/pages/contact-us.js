import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Link } from 'react-router-dom';

import { general } from '../store/actions/authActions';
import { contactUs } from '../store/actions/contactUsActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import renderInput from '../constants/forms/renderInput';
import { required, minLength2, maxLength200, maxLength5000, validateEmail } from '../constants/forms/fieldLevelValidation';
import renderTextarea from '../constants/forms/renderTextarea';
import renderServerError from '../constants/forms/renderServerErrors';
import Spinner from '../components/Common/Spinner';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class ContactUs extends Component {

    state = {
        fatalErrorForm: '',
        errorMessage: {
            fatalError: null
        }
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.general().then(() => {
            const { name, email } = this.props.auth.payload;
            this.props.change('userName', name);
            this.props.change('email', email);
            const { fatalError } = this.props.auth.payload.errorMessage;
            this.setState({
                errorMessage: {
                    fatalError: fatalError
                }
            });
        });
    }

    onSubmit = (formValues) => {
        return this.props.contactUs(formValues).then(() => {
            const { fatalError } = this.props.contactUs.payload.errorMessage;
            if (fatalError) {
                this.setState({ fatalErrorForm: fatalError });
            } else {
                this.setState({ fatalErrorForm: null });
                renderServerError(this.props);
            }
        });
    }

    render() {
        const { submitting, handleSubmit, isSending } = this.props;
        const { fatalErrorForm } = this.state;
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <section className="contact-area ptb-60">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5 col-md-12">
                                <div className="contact-info">
                                    <h3>Here to Help</h3>
                                    <p>Have a question? You may find an answer in our <Link to={'/faq'} className="display-inline">FAQ</Link>. But you can also contact us.</p>

                                    <ul className="contact-list">
                                        <li><i className="fas fa-map-marker-alt"></i> Location: Apon Heights, House# 27/1/B (A-5), Road# 03, Shyamoli, Mirpur Road, Dhaka-1207, Bangladesh</li>
                                        <li><i className="far fa-envelope"></i> Email Us: info@qbird.com</li>
                                    </ul>

                                    <h3>Opening Hours:</h3>
                                    <ul className="opening-hours">
                                        <li><span>Saturday:</span> Closed</li>
                                        <li><span>Sunday:</span> 10AM - 5PM</li>
                                        <li><span>Monday:</span> 10AM - 5PM</li>
                                        <li><span>Tuesday:</span> 10AM - 5PM</li>
                                        <li><span>Wednesday:</span> 10AM - 5PM</li>
                                        <li><span>Thursday:</span> 10AM - 5PM</li>
                                        <li><span>Friday:</span> Closed</li>
                                    </ul>

                                    <h3>Follow Us:</h3>
                                    <ul className="social">
                                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/qbirdbd"><i className="fab fa-facebook-f"></i></a></li>
                                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/qbirdbd"><i className="fab fa-twitter"></i></a></li>
                                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/qbirdbd"><i className="fab fa-instagram"></i></a></li>
                                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/qbirdbd"><i className="fab fa-youtube"></i></a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-lg-7 col-md-12">
                                <div className="contact-form">
                                    <h3>Drop Us a Line</h3>
                                    <p>We are happy to answer any question you have or provide you with an estimation. Just send us a message in the form below with any query. Our team will contact you in the shortest possible time.</p>

                                    <form className="create-ad-form" onSubmit={handleSubmit(this.onSubmit)}>
                                        <div className="row contact-us-fields">
                                            <div className="col-lg-12 col-md-12">
                                                <Field name="userName" type="text" component={renderInput} placeholder="Enter your name" label="Name" validate={[required, minLength2, maxLength200]} />
                                            </div>

                                            <div className="col-lg-12 col-md-12">
                                                <Field name="email" type="text" label="Email Address" placeholder="Enter your email address" validate={[validateEmail, required]} component={renderInput} />
                                            </div>

                                            <div className="col-lg-12 col-md-12">
                                                <Field type="text" name="message" component={renderTextarea} placeholder="Enter your message" label="Message" maxLength="5000" rows={8} cols={30}
                                                    validate={[minLength2, maxLength5000, required]} />
                                            </div>

                                            <div className="col-lg-4 col-md-4">
                                                <button type="submit" className="btn btn-primary" disabled={submitting || isSending}>
                                                    <Spinner isLoading={isSending && !fatalErrorForm} /> &nbsp;Send Message</button>
                                                {fatalErrorForm && !submitting && <span className="text-danger">{fatalErrorForm}</span>}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        );
    }
}

ContactUs = reduxForm({
    form: 'contact-us',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(ContactUs);

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        contactUs: state.contactUs,
        isSending: createLoadingSelector(['CONTACT_US'])(state)
    };
}

export default connect(mapStateToProps, { general, contactUs })(ContactUs);