import React, { Component } from 'react';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { reduxForm, Field } from 'redux-form';
import { checkAuthAdmin } from '../store/actions/authActions';
import renderInput from '../constants/forms/renderInput';
import renderSelect from '../constants/forms/renderSelect';
import { deliveryPersonStatus, deliveryPersonStatusChange } from '../store/actions/deliveryPersonStatusActions';
import renderServerErrors from '../constants/forms/renderServerErrors';
import { required } from '../constants/forms/fieldLevelValidation';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import NoContentFound from '../components/Common/NoContentFound';

class DeliveryPersonStatus extends Component {

    state = {
        permissions: {},
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.checkAuthAdmin().then(() => {
            const { permissions, errorMessage } = this.props.auth.payload;
            const { fatalError, authError } = errorMessage;
            this.setState({
                permissions: permissions,
                errorMessage: {
                    fatalError: fatalError,
                    authError: authError
                }
            });
        });
    }

    onCloseModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    submitPhoneNumber = (formvalues) => {
        return this.props.deliveryPersonStatus(formvalues).then(() => {
            const { status, errorMessage } = this.props.deliveryPersonStatusReducer.payload;
            if(status === 'success') {
                this.setState({
                    deliveryPersonInfo: this.props.deliveryPersonStatusReducer.payload
                })
                const { countryCode, phoneNumber, deliveryPersonName, deliveryMedium, deliveryPersonStatus, deliveryPersonStatusMessage } = this.props.deliveryPersonStatusReducer.payload;
                this.props.change("deliveryPersonPhoneNumber", countryCode + phoneNumber);
                this.props.change("deliveryPersonName", deliveryPersonName);
                this.props.change("deliveryMedium", deliveryMedium);
                this.props.change("deliveryPersonStatus", deliveryPersonStatus);
                this.props.change("deliveryPersonStatusMessage", deliveryPersonStatusMessage);
            }
            else {
                const { fatalError, authError } = errorMessage;
                if(fatalError || authError) {
                    this.setState({
                        fatalErrorForm: fatalError,
                        authErrorForm: authError
                    });
                }
                else {
                    this.setState({
                        fatalErrorForm: null,
                        authErrorForm: null
                    });
                    renderServerErrors(this.props.auth.payload);
                }
            }
        });
    }

    updateDeliveryPersonInfo = (formvalues) => {
        const { deliveryMedium, deliveryPersonStatus, deliveryPersonStatusMessage } = formvalues;
        const { phoneNumber } = this.state.deliveryPersonInfo;
        let reqObject = {
            phoneNumber: phoneNumber,
            deliveryPersonStatus: deliveryPersonStatus,
            deliveryPersonStatusMessage: deliveryPersonStatusMessage,
            deliveryMedium: deliveryMedium
        }
        return this.props.deliveryPersonStatusChange(reqObject).then(() => {
            const { status, errorMessage } = this.props.deliveryPersonStatusReducer.payload;
            if(status !== 'success') {
                const { fatalError, authError, deliveryPersonStatus, deliveryPersonStatusMessage, phoneNumber } = errorMessage;
                if(fatalError || authError) {
                    this.setState({
                        fatalErrorForm: fatalError,
                        authErrorForm: authError
                    });
                }
                else {
                    this.setState({
                        fatalErrorForm: null,
                        authErrorForm: null,
                        showErrorModal: true,
                        modalMessage: deliveryPersonStatus ? deliveryPersonStatus : deliveryPersonStatusMessage ? deliveryPersonStatusMessage : phoneNumber ? phoneNumber : deliveryPersonStatus
                    });
                }
            }
        });
    }

