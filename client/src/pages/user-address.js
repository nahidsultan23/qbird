import React from 'react'
import { connect } from 'react-redux';
import { Field, getFormValues, reduxForm } from 'redux-form';
import 'rc-dialog/assets/index.css';
import Modal from 'rc-dialog';

import { authCheckUserAddress, userAddressSubmit } from '../store/actions/userAddressActions';
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
import renderCheckbox from '../constants/forms/renderCheckbox';

class UserAddress extends React.Component {

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
        const { checkoutID } = state;
        this.setState({ checkoutID: checkoutID });

        this.props.authCheckUserAddress({ }).then(() => {
            const { status, errorMessage } = this.props.userAddressData.payload;
            if(status === "success") {
                this.setState({
                    addressName: this.props.userAddressData.payload.addressName
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

        this.props.fetchLocation().then(() => {
            const { status, location } = this.props.locationData.payload;
            let latitude = Number(location.lat);
            let longitude = Number(location.long);

            if(status === 'success') {
                this.setState({
                    center: {
                        lat: latitude,
                        lng: longitude
                    }
                });
            }
            else {
                const success = (position) => {
                    const latitude = Number(position.coords.latitude);
                    const longitude = Number(position.coords.longitude);
            
                    localStorage.setItem('fetchLocation', 'success');
                    localStorage.setItem('lat', latitude);
                    localStorage.setItem('long', longitude);
        
                    this.setState({
                        center: {
                            lat: latitude,
                            lng: longitude
                        }
                    });
                };
                
                const error = () => {
                    this.setState({
                        center: {
                            lat: latitude,
                            lng: longitude
                        }
                    });
                };
                
                navigator.geolocation.getCurrentPosition(success, error);
            }
        })
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

    onChangeSaveAddress = (value) => {
        if(value) {
            if(this.state.save === false) {
                this.props.change("addressName", this.state.addressName);
            }
            this.setState({
                save: true
            })
        }
        else {
            this.setState({
                save: false
            })
        }
    }

    onChangeAddressName = (value, allValues) => {
        if(allValues.saveAddress && value) {
            this.setState({
                addressName: value
            })
        }
    }

    onCloseLocationErrorModal = () => {
        this.setState({ showLocationErrorModal: false });
    }

    onSubmit = () => {
        const { checkoutID, addressName, userCoordinate, address, save } = this.state;
        return this.props.userAddressSubmit({ checkoutID: checkoutID, addressName: addressName, coordinate: userCoordinate, address: address, save: save }).then(() => {
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
        const { handleSubmit, submitting, isSubmittingUserAddress } = this.props;
        const { fatalErrorForm, authErrorForm } = this.state;
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="products-collections-area ptb-60">
                    <div className="items-container">
                        <div className="user-address-form-container">
                            <form className="user-address" onSubmit={handleSubmit(this.onSubmit)}>
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
                                <div>
                                    <Field name="saveAddress" type="checkbox" component={renderCheckbox} label="Save this Address for future orders" validate={this.onChangeSaveAddress} />
                                </div>
                                {this.state && this.state.save && <div>
                                    <Field type="text" name="addressName" component={renderInput} label="Address Name" placeholder="Enter Address Name, e.g: Home, Office, etc."
                                        validate={[required, maxLength100, this.onChangeAddressName]} maxLength="100" />
                                </div>}
                                <div className="proceed-to-checkout-container">
                                    <button type="submit" className="btn btn-primary order-btn" disabled={submitting || isSubmittingUserAddress}><Spinner isLoading={isSubmittingUserAddress} /> &nbsp;Proceed to Checkout</button>
                                    {(fatalErrorForm || authErrorForm) && <div className="text-danger-div">
                                        <span className="text-danger">{fatalErrorForm || authErrorForm}</span>
                                    </div>}
                                </div>
                            </form>
                        </div>
                    </div>
                    
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
        isCheckingAuth: createLoadingSelector(['AUTH_CHECK_USER_ADDRESS'])(state),
        isSubmittingUserAddress: createLoadingSelector(['USER_ADDRESS_SUBMIT'])(state),
        userAddressData: state.userAddressReducer,
        locationData: state.locationReducer
    };
}

UserAddress = reduxForm({
    form: 'userAddress',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(UserAddress);

export default connect(mapStateToProps, { authCheckUserAddress, userAddressSubmit, fetchLocation })(UserAddress);
