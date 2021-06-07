import React, { Component } from 'react'
import { Field, reduxForm, getFormValues } from 'redux-form';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import renderInput from '../../constants/forms/renderInput';
import Spinner from '../Common/Spinner';
import renderSelect from '../../constants/forms/renderSelect';
import renderInputGroup from '../../constants/forms/renderInputGroup';
import renderServerError from '../../constants/forms/renderServerErrors';
import { required, maxLength200, minLength2, minLength10, minLength6, maxLength11 } from '../../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { signup } from '../../store/actions/authActions';
import { numbers } from '../../constants/forms/fieldNormalization';

class CreateAccount extends Component {

    _isMounted = false;

    state = {
        showPassword: false,
        showReEnterPassword: false,
        fatalError: null
    };

    componentDidMount() {
        this._isMounted = true;
        const { reset } = this.props;
        reset();
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    togglePasswordView = () => {
        let state = this.state.showPassword;
        this.setState({
            showPassword: !state
        })
    }

    toggleReEnterPasswordView = () => {
        let state = this.state.showReEnterPassword;
        this.setState({
            showReEnterPassword: !state
        })
    }

    onSubmit = (formValues) => {
        return this.props.signup(formValues).then(() => {
            const { fatalError, alreadyLoggedIn, otp } = this.props.auth.payload.errorMessage;
            if(this._isMounted) {
                if(alreadyLoggedIn) {
                    this.setState({
                        errorMessage: {
                            fatalError: "You are already logged in. New account cannot be created while you are logged in. Refresh the page to access the current account"
                        }
                    });
                }
                else if(fatalError) {
                    this.setState({
                        fatalError: fatalError
                    });
                }
                else if(otp) {
                    this.setState({
                        fatalError: otp
                    });
                }
                else {
                    this.setState({
                        fatalError: null
                    });
                    renderServerError(this.props.auth.payload);
                }
            }
        });
    }

    render() {
        const { handleSubmit, submitting, pristine, isFetching } = this.props;
        const { fatalError, showPassword, showReEnterPassword } = this.state;
        return (
            <section className="signup-area ptb-60">
                <div className="container">
                    <div className="signup-content">
                        <div className="section-title">
                            <h2><span className="dot"></span> Create an Account</h2>
                        </div>
                        <form className="signup-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="text" name="name" component={renderInput} placeholder="Enter Full Name" label="Name" validate={[required, minLength2, maxLength200]} maxLength="255" />
                            <Field type="select" name="countryCode" component={renderSelect} label="Country Code" validate={[required]}>
                                <option value="Bangladesh (+880)">Bangladesh (+880)</option>
                            </Field>
                            <Field type="text" name="phoneNumber" component={renderInput} placeholder="Enter Phone Number" label="Phone Number"
                                validate={[required, minLength10, maxLength11]} normalize={numbers} maxLength="11" />
                            <Field type={showPassword ? "text" : "password"} name="password" component={renderInputGroup} placeholder="Enter Password" label="Password" validate={[required, minLength6, maxLength200]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.togglePasswordView}>{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                            <Field type={showReEnterPassword ? "text" : "password"} name="reEnterPassword" component={renderInputGroup} placeholder="Re-enter Password" label="Confirm Password" validate={[required, minLength6, maxLength200]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.toggleReEnterPasswordView}>{showReEnterPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                            <button type="submit" className="btn btn-primary next" disabled={submitting || pristine}><Spinner isLoading={isFetching} /> &nbsp;Register</button>
                            <div className="text-danger-div">
                                {fatalError && !submitting && <span className="text-danger">{fatalError}</span>}
                            </div>
                        </form>
                        <div className="privacy-policy-statement">
                            <span> By creating an account, you agree to our <Link to={'/terms-&-conditions'} className="display-inline">Terms & Conditions</Link> and <Link to={'/privacy-policy'} className="display-inline">Privacy Policy</Link></span>
                        </div>
                        <Link to={{ pathname: `/log-in`, state: { from: { pathname: this.props.from } } }} className="auth-return-to">Return to Login
                        </Link>
                    </div>
                </div>
            </section>
        );
    }
}

const loadingSelector = createLoadingSelector(['SIGNUP']);

CreateAccount = reduxForm({
    form: 'register',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    initialValues: {
        countryCode: 'Bangladesh (+880)'
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CreateAccount);

const mapStateToProps = (state) => {
    return {
        isFetching: loadingSelector(state),
        formValues: getFormValues('register')(state),
        auth: state.auth
    };
}
export default connect(mapStateToProps, { signup })(CreateAccount)

