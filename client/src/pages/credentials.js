import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import { accountDetails, updatePassword } from '../store/actions/userActions';
import renderInput from '../constants/forms/renderInput';
import renderInputGroup from '../constants/forms/renderInputGroup';
import renderServerErrors from '../constants/forms/renderServerErrors';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { required, maxLength255, minLength6 } from '../constants/forms/fieldLevelValidation';
import Spinner from '../components/Common/Spinner';
import AccountTab from '../components/HOC/AccountTab';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class CredentialsComp extends React.Component {

    state = {
        showPassword: false,
        showNewPassword: false,
        showReEnterNewPassword: false,
        visible: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.accountDetails().then(() => {
            const { status, errorMessage } = this.props.user.payload;
            if(status === 'success') {
                const { phoneNumber } = this.props.user.payload;
                this.props.change("phoneNumber", phoneNumber);
                this.setState({
                    phoneNumber: phoneNumber
                });
            }
            else {
                const { fatalError, authError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        authError: authError
                    }
                });
            }
        });
    }

    validatePassword = (value, allValues) => {
        if (value && (allValues.newPassword !== value))
            return "New Password and Confirm New Password must match";
    }

    showChangePassword() {
        const { reset } = this.props;
        reset();
        const { phoneNumber } = this.state;
        this.props.change("phoneNumber", phoneNumber);
        this.setState({ visible: true });
    }

    onClose = () => {
        const { phoneNumber } = this.state;
        this.props.change("phoneNumber", phoneNumber);
        this.setState({ visible: false });
    }

    togglePasswordView = () => {
        let state = this.state.showPassword;
        this.setState({
            showPassword: !state
        })
    }

    toggleNewPasswordView = () => {
        let state = this.state.showNewPassword;
        this.setState({
            showNewPassword: !state
        })
    }

    toggleReEnterNewPasswordView = () => {
        let state = this.state.showReEnterNewPassword;
        this.setState({
            showReEnterNewPassword: !state
        })
    }

    onSubmit = (formValues) => {
        const { password, newPassword, reEnterNewPassword } = formValues;
        return this.props.updatePassword({ password, newPassword, reEnterNewPassword }).then(() => {
            const { status, errorMessage } = this.props.user.payload;
            const { fatalError, authError } = errorMessage;
            if(status === 'success') {
                const { phoneNumber } = this.state;
                this.props.change("phoneNumber", phoneNumber);
                this.setState({
                    visible: false
                });
            }
            else {
                if (!fatalError && !authError) {
                    this.setState({ fatalErrorForm: null, authErrorForm: null });
                    renderServerErrors(this.props.user.payload);
                }
                else
                    this.setState({ fatalErrorForm: fatalError, authErrorForm: authError });
            }
        });
    }

    render() {
        const { submitting, handleSubmit, isUpdatingPassword, isfetchingUserDetails } = this.props;
        const { fatalError, authError } = this.state.errorMessage;
        const { fatalErrorForm, authErrorForm, showPassword, showNewPassword, showReEnterNewPassword } = this.state;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="create-ad-area">
                    {isfetchingUserDetails ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isfetchingUserDetails} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="container">
                        <div className="create-ad-content">
                            <div className="section-title">
                                <h2><span className="dot"></span> Credentials</h2>
                            </div>
                            <Field type="text" name="phoneNumber" component={renderInput} label="Phone Number" readOnly disabled />
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-group mb-3">
                                    <Field type="password" name="dummyPassword" component="input" label="Password" readOnly disabled className="form-control" />
                                    <div className="input-group-append">
                                        <button className="cursor-pointer btn btn-primary input-group-text" id="basic-addon2" onClick={() => this.showChangePassword()}>Change</button>
                                    </div>
                                </div>
                            </div>
                            <Modal
                                title="Change Password"
                                visible={this.state.visible}
                                onClose={this.onClose}
                                closable={true}
                                animation="slide-fade"
                                maskAnimation="fade">
                                <form className="create-ad-form" onSubmit={handleSubmit(this.onSubmit)}>
                                    <Field type={showPassword ? "text" : "password"} name="password" component={renderInputGroup} label="Current Password" placeholder="Enter Current Password" validate={[required, minLength6, maxLength255]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.togglePasswordView}>{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                                    <Field type={showNewPassword ? "text" : "password"} name="newPassword" component={renderInputGroup} label="New Password" placeholder="Enter New Password" validate={[required, minLength6, maxLength255]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.toggleNewPasswordView}>{showNewPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                                    <Field type={showReEnterNewPassword ? "text" : "password"} name="reEnterNewPassword" component={renderInputGroup} label="Confirm New Password" placeholder="Re-enter New Password" validate={[required, minLength6, maxLength255, this.validatePassword]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.toggleReEnterNewPasswordView}>{showReEnterNewPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                                    <button type="submit" className="btn btn-primary" disabled={submitting} onSubmit={handleSubmit(this.onSubmit)}>
                                        <Spinner isLoading={isUpdatingPassword} /> &nbsp;Change</button>
                                    <div className="text-danger-div">
                                        {(fatalErrorForm || authErrorForm) && !submitting && <span className="text-danger word-break">{fatalErrorForm || authErrorForm}</span>}
                                    </div>
                                    <button type="button" className="btn btn-default" onClick={this.onClose}>Cancel </button>
                                </form>
                            </Modal>
                        </div>
                    </div>}
                </section>}
            </React.Fragment>
        )
    }
}

CredentialsComp = reduxForm({
    form: 'change-password',
    initialValues: {
        dummyPassword: '****************'
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CredentialsComp);

const mapStateToProps = (state) => {
    return {
        isUpdatingPassword: createLoadingSelector(['UPDATE_USER_PASSWORD'])(state),
        isfetchingUserDetails: createLoadingSelector(["ACCOUNT_DETAILS"])(state),
        user: state.user
    }
}

const Credentials = AccountTab(CredentialsComp, "credentials");
export default connect(mapStateToProps, { accountDetails, updatePassword })(Credentials);