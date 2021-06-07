import React, { Component } from 'react'
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import renderInput from '../../constants/forms/renderInput';
import renderSelect from '../../constants/forms/renderSelect';
import { required, minLength10, maxLength11 } from '../../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { recoverAccount } from '../../store/actions/authActions';
import renderServerError from '../../constants/forms/renderServerErrors';
import { numbers } from '../../constants/forms/fieldNormalization';
import Spinner from '../Common/Spinner';

class SendOTP extends Component {
    
    _isMounted = false;

    state = {
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

    onSubmit = (formValues) => {
        return this.props.recoverAccount(formValues).then(() => {
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
        const { handleSubmit, submitting, pristine, isFetching } = this.props;
        const { fatalError } = this.state;
        return (
            <section className="signup-area ptb-60">
                <div className="container">
                    <div className="signup-content">
                        <div className="section-title">
                            <h2><span className="dot"></span> Recover Password</h2>
                        </div>
                        <form className="account-recovery" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="select" name="countryCode" component={renderSelect} label="Country Code" validate={[required]}>
                                <option value="Bangladesh (+880)">Bangladesh (+880)</option>
                            </Field>
                            <Field type="text" name="phoneNumber" component={renderInput} placeholder="Enter Phone Number" label="Phone Number"
                                validate={[required, minLength10, maxLength11]} normalize={numbers} maxLength="11" />
                            <button type="submit" className="btn btn-primary next" disabled={submitting || pristine}> <Spinner isLoading={isFetching} /> &nbsp;Reset Password</button>
                            <div className="text-danger-div">
                                {(fatalError) && !submitting && <span className="text-danger">{fatalError}</span>}
                            </div>
                        </form>
                        <Link to={{ pathname: `/log-in`, state: { from: { pathname: this.props.from } } }} className="auth-return-to">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </section>
        );
    }
}

SendOTP = reduxForm({
    form: 'account-recovery',
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
})(SendOTP);

const mapStateToProps = (state) => {
    return {
        isFetching: createLoadingSelector(['ACCOUNT_RECOVERY'])(state),
        auth: state.auth
    };
}
export default connect(mapStateToProps, { recoverAccount })(SendOTP)

