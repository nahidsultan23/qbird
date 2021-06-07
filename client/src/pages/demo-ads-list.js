import React from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { reduxForm, Field, getFormValues } from 'redux-form';

import { getListedDemoAds, removeAdFromList, addDemoAdToUserAccount } from '../store/actions/demoAdActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import AccountTab from '../components/HOC/AccountTab';
import renderInput from '../constants/forms/renderInput';
import renderSelect from '../constants/forms/renderSelect';
import renderServerError from '../constants/forms/renderServerErrors';
import { required, minLength10, maxLength11 } from '../constants/forms/fieldLevelValidation';
import { numbers, noSpace } from '../constants/forms/fieldNormalization';
import Spinner from '../components/Common/Spinner';
import { truncate } from '../services/common';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class DemoAdsListComp extends React.Component {

    state = {
        permissions: {},
        listedDemoAds: [],
        showDeleteModal: false,
        showSubmitModal: false,
        showErrorModal: false,
        errorModalMessage: null,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.getListedDemoAds().then(() => {
            const { status, permissions, listedDemoAds, errorMessage } = this.props.demoAdsData.payload;
            if(status === "success") {
                this.setState({
                    permissions: permissions,
                    listedDemoAds: listedDemoAds
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

    removeItem = () => {
        const { deletingAdId } = this.state;
        this.props.removeAdFromList({ adID: deletingAdId }).then(() => {
            this.setState({
                showDeleteModal: false
            });
            const { status, errorMessage } = this.props.demoAdsData.payload;
            if(status === "success") {
                let listedDemoAds = this.state.listedDemoAds;
                if(listedDemoAds.length > 1) {
                    let index = listedDemoAds.findIndex(a => a.adID === deletingAdId);
                    if(index > -1) {
                        listedDemoAds.splice(index, 1);
                    }
                }
                else {
                    listedDemoAds = [];
                }
                this.setState({
                    deletingAdId: null,
                    listedDemoAds: listedDemoAds
                });
            }
            else {
                const { fatalError, authError, permissionError } = errorMessage;
                this.setState({
                    showErrorModal: true,
                    errorModalMessage: fatalError ? fatalError : authError ? authError : permissionError
                })
            }
        });
    }

    onCloseDeleteModal = () => {
        this.setState({ showDeleteModal: false, deletingCartId: null });
    }

    onCloseSubmitModal = () => {
        this.setState({
            showSubmitModal: false,
            fatalErrorForm: null,
            authErrorForm: null
        });
    }

    onOpenSubmitModal = () => {
        const { reset } = this.props;
        reset();
        this.setState({ showSubmitModal: true })
    }

    onCloseErrorModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    onSubmit = (formValues) => {
        const { countryCode, phoneNumber, shopID } = formValues;
        const { listedDemoAds } = this.state;
        return this.props.addDemoAdToUserAccount({ countryCode, phoneNumber, urlName: shopID, adID: listedDemoAds.map((a => a.adID)) }).then(() => {
            const { status, errorMessage } = this.props.demoAdsData.payload;
            if(status === "success") {
                this.setState({
                    fatalErrorForm: null,
                    authErrorForm: null,
                    showSubmitModal: false 
                });
            }
            else {
                const { fatalError, authError, permissionError } = errorMessage;
                if (fatalError || authError || permissionError) {
                    this.setState({
                        fatalErrorForm: fatalError ? fatalError : permissionError,
                        authErrorForm: authError
                    });
                }
                else {
                    this.setState({
                        fatalErrorForm: null,
                        authErrorForm: null
                    });
                    renderServerError(this.props.demoAdsData.payload);
                }
            }
        });
    }

    renderAdsList = (ads) => {
        return ads.map(({ adName, adID }) => {
            return (
                <tr key={adID}>
                    <td className="product-name demo-ad-id">
                        <Link to={`/account/demo-ads/${adID}`}>
                            {adID}
                        </Link>
                    </td>
                    <td className="product-name">
                        <Link to={`/account/demo-ads/${adID}`}>{truncate(adName, 25)}</Link>
                    </td>
                    <td className="product-subtotal">
                        <span className="remove cursor-pointer" onClick={() => this.setState({ showDeleteModal: true, deletingAdId: adID })}><i className="far fa-trash-alt"></i></span>
                    </td>
                </tr>
            )
        })
    }

    render() {
        const { attachDemoAd } = this.state.permissions;
        const { ads, handleSubmit, isFetchingListedDemoAds, isAddingToUserAccount, isModifyingList, submitting } = this.props;
        const { fatalError, authError } = this.state.errorMessage;
        const { listedDemoAds, fatalErrorForm, authErrorForm } = this.state;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                isFetchingListedDemoAds ? <React.Fragment><div className="row align-items-center">
                        <div className="col d-flex justify-content-center">
                            <Spinner isLoading={isFetchingListedDemoAds} /> &nbsp;Fetching...
                        </div>
                    </div>
                </React.Fragment> :
                attachDemoAd ? <section className="cart-area ptb-60">
                    <div className="container">
                        <div className="row">
                            {(ads && ads.length === 0) ?
                                <div className="col-lg-12 col-md-12">
                                    <p> Looks like you have no Demo Ad in your List.
                                    <Link className="display-inline" to={'/account/demo-ads'}> Click here</Link> to add Demo Ads.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12 demo-ad-list">
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered text-center">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Ad ID</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {listedDemoAds && this.renderAdsList(listedDemoAds)}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="cart-buttons">
                                            <div className="row align-items-center">
                                                <div className="col-lg-7 col-md-7">
                                                    <div className="continue-shopping-box">
                                                        <button type="button" className="btn btn-light" onClick={() => this.onOpenSubmitModal()}>Add to the User's Shop</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>}
                        </div>
                    </div>
                    <Modal
                        title="Confirmation"
                        visible={this.state.showDeleteModal}
                        onOk={this.removeItem}
                        onClose={this.onCloseDeleteModal}
                        closable={true}
                        animation="slide-fade"
                        maskAnimation="fade"
                        footer={
                            [
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    key="close"
                                    onClick={this.onCloseDeleteModal}
                                >
                                    Keep
                                </button>,
                                <button
                                    type="button"
                                    className="btn btn-light modal-remove-button"
                                    key="save"
                                    onClick={this.removeItem}
                                >
                                    <Spinner isLoading={isModifyingList} /> &nbsp;Remove
                                </button>,
                            ]
                        }
                    >
                        Are you sure you want to remove this item?
                    </Modal>
                    <Modal
                        title="Attach to Shop"
                        visible={this.state.showSubmitModal}
                        onClose={this.onCloseSubmitModal}
                        closable={true}
                        animation="slide-fade"
                        maskAnimation="fade"
                    >
                        <form className="create-ad-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="select" name="countryCode" component={renderSelect} label="Country Code" validate={[required]}>
                                <option value="Bangladesh (+880)">Bangladesh (+880)</option>
                            </Field>
                            <Field type="text" name="phoneNumber" component={renderInput} placeholder="Enter Phone Number" label="Phone Number"
                                validate={[required, minLength10, maxLength11]} normalize={numbers} maxLength="11" />
                            <Field type="text" name="shopID" component={renderInput} placeholder="Enter Shop ID" label="Shop ID" validate={[required]} normalize={noSpace} />
                            <button type="submit" className="btn btn-primary" disabled={submitting || isAddingToUserAccount}>
                                <Spinner isLoading={isAddingToUserAccount} /> &nbsp;Attach</button>
                            <button type="button" className="btn btn-default" onClick={this.onCloseSubmitModal}>Cancel</button>
                            <div className="text-danger-div">
                                {(fatalErrorForm || authErrorForm) && !submitting && <span className="text-danger">{fatalErrorForm || authErrorForm}</span>}
                            </div>
                        </form>
                    </Modal>
                    <Modal
                        title="Error"
                        visible={this.state.showErrorModal}
                        onClose={this.onCloseErrorModal}
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
                                    onClick={this.onCloseErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        {this.state.errorModalMessage}
                    </Modal>
                </section> : <NoContentFound />}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isAddingToUserAccount: createLoadingSelector(['ADD_DEMO_AD_TO_USER_ACCOUNT'])(state),
        isModifyingList: createLoadingSelector(['DEMO_AD_REMOVE_FROM_LIST'])(state),
        isFetchingListedDemoAds: createLoadingSelector(['FETCH_LISTED_DEMO_ADS'])(state),
        formValues: getFormValues('add-to-user-account')(state),
        demoAdsData: state.demoAdReducer
    }
}

DemoAdsListComp = reduxForm({
    form: 'add-to-user-account',
    initialValues: {
        countryCode: 'Bangladesh (+880)'
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(DemoAdsListComp);

const DemoAdsList = AccountTab(DemoAdsListComp, "demoAds")

export default connect(mapStateToProps, { getListedDemoAds, addDemoAdToUserAccount, removeAdFromList })(DemoAdsList)