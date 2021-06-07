import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';

import { accountDetails, updateUserDetails } from '../store/actions/userActions';
import { required, minLength2, maxLength200, maxLength320, validateEmail } from '../constants/forms/fieldLevelValidation';
import renderInput from '../constants/forms/renderInput';
import ProfilePicture from '../components/Common/ProfilePicture';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import renderServerErrors from '../constants/forms/renderServerErrors';
import AccountTab from '../components/HOC/AccountTab';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class ProfileComp extends React.Component {

    state = {
        isEdit: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.accountDetails().then(() => {
            const { status, errorMessage } = this.props.user.payload;
            if(status === 'success') {
                const { name, email, photo } = this.props.user.payload;
                this.setState({ name: name, email: email, photo: photo });
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

    onSubmit = (formValues) => {
        const { name, email } = formValues;
        return this.props.updateUserDetails({ name, email: email }).then(() => {
            const { status, errorMessage } = this.props.user.payload;
            const { fatalError, authError } = errorMessage;
            if(status === 'success') {
                this.setState({ name: name, email: email, isEdit: false });
            }
            else {
                if (!fatalError && !authError) {
                    this.setState({ fatalErrorForm: null, authErrorForm: null });
                    renderServerErrors(this.props.user.payload);
                }
                else
                    this.setState({ fatalErrorForm: fatalError, authErrorForm: authError });
            }
        })
    }

    onCancel = () => {
        this.setState({ isEdit: false });
    }

    onUpdatePhoto = (photo) => {
        this.setState({ photo: photo });
    }

    showForm = () => {
        const { name, email } = this.state;
        this.props.change("name", name);
        this.props.change("email", email);
        this.setState({ isEdit: true })
    }

    render() {
        const { isEdit } = this.state;
        const { isUpdatingDetails, handleSubmit, submitting, isUpdatingPhoto, isfetchingUserDetails } = this.props;
        const { fatalError, authError } = this.state.errorMessage;
        const { name, email, photo, fatalErrorForm, authErrorForm } = this.state;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section>
                    {isfetchingUserDetails ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isfetchingUserDetails} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <React.Fragment>
                        {isEdit === true ?
                            <form onSubmit={handleSubmit(this.onSubmit)}>
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 text-center">
                                        <ProfilePicture userPhoto={photo} onUpdatePhoto={this.onUpdatePhoto} />
                                    </div>
                                    <div className="col-lg-4 col-md-6">
                                        <Field name="name" type="text" label="Name" placeholder="Enter Name" validate={[required, minLength2, maxLength200]} component={renderInput} />
                                        <Field name="email" type="text" label="Email" placeholder="Enter Email Address" validate={[maxLength320, validateEmail]} component={renderInput} />
                                        <div className="pull-right">
                                            <button type="button" className="btn btn-light" disabled={submitting || isUpdatingDetails || isUpdatingPhoto} onClick={() => this.onCancel()}> Cancel</button>&nbsp;
                                            <button type="submit" className="btn btn-primary" disabled={submitting || isUpdatingDetails || isUpdatingPhoto} onSubmit={handleSubmit(this.onSubmit)}>
                                                <Spinner isLoading={isUpdatingDetails} /> &nbsp;Save</button>
                                        </div>
                                        <div className="text-danger-div">
                                            {(fatalErrorForm || authErrorForm) && !submitting && <span className="text-danger word-break">{fatalErrorForm || authErrorForm}</span>}
                                        </div>
                                    </div>
                                </div>
                            </form> :
                            <div className="row">
                                <div className="col-lg-4 col-md-6">
                                    <ProfilePicture userPhoto={photo} disabled={!isEdit} />
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <h4 className="word-break">{name}</h4>
                                    {email ? <p><i className="fa fa-envelope"></i>&nbsp;<a href={`mailto:${email}`} className="display-inline word-break">{email}</a>
                                    </p> : ''}
                                    <br />
                                    <button type="button" className="btn btn-primary" onClick={() => this.showForm()}>Edit</button>
                                </div>
                            </div>
                        }
                    </React.Fragment>}
                </section>}
            </React.Fragment>
        )
    }
}

ProfileComp = reduxForm({
    form: 'user-profile',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(ProfileComp)

const mapStateToProps = (state) => {
    return {
        isfetchingUserDetails: createLoadingSelector(["ACCOUNT_DETAILS"])(state),
        isUpdatingPhoto: createLoadingSelector(["PHOTO_UPLOAD"])(state),
        isUpdatingDetails: createLoadingSelector(["UPDATE_USER_DETAILS"])(state),
        user: state.user
    }
}

const Profile = AccountTab(ProfileComp, "profile");
export default connect(mapStateToProps, { accountDetails, updateUserDetails })(Profile);