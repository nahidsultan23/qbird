import React from 'react'
import { Field, reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import renderInput from '../../constants/forms/renderInput';
import Spinner from '../Common/Spinner';
import { verifyOTP, resendOTP } from '../../store/actions/authActions';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { minLength6, maxLength6, required } from '../../constants/forms/fieldLevelValidation';
import renderServerError from '../../constants/forms/renderServerErrors';

class AccountConfirmation extends React.Component {

    _isMounted = false;

    state = {
        fatalError: null,
        from: '/'
    };

    componentDidMount() {
        this._isMounted = true;
        this.setState({ from: this.props.from });
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onSubmit = (formValues) => {
        return this.props.verifyOTP(formValues, this.state.from).then(r => {
            const { fatalError, alreadyLoggedIn } = this.props.auth.payload.errorMessage;
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
                else {
                    this.setState({
                        fatalError: null
                    });
                    renderServerError(this.props.auth.payload);
                }
            }
        });
    }

    onResend = () => {
        const { countryCode, phoneNumber } = this.props.formValues;
        return this.props.resendOTP({ countryCode, phoneNumber }).then(r => {
            const { fatalError, alreadyLoggedIn } = this.props.auth.payload.errorMessage;
            if(this._isMounted) {
                if(alreadyLoggedIn) {
                    this.setState({
                        errorMessage: {
                            fatalError: "You are already logged in. Account creation process cannot be continued while you are logged in. Refresh the page to access the current account"
                        }
                    });
                }
                else if(fatalError) {
                    this.setState({
                        fatalError: fatalError
                    });
                }
                else {
                    this.setState({
                        fatalError: null
                    });
                    renderServerError(this.props.auth.payload);
                }
            }
        })
    }

    render() {
        const { handleSubmit, submitting, pristine, isFetching, isResendingOTP } = this.props;
        const { fatalError } = this.state;
        return (
            <section className="signup-area" >
                <div className="container">
                    <div className="signup-content">
                        <div className="section-title">
                            <h2><span className="dot"></span> Create an Account</h2>
                        </div>
                        <form className="signup-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="text" name="otp" component={renderInput} placeholder="Enter the Verification Code" label="We've sent a Verification Code to your phone number. Provide that code to verify your account." validate={[required, minLength6, maxLength6]} maxLength="6" />

                            <button type="submit" className="btn btn-primary next" disabled={submitting || pristine || isResendingOTP}><Spinner isLoading={isFetching} /> &nbsp;Verify</button>
                            <div className="text-danger-div">
                                {fatalError && !submitting && <span className="text-danger">{fatalError}</span>}
                            </div>
                        </form>
                        <button type="button" className="btn btn-primary" onClick={this.onResend} disabled={isResendingOTP || isFetching}><Spinner isLoading={isResendingOTP} /> &nbsp;Resend Verification Code</button>
                        <div>
                            <Link to={{ pathname: `/log-in`, state: { from: { pathname: this.props.from } } }} className="auth-return-to">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const loadingSelector = createLoadingSelector(['OTP_VERIFY']);
const loadingSelectorResending = createLoadingSelector(['OTP_RESEND']);


AccountConfirmation = reduxForm({
    form: 'register',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(AccountConfirmation);

const mapStateToProps = (state) => {
    return {
        isFetching: loadingSelector(state),
        formValues: getFormValues('register')(state),
        isResendingOTP: loadingSelectorResending(state),
        auth: state.auth
    };
}

export default connect(mapStateToProps, { verifyOTP, resendOTP })(AccountConfirmation)