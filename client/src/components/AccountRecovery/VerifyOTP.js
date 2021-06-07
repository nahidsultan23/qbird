import React, { Component } from 'react'
import { Field, reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import renderInput from '../../constants/forms/renderInput';
import Spinner from '../../components/Common/Spinner';
import { required, minLength6, maxLength6 } from '../../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { verifyRecoverAccountOTP, resendRecoverAccountOTP } from '../../store/actions/authActions';
import renderServerError from '../../constants/forms/renderServerErrors';

class VerifyOTP extends Component {

    _isMounted = false;

    state = {
        fatalError: null
    }

    componentDidMount() {
        this._isMounted = true;
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onSubmit = () => {
        const { phoneNumber, countryCode, otp } = this.props.formValues;
        return this.props.verifyRecoverAccountOTP({ phoneNumber, countryCode, otp }).then(r => {
            const { fatalError, alreadyLoggedIn } = this.props.auth.payload.errorMessage;
            if(this._isMounted) {
                if(alreadyLoggedIn) {
                    this.setState({
                        errorMessage: {
                            fatalError: "You are already logged in. Account recovery process cannot be continued while you are logged in. Refresh the page to access the current account"
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

    onResend = () => {
        const { phoneNumber, countryCode } = this.props.formValues;
        return this.props.resendRecoverAccountOTP({ countryCode, phoneNumber }).then(r => {
            const { fatalError, alreadyLoggedIn } = this.props.auth.payload.errorMessage;
            if(this._isMounted) {
                if(alreadyLoggedIn) {
                    this.setState({
                        errorMessage: {
                            fatalError: "You are already logged in. Account recovery process cannot be continued while you are logged in. Refresh the page to access the current account"
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
        const { handleSubmit, submitting, pristine, isFetching, isResending } = this.props;
        const { fatalError } = this.state;
        return (
            <section className="signup-area ptb-60">
                <div className="container">
                    <div className="signup-content">
                        <div className="section-title">
                            <h2><span className="dot"></span> Recover Account</h2>
                        </div>
                        <form className="signup-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="text" name="otp" component={renderInput} placeholder="Enter the Verification Code" label="We've sent a Verification Code to your phone number. Provide that code to verify your account." validate={[required, minLength6, maxLength6]} maxLength="6" />
                            <button type="submit" className="btn btn-primary next" disabled={isResending || submitting || pristine}><Spinner isLoading={isFetching} /> &nbsp;Verify</button>
                            <div className="text-danger-div">
                                {fatalError && !submitting && !isResending && <span className="text-danger">{fatalError}</span>}
                            </div>
                        </form>
                        <button type="button" className="btn btn-primary" disabled={isResending || submitting || pristine} onClick={this.onResend}><Spinner isLoading={isResending} /> &nbsp;Resend Verification Code</button>
                        <div>
                            <Link to={{ pathname: `/log-in`, state: { from: { pathname: this.props.from } } }} className="auth-return-to">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section >
        );
    }
}

VerifyOTP = reduxForm({
    form: 'account-recovery',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(VerifyOTP);

const mapStateToProps = (state) => {
    return {
        isFetching: createLoadingSelector(['ACCOUNT_RECOVERY_VEIRFY_OTP'])(state),
        isResending: createLoadingSelector(['ACCOUNT_RECOVERY_OTP_RESEND'])(state),
        formValues: getFormValues('account-recovery')(state),
        auth: state.auth
    };
}
export default connect(mapStateToProps, { verifyRecoverAccountOTP, resendRecoverAccountOTP })(VerifyOTP)

