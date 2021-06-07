import React, { Component } from 'react'
import { Field, reduxForm, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import renderInputGroup from '../../constants/forms/renderInputGroup';
import { required, minLength6, maxLength255 } from '../../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { setNewPassword } from '../../store/actions/authActions';
import renderServerError from '../../constants/forms/renderServerErrors';
import Spinner from '../Common/Spinner';

class ChangePassword extends Component {
    
    _isMounted = false;

    state = {
        showPassword: false,
        showReEnterPassword: false,
        fatalError: null,
        from: '/'
    }

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

    onSubmit = () => {
        const { phoneNumber, countryCode, newPassword, reEnterNewPassword } = this.props.formValues;
        return this.props.setNewPassword({ phoneNumber, countryCode, newPassword, reEnterNewPassword, from: this.state.from }).then(r => {
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
        const { fatalError, showPassword, showReEnterPassword } = this.state;
        return (
            <section className="signup-area ptb-60">
                <div className="container">
                    <div className="signup-content">
                        <div className="section-title">
                            <h2><span className="dot"></span> Set New Password</h2>
                        </div>
                        <form className="signup-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type={showPassword ? "text" : "password"} name="newPassword" component={renderInputGroup} placeholder="Enter Password" label="Password" validate={[required, minLength6, maxLength255]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.togglePasswordView}>{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                            <Field type={showReEnterPassword ? "text" : "password"} name="reEnterNewPassword" component={renderInputGroup} placeholder="Re-enter Password" label="Confirm Password" validate={[required, minLength6, maxLength255]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.toggleReEnterPasswordView}>{showReEnterPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                            <button type="submit" className="btn btn-primary next" disabled={submitting || pristine}>
                                <Spinner isLoading={isFetching} /> &nbsp;Set Password</button>
                            <div className="text-danger-div">
                                {(fatalError) && !submitting && <span className="text-danger">{fatalError}</span>}
                            </div>
                        </form>
                        <Link to={{ pathname: `/log-in`, state: { from: { pathname: this.props.from } } }} className="auth-return-to">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </section >
        );
    }
}

ChangePassword = reduxForm({
    form: 'account-recovery',
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(ChangePassword);

const mapStateToProps = (state) => {
    return {
        isFetching: createLoadingSelector(['CHANGE_PASSWORD'])(state),
        formValues: getFormValues('account-recovery')(state),
        auth: state.auth
    };
}
export default connect(mapStateToProps, { setNewPassword })(ChangePassword)