    render() {
        const { changeAccountNumber } = this.state.permissions;
        const { isFetchingAdminData, isFetchingDeliveryPersonData, isChangingDeliveryPersonStatus, handleSubmit, pristine, submitting } = this.props;
        const { deliveryPersonInfo, errorMessage, fatalErrorForm, authErrorForm } = this.state;
        const { fatalError, authError, permissionError } = errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : permissionError ? <ErrorDetailSection title={"Permission Error"} errorMessage={permissionError} /> :
                    isFetchingAdminData ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingAdminData} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> : changeAccountNumber ? <section className="about-area ptb-60">
                    <div className="items-container">
                        <div className="container">
                            <div className="section-title">
                                <h2><span className="dot"></span> Delivery Person Status</h2>
                            </div>
                            <div className="row">
                                <div className="col-lg-6 col-md-12">
                                    <form className="delivery-person-status-form" onSubmit={handleSubmit(this.submitPhoneNumber)}>
                                        <Field type="text" name="phoneNumber" component={renderInput} validate={required} placeholder="Enter Phone Number" label="Phone Number" />
                                        <button type="submit" className="btn btn-primary" disabled={submitting || pristine}>
                                            <Spinner isLoading={isFetchingDeliveryPersonData} /> &nbsp;Fetch Data
                                        </button>
                                        <div className="text-danger-div">
                                            {(fatalErrorForm || authErrorForm) && !submitting && <span className="text-danger">{fatalErrorForm || authErrorForm}</span>}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        {deliveryPersonInfo && <div className="container">
                            <div className="section-title">
                                <h2><span className="dot"></span> Update Delivery Person Status</h2>
                            </div>
                            <div className="row">
                                <div className="col-lg-6 col-md-12">
                                    <form className="delivery-person-status-form" onSubmit={handleSubmit(this.updateDeliveryPersonInfo)}>
                                        <Field type="text" name="deliveryPersonPhoneNumber" component={renderInput} label="Phone Number" disabled />
                                        <Field type="text" name="deliveryPersonName" component={renderInput} label="Name" disabled />
                                        <Field type="select" name="deliveryMedium" component={renderSelect} label="Delivery Medium" validate={required}>
                                            <option key="Bicycle" value="Bicycle">Bicycle</option>
                                            <option key="Motorcycle" value="Motorcycle">Motorcycle</option>
                                        </Field>
                                        <Field type="select" name="deliveryPersonStatus" component={renderSelect} label="Status" validate={required}>
                                            <option key="Pending" value="Pending">Pending</option>
                                            <option key="Approved" value="Approved">Approved</option>
                                            <option key="Rejected" value="Rejected">Rejected</option>
                                            <option key="Blocked" value="Blocked">Blocked</option>
                                        </Field>
                                        <Field type="text" name="deliveryPersonStatusMessage" component={renderInput} label="Message" />
                                        <button type="submit" className="btn btn-primary" disabled={submitting || pristine}>
                                            <Spinner isLoading={isChangingDeliveryPersonStatus} /> &nbsp;Submit
                                        </button>
                                        <div className="text-danger-div">
                                            {(fatalErrorForm || authErrorForm) && !submitting && <span className="text-danger">{fatalErrorForm || authErrorForm}</span>}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>}
                    </div>
                    <Modal
                        title="Error"
                        visible={this.state.showErrorModal}
                        onClose={this.onCloseModal}
                        closable={true}
                        className="word-break"
                        animation="slide-fade"
                        maskAnimation="fade"
                        footer={
                            [
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    key="close"
                                    onClick={this.onCloseModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.modalMessage}</b>
                    </Modal>
                </section>: <NoContentFound />}
            </React.Fragment>
        );
    }
}

DeliveryPersonStatus = reduxForm({
    form: 'deliveryPersonStatus',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(DeliveryPersonStatus);

const mapStateToProps = (state) => {
    return {
        isFetchingAdminData: createLoadingSelector(['CHECK_AUTH_ADMIN'])(state),
        auth: state.auth,
        deliveryPersonStatusReducer: state.deliveryPersonStatusReducer,
        isFetchingDeliveryPersonData: createLoadingSelector(['DELIVERY_PERSON_STATUS'])(state),
        isChangingDeliveryPersonStatus: createLoadingSelector(['DELIVERY_PERSON_STATUS_CHANGE'])(state)
    };
}

export default connect(mapStateToProps, { checkAuthAdmin, deliveryPersonStatus, deliveryPersonStatusChange })(DeliveryPersonStatus);