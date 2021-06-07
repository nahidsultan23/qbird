import React from 'react'
import { connect } from 'react-redux';
import { Field, getFormValues, reduxForm } from 'redux-form';
import 'rc-dialog/assets/index.css';
import Modal from 'rc-dialog';

import { authCheckEditUserAddress, userAddressEditSubmit } from '../store/actions/userAddressActions';
import { fetchLocation } from '../store/actions/locationActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Map from '../components/Maps/Map';
import renderInput from '../constants/forms/renderInput';
import renderTextarea from '../constants/forms/renderTextarea';
import { required, maxLength100, maxLength2000, minLength5 } from '../constants/forms/fieldLevelValidation';
import history from '../history';
import Spinner from '../components/Common/Spinner';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import renderServerErrors from '../constants/forms/renderServerErrors';

class UserAddressEdit extends React.Component {

    state = {
        checkoutID: null,
        addressName: "",
        userCoordinate: {
            lat: null,
            long: null
        },
        location: null,
        address: null,
        fatalErrorForm: null,
        showLocationErrorModal: false,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        const { state } = this.props.location;
        if (!state || !state.checkoutID) {
            return history.replace('/cart');
        }
        const { checkoutID, address, addressID, addressName, coordinate } = state;
        this.setState({
            checkoutID: checkoutID,
            addressID: addressID
        });

        if(addressID) {
            this.props.authCheckEditUserAddress({ addressID: addressID }).then(() => {
                const { status, errorMessage } = this.props.userAddressData.payload;
                if(status === "success") {
                    const { address, addressName, coordinate } = this.props.userAddressData.payload;
                    this.setState({
                        address: address,
                        addressName: addressName,
                        center: {
                            lat: coordinate.lat,
                            lng: coordinate.long
                        }
                    });

                    this.props.change("addressName", addressName);
                    this.props.change("address", address);
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
        else {
            if(address && addressName && coordinate) {
                this.setState({
                    address: address,
                    addressName: addressName,
                    center: coordinate
                });
    
                this.props.change("addressName", addressName);
                this.props.change("address", address);
            }
            else {
                this.setState({
                    errorMessage: {
                        fatalError: "Something went wrong!!"
                    }
                });
            }
        }
    }

    onPlacesChanged = (location) => {
        const { coordinate, address } = location;
        const { lat, lng } = coordinate;
        this.setState({
            userCoordinate: {
                lat: lat,
                long: lng
            },
            location: address
        });
        this.props.change('location', `${address}`);
    }

    onAddressChanged = (e) => {
        this.setState({
            address: e.target.value
        });
    }

    onChangeAddressName = (value) => {
        if(value) {
            this.setState({
                addressName: value
            })
        }
    }

    onCloseLocationErrorModal = () => {
        this.setState({ showLocationErrorModal: false });
    }

    onSubmit = () => {
        const { checkoutID, addressID, addressName, userCoordinate, address, save } = this.state;
        return this.props.userAddressEditSubmit({ checkoutID: checkoutID, addressID: addressID, addressName: addressName, coordinate: userCoordinate, address: address, save: save }).then(() => {
            const { status } = this.props.userAddressData.payload;
            if(status === "success") {
                history.push('/checkout', { checkoutID: checkoutID });
            }
            else {
                const { fatalError, authError } = this.props.userAddressData.payload.errorMessage;
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
                    renderServerErrors(this.props.userAddressData.payload);
                }
            }
        });
    }

    render() {
        const { handleSubmit, submitting, isCheckingAuth, isSubmittingUserAddress } = this.props;
        const { fatalErrorForm, authErrorForm, addressID } = this.state;
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="products-collections-area ptb-60">
                    {isCheckingAuth ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isCheckingAuth} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> :
                    <div className="items-container">
                        <div className="user-address-form-container">
                            <form className="user-address" onSubmit={handleSubmit(this.onSubmit)}>
                                <div>
                                    <Field type="text" name="addressName" component={renderInput} label="Address Name" placeholder="Enter Address Name, e.g: Home, Office, etc."
                                        validate={[required, maxLength100, this.onChangeAddressName]} maxLength="100" disabled={!addressID} />
                                </div>
                                <div className="mark-the-location">
                                    Mark the Shipping Location on the Map
                                </div>
                                <div className="map-container">
                                    {this.state.center && <div>
                                        <Map center={this.state.center} onPlacesChanged={this.onPlacesChanged} canMakeChanges={true} />
                                    </div>}
                                    <div className="location-container">
                                        <Field type="text" name="location" component={renderInput} validate={[required]} readOnly disabled />
                                    </div>
                                </div>
                                <div className="address-area">
                                    <Field type="text" name="address" component={renderTextarea} onChange={this.onAddressChanged} label="Shipping Address" placeholder="Enter Shipping Address, e.g: House No, Road No, Area, etc."
                                        validate={[required, maxLength2000, minLength5]} minLength="5" maxLength="2000" rows={5} cols={10} />
                                </div>
                                <div className="proceed-to-checkout-container">
                                    <button type="submit" className="btn btn-primary order-btn" disabled={submitting || isSubmittingUserAddress}><Spinner isLoading={isSubmittingUserAddress} /> &nbsp;Edit Shipping Address</button>
                                    {(fatalErrorForm || authErrorForm) && <div className="text-danger-div">
                                        <span className="text-danger">{fatalErrorForm || authErrorForm}</span>
                                    </div>}
                                </div>
                            </form>
                        </div>
                    </div>}
                    
                    <Modal
                        title="Error"
                        visible={this.state.showLocationErrorModal}
                        onClose={this.onCloseLocationErrorModal}
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
                                    onClick={this.onCloseLocationErrorModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        {this.state.errorMessage.locationError}
                    </Modal>
                </section>}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('user-address')(state),
        isCheckingAuth: createLoadingSelector(['AUTH_CHECK_EDIT_USER_ADDRESS'])(state),
        isSubmittingUserAddress: createLoadingSelector(['USER_ADDRESS_EDIT_SUBMIT'])(state),
        userAddressData: state.userAddressReducer,
        locationData: state.locationReducer
    };
}

UserAddressEdit = reduxForm({
    form: 'userAddress',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(UserAddressEdit);

export default connect(mapStateToProps, { authCheckEditUserAddress, userAddressEditSubmit, fetchLocation })(UserAddressEdit);
