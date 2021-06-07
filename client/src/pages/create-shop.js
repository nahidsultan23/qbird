import React from 'react';
import { reduxForm, Field, getFormValues } from 'redux-form';
import { connect } from 'react-redux';

import Map from '../components/Maps/Map';
import PhotosUpload from '../components/Common/PhotosUpload';
import Spinner from '../components/Common/Spinner';
import renderInput from '../constants/forms/renderInput';
import renderSelect from '../constants/forms/renderSelect';
import renderTextarea from '../constants/forms/renderTextarea';
import renderCheckbox from '../constants/forms/renderCheckbox';
import renderInputGroup from '../constants/forms/renderInputGroup';
import { required, number, nonZeroPositive, minLength2, minLength5, minLength10, maxLength100, maxLength200, maxLength2000, maxLength5000, minValue0, maxValue1000000 } from '../constants/forms/fieldLevelValidation';
import { numbers } from '../constants/forms/fieldNormalization';
import renderServerError from '../constants/forms/renderServerErrors';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { authenticated } from '../store/actions/authActions';
import { checkAuthUpdateShop, createShop, updateShop } from '../store/actions/shopActions';
import { fetchLocation } from '../store/actions/locationActions';
import AccountTab from '../components/HOC/AccountTab';
import { capitalizeFirstLetter } from '../services/common';
import { Weekdays } from '../services/common';
import ShopDiscounts from '../components/Common/ShopDiscounts';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';

class CreateShopComp extends React.Component {

    state = {
        openingHourEveryday: false,
        midBreakEveryday: false,
        midBreakApplicable: false,
        photos: [],
        fatalError: null,
        openingHoursError: null,
        midBreaksError: null,
        photosError: null,
        location: null,
        shopID: null,
        governmentChargeOptional: true,
        extraChargeOptional: true,
        discounts: [],
        oldPhotos: [],
        oldPhotosName: [],
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        const { match } = this.props;
        const { params } = match;
        const { shopID } = params;

        if(shopID) {
            this.setState({ shopID: shopID });
            this.props.checkAuthUpdateShop({ urlName: shopID }).then(() => {
                const { status, data, shopData, errorMessage } = this.props.shopData.payload;
                if (status === 'success') {
                    this.setState({ data: data });
                    this.props.change("discountOn", "Shipping Charge");
                    this.props.change("discountType", "Percentage");
                    this.props.change("discountUnit", data.priceUnits[0]);
                    this.props.change("minOrderUnit", data.priceUnits[0]);
                    this.props.change("maxOrderUnit", data.priceUnits[0]);
                    this.props.change("maxAmountUnit", data.priceUnits[0]);

                    this.props.change("name", shopData.shopName);

                    const { shopCategories } = data;

                    let category = "Custom Category";
                    let subcategory = "";
                    let i = 0;
                    let categoryNameArray = [];
                    
                    while(shopCategories[i]) {
                        categoryNameArray.push(shopCategories[i].categoryName);
                        i++;
                    }

                    let categoryNameIndex = categoryNameArray.indexOf(shopData.category);

                    if(categoryNameIndex > -1) {
                        category = shopData.category;
                        if(shopData.subcategory) {
                            let subcategoryNameIndex = shopCategories[categoryNameIndex].subcategories.indexOf(shopData.subcategory);
                            
                            if(subcategoryNameIndex > -1) {
                                subcategory = shopData.subcategory;
                            }
                            else {
                                subcategory = "Custom Subcategory";
                            }
                        }
                    }
                    else if(shopData.subcategory) {
                        subcategory = "Custom Subcategory";
                    }
                    

                    this.props.change("category", category);
                    if(category === 'Custom Category') {
                        this.props.change("customCategory", shopData.category);
                    }
                    this.props.change("subcategory", subcategory);
                    if(subcategory === "Custom Subcategory") {
                        this.props.change("customSubcategory", shopData.subcategory);
                    }

                    this.props.change("address", shopData.address);
                    this.setState({ center: { ...this.state.center, lat: shopData.coordinate.lat, lng: shopData.coordinate.long } });
                    this.props.change("description", shopData.description);
                    this.props.change("instruction", shopData.instruction);
                    this.props.change("contactNo", shopData.contactNo);
                    if (shopData.openingHours && shopData.openingHours.everyday && shopData.openingHours.everyday.from && shopData.openingHours.everyday.to) {
                        this.props.change("openingHourEverydayFrom", shopData.openingHours.everyday.from);
                        this.props.change("openingHourEverydayTo", shopData.openingHours.everyday.to);
                        
                        Weekdays.forEach((weekday) => {
                            let fieldNameFrom = `openingHour${capitalizeFirstLetter(weekday)}From`;
                            let fieldNameTo = `openingHour${capitalizeFirstLetter(weekday)}To`;
                            this.props.change(fieldNameFrom, shopData.openingHours.everyday.from);
                            this.props.change(fieldNameTo, shopData.openingHours.everyday.to);
                        })

                    } else {
                        Object.keys(shopData.openingHours).forEach((key) => {
                            if (key !== 'everyday') {
                                let fieldNameFrom = `openingHour${capitalizeFirstLetter(key)}From`;
                                let fieldNameTo = `openingHour${capitalizeFirstLetter(key)}To`;
                                this.props.change(fieldNameFrom, shopData.openingHours[key].from);
                                this.props.change(fieldNameTo, shopData.openingHours[key].to);
                            }
                        });
                    }
                    if (shopData.midBreaks && shopData.midBreaks.everyday && shopData.midBreaks.everyday.from && shopData.midBreaks.everyday.to) {
                        this.setState({ midBreakApplicable: true });
                        this.props.change("midBreakApplicable", true);
                        this.props.change("midBreakEverydayFrom", shopData.midBreaks.everyday.from);
                        this.props.change("midBreakEverydayTo", shopData.midBreaks.everyday.to);
                        
                        Weekdays.forEach((weekday) => {
                            let fieldNameFrom = `midBreak${capitalizeFirstLetter(weekday)}From`;
                            let fieldNameTo = `midBreak${capitalizeFirstLetter(weekday)}To`;
                            this.props.change(fieldNameFrom, shopData.midBreaks.everyday.from);
                            this.props.change(fieldNameTo, shopData.midBreaks.everyday.to);
                        })
                    }
                    else if (shopData.midBreaks && Object.keys(shopData.midBreaks).length > 0) {
                        this.setState({ midBreakApplicable: true });
                        this.props.change("midBreakApplicable", true);
                        Object.keys(shopData.midBreaks).forEach((key) => {
                            if (key !== 'everyday') {
                                let fieldNameFrom = `midBreak${capitalizeFirstLetter(key)}From`;
                                let fieldNameTo = `midBreak${capitalizeFirstLetter(key)}To`;
                                if(shopData.midBreaks[key]) {
                                    this.props.change(fieldNameFrom, shopData.midBreaks[key].from);
                                    this.props.change(fieldNameTo, shopData.midBreaks[key].to);
                                }
                            }
                        });
                    }
                    this.props.change("governmentCharge", shopData.governmentCharge);
                    this.props.change("governmentChargeDescription", shopData.governmentChargeDescription);
                    this.props.change("governmentChargeRegNo", shopData.governmentChargeRegNo);
                    this.props.change("extraCharge", shopData.extraCharge);
                    this.props.change("extraChargeDescription", shopData.extraChargeDescription);
                    this.props.change("processingCapacity", shopData.processingCapacity);
                    this.props.change("productReturnApplicable", shopData.productReturnApplicable);
                    this.props.change("productReturnPolicy", shopData.productReturnPolicy);
                    this.props.change("discountTag", shopData.discountTag);
                    if(shopData.discounts) {
                        this.setState({ discounts: shopData.discounts });
                    }
                    if(shopData.governmentCharge) {
                        this.setState({ governmentChargeOptional: false });
                    }
                    if(shopData.extraCharge) {
                        this.setState({ extraChargeOptional: false });
                    }

                    this.setState({ oldPhotos: shopData.photos });
                }
                else {
                    const { fatalError, authError, contentUnavailable } = errorMessage;
                    this.setState({
                        errorMessage: {
                            fatalError: fatalError,
                            authError: authError,
                            contentUnavailable: contentUnavailable
                        }
                    });
                }
            });
        }
        else {
            this.props.authenticated().then(() => {
                const data = this.props.auth.payload;
                const { status, errorMessage } = data;
                if(status === 'success') {
                    this.setState({ data: data });
                    this.props.change("contactNo", data.phoneNumber);
                    this.props.change("discountOn", "Shipping Charge");
                    this.props.change("discountType", "Percentage");
                    this.props.change("discountUnit", data.priceUnits[0]);
                    this.props.change("minOrderUnit", data.priceUnits[0]);
                    this.props.change("maxOrderUnit", data.priceUnits[0]);
                    this.props.change("maxAmountUnit", data.priceUnits[0]);

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
                                latitude = Number(position.coords.latitude);
                                longitude = Number(position.coords.longitude);
                        
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
                else {
                    const { fatalError, authError } = errorMessage;
                    this.setState({
                        errorMessage: {
                            fatalError: fatalError,
                            authError: authError,
                        }
                    });
                }
            });
        }
    }

    componentDidUpdate() {
        const { category } = this.props.formValues;
        if (this.state.data && this.state.data.shopCategories && !category) {
            this.props.change('category', this.state.data.shopCategories[0].categoryName);
            this.state.data.shopCategories.push({ subcategories: [], categoryName: 'Custom Category' });
        }
    }

    onChangeOHEDChk = ({ target }) => {
        const { checked } = target;
        const { openingHourEverydayFrom, openingHourEverydayTo } = this.props.formValues;
        this.setState({ openingHourEveryday: checked });
        if (checked) {
            this.props.change('openingHourSundayFrom', openingHourEverydayFrom);
            this.props.change('openingHourSundayTo', openingHourEverydayTo);
            this.props.change('openingHourMondayFrom', openingHourEverydayFrom);
            this.props.change('openingHourMondayTo', openingHourEverydayTo);
            this.props.change('openingHourTuesdayFrom', openingHourEverydayFrom);
            this.props.change('openingHourTuesdayTo', openingHourEverydayTo);
            this.props.change('openingHourWednesdayFrom', openingHourEverydayFrom);
            this.props.change('openingHourWednesdayTo', openingHourEverydayTo);
            this.props.change('openingHourThursdayFrom', openingHourEverydayFrom);
            this.props.change('openingHourThursdayTo', openingHourEverydayTo);
            this.props.change('openingHourFridayFrom', openingHourEverydayFrom);
            this.props.change('openingHourFridayTo', openingHourEverydayTo);
            this.props.change('openingHourSaturdayFrom', openingHourEverydayFrom);
            this.props.change('openingHourSaturdayTo', openingHourEverydayTo);
        } else {
            this.props.change('openingHourEverydayFrom', null);
            this.props.change('openingHourEverydayTo', null);
        }
    }

    onChangeOHEDFrom = ({ target }) => {
        const { value } = target;
        this.props.change('openingHourSundayFrom', value);
        this.props.change('openingHourMondayFrom', value);
        this.props.change('openingHourTuesdayFrom', value);
        this.props.change('openingHourWednesdayFrom', value);
        this.props.change('openingHourThursdayFrom', value);
        this.props.change('openingHourFridayFrom', value);
        this.props.change('openingHourSaturdayFrom', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('openingHourEveryday', true);
        } else {
            this.props.change('openingHourEveryday', false);
        }
    }

    onChangeOHEDTo = ({ target }) => {
        const { value } = target;
        this.props.change('openingHourSundayTo', value);
        this.props.change('openingHourMondayTo', value);
        this.props.change('openingHourTuesdayTo', value);
        this.props.change('openingHourWednesdayTo', value);
        this.props.change('openingHourThursdayTo', value);
        this.props.change('openingHourFridayTo', value);
        this.props.change('openingHourSaturdayTo', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('openingHourEveryday', true);
        } else {
            this.props.change('openingHourEveryday', false);
        }
    }

    onChangeMBEDChk = ({ target }) => {
        const { checked } = target;
        const { midBreakEverydayFrom, midBreakEverydayTo } = this.props.formValues;
        this.setState({ midBreakEveryday: checked });
        if (checked) {
            this.props.change('midBreakSundayFrom', midBreakEverydayFrom);
            this.props.change('midBreakSundayTo', midBreakEverydayTo);
            this.props.change('midBreakMondayFrom', midBreakEverydayFrom);
            this.props.change('midBreakMondayTo', midBreakEverydayTo);
            this.props.change('midBreakTuesdayFrom', midBreakEverydayFrom);
            this.props.change('midBreakTuesdayTo', midBreakEverydayTo);
            this.props.change('midBreakWednesdayFrom', midBreakEverydayFrom);
            this.props.change('midBreakWednesdayTo', midBreakEverydayTo);
            this.props.change('midBreakThursdayFrom', midBreakEverydayFrom);
            this.props.change('midBreakThursdayTo', midBreakEverydayTo);
            this.props.change('midBreakFridayFrom', midBreakEverydayFrom);
            this.props.change('midBreakFridayTo', midBreakEverydayTo);
            this.props.change('midBreakSaturdayFrom', midBreakEverydayFrom);
            this.props.change('midBreakSaturdayTo', midBreakEverydayTo);
        }
    }

    onChangeMBApplicable = ({ target }) => {
        const { checked } = target;
        this.setState({ midBreakApplicable: checked });
    }

    onChangeMBEDFrom = ({ target }) => {
        const { value } = target;
        this.props.change('midBreakSundayFrom', value);
        this.props.change('midBreakMondayFrom', value);
        this.props.change('midBreakTuesdayFrom', value);
        this.props.change('midBreakWednesdayFrom', value);
        this.props.change('midBreakThursdayFrom', value);
        this.props.change('midBreakFridayFrom', value);
        this.props.change('midBreakSaturdayFrom', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('midBreakEveryday', true);
        } else {
            this.props.change('midBreakEveryday', false);
        }
    }

    onChangeMBEDTo = ({ target }) => {
        const { value } = target;
        this.props.change('midBreakSundayTo', value);
        this.props.change('midBreakMondayTo', value);
        this.props.change('midBreakTuesdayTo', value);
        this.props.change('midBreakWednesdayTo', value);
        this.props.change('midBreakThursdayTo', value);
        this.props.change('midBreakFridayTo', value);
        this.props.change('midBreakSaturdayTo', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('midBreakEveryday', true);
        } else {
            this.props.change('midBreakEveryday', false);
        }
    }

    onChangeOHWeekDays = () => {
        this.setState({ openingHourEveryday: false });
        this.props.change('openingHourEveryday', false);
        this.props.change('openingHourEverydayFrom', null);
        this.props.change('openingHourEverydayTo', null);
    }

    onChangeMBWeekDays = () => {
        this.setState({ midBreakEveryday: false });
        this.props.change('midBreakEveryday', false);
        this.props.change('midBreakEverydayFrom', null);
        this.props.change('midBreakEverydayTo', null);
    }

    onPhotosUpdate = ({ serverPhotoIDs, oldPhotosName }) => {
        this.setState({ photos: serverPhotoIDs, oldPhotosName: oldPhotosName });
    }

    onGovernmentChargeChange = (e) => {
        if(e.target.value && (Number(e.target.value) !== 0)) {
            this.setState({ governmentChargeOptional: false });
        }
        else {
            this.setState({ governmentChargeOptional: true });
        }
    }

    onExtraChargeChange = (e) => {
        if(e.target.value && (Number(e.target.value) !== 0)) {
            this.setState({ extraChargeOptional: false });
        }
        else {
            this.setState({ extraChargeOptional: true });
        }
    }

    onDiscountsChange = (discounts) => {
        this.setState({
            discounts: discounts
        });
    }

    onSubmit = (formValues) => {
        const { shopID } = this.state;
        let requestObj = this.createRequestObj(formValues);
        if(shopID) {
            return this.props.updateShop(requestObj).then(() => {
                const { status, errorMessage } = this.props.shopData.payload;
                if(status !== "success") {
                    const { fatalError, authError, openingHours, midBreaks, discounts, photos } = errorMessage;

                    if (fatalError || authError || openingHours || midBreaks || discounts || photos) {
                        this.setState({
                            fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: authError,
                            openingHoursError: openingHours,
                            midBreaksError: midBreaks,
                            discountsError: discounts,
                            photosError: photos 
                        });
                    }
                    else{
                        this.setState({
                            fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: null,
                            openingHoursError: null,
                            midBreaksError: null,
                            discountsError: null,
                            photosError: null 
                        });
                        renderServerError(this.props.shopData.payload);
                    }
                }
            });
        } else {
            return this.props.createShop(requestObj).then(() => {
                const { status, errorMessage } = this.props.shopData.payload;
                if(status !== "success") {
                    const { fatalError, authError, openingHours, midBreaks, discounts, photos } = errorMessage;

                    if (fatalError || authError || openingHours || midBreaks || discounts || photos) {
                        this.setState({
                            fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: authError,
                            openingHoursError: openingHours,
                            midBreaksError: midBreaks,
                            discountsError: discounts,
                            photosError: photos 
                        });
                    }
                    else{
                        this.setState({
                            fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: null,
                            openingHoursError: null,
                            midBreaksError: null,
                            discountsError: null,
                            photosError: null 
                        });
                        renderServerError(this.props.shopData.payload);
                    }
                }
            });
        }
    }

    getCategory = () => {
        const { category, customCategory } = this.props.formValues;
        if (category && category.indexOf('Custom Category') > -1 && customCategory)
            return customCategory;
        return category;
    }

    getSubcategory = () => {
        const { subcategory, customSubcategory } = this.props.formValues;
        if (!subcategory)
            return '';
        if (subcategory && subcategory.indexOf('Custom Subcategory') > -1 && customSubcategory)
            return customSubcategory;
        return subcategory;
    }

    createRequestObj = (formValues) => {
        //#region formvalues
        const {
            name,
            description,
            address,
            instruction,
            contactNo,
            openingHourSundayFrom,
            openingHourMondayFrom,
            openingHourTuesdayFrom,
            openingHourWednesdayFrom,
            openingHourThursdayFrom,
            openingHourFridayFrom,
            openingHourSaturdayFrom,
            openingHourEverydayFrom,
            openingHourSundayTo,
            openingHourMondayTo,
            openingHourTuesdayTo,
            openingHourWednesdayTo,
            openingHourThursdayTo,
            openingHourFridayTo,
            openingHourSaturdayTo,
            openingHourEverydayTo,
            midBreakApplicable,
            midBreakSundayFrom,
            midBreakMondayFrom,
            midBreakTuesdayFrom,
            midBreakWednesdayFrom,
            midBreakThursdayFrom,
            midBreakFridayFrom,
            midBreakSaturdayFrom,
            midBreakEverydayFrom,
            midBreakSundayTo,
            midBreakMondayTo,
            midBreakTuesdayTo,
            midBreakWednesdayTo,
            midBreakThursdayTo,
            midBreakFridayTo,
            midBreakSaturdayTo,
            midBreakEverydayTo,
            governmentCharge,
            governmentChargeDescription,
            governmentChargeRegNo,
            extraCharge,
            extraChargeDescription,
            processingCapacity,
            productReturnApplicable,
            productReturnPolicy,
            discountTag
        } = formValues;
        //#endregion
        const { shopID } = this.state;
        let request =
        {
            name: name ? name : null,
            category: this.getCategory(),
            subcategory: this.getSubcategory(),
            description: description ? description : null,
            coordinate: this.state.location,
            address: address ? address : null,
            instruction: instruction ? instruction : null,
            contactNo: contactNo ? contactNo : null,
            openingHours: null,
            midBreaks: null,
            midBreakApplicable: false,
            governmentCharge: governmentCharge ? governmentCharge : null,
            governmentChargeDescription: governmentChargeDescription ? governmentChargeDescription : null,
            governmentChargeRegNo: governmentChargeRegNo ? governmentChargeRegNo : null,
            extraCharge: extraCharge ? extraCharge : null,
            extraChargeDescription: extraChargeDescription ? extraChargeDescription : null,
            processingCapacity: processingCapacity ? processingCapacity : null,
            productReturnApplicable: productReturnApplicable ? productReturnApplicable : null,
            productReturnPolicy: productReturnPolicy ? productReturnPolicy : null,
            discounts: (this.state.discounts && this.state.discounts.length > 0) ? this.state.discounts : [],
            discountTag: discountTag ? discountTag : null,
            photos: [],
            oldPhotos: []
        };
        //#region oh
        let openingHours = null;
        if (openingHourEverydayFrom && openingHourEverydayTo) {
            openingHours = {
                ...openingHours,
                everyday: {
                    from: openingHourEverydayFrom,
                    to: openingHourEverydayTo
                }
            }
        }
        if (openingHourSundayFrom && openingHourSundayTo) {
            openingHours = {
                ...openingHours,
                sunday: {
                    from: openingHourSundayFrom,
                    to: openingHourSundayTo
                }
            }
        }
        if (openingHourMondayFrom && openingHourMondayTo) {
            openingHours = {
                ...openingHours,
                monday: {
                    from: openingHourMondayFrom,
                    to: openingHourMondayTo
                }
            }
        }
        if (openingHourTuesdayFrom && openingHourTuesdayTo) {
            openingHours = {
                ...openingHours,
                tuesday: {
                    from: openingHourTuesdayFrom,
                    to: openingHourTuesdayTo
                }
            }
        }
        if (openingHourWednesdayFrom && openingHourWednesdayTo) {
            openingHours = {
                ...openingHours,
                wednesday: {
                    from: openingHourWednesdayFrom,
                    to: openingHourWednesdayTo
                }
            }
        }
        if (openingHourThursdayFrom && openingHourThursdayTo) {
            openingHours = {
                ...openingHours,
                thursday: {
                    from: openingHourThursdayFrom,
                    to: openingHourThursdayTo
                }
            }
        }
        if (openingHourFridayFrom && openingHourFridayTo) {
            openingHours = {
                ...openingHours,
                friday: {
                    from: openingHourFridayFrom,
                    to: openingHourFridayTo
                }
            }
        }
        if (openingHourSaturdayFrom && openingHourSaturdayTo) {
            openingHours = {
                ...openingHours,
                saturday: {
                    from: openingHourSaturdayFrom,
                    to: openingHourSaturdayTo
                }
            }
        }
        request = { ...request, openingHours: openingHours };
        //#endregion
        //#region mb
        let midBreaks = null;
        if (midBreakApplicable) {
            request = { ...request, midBreakApplicable: true };
            if (midBreakEverydayFrom && midBreakEverydayTo) {
                midBreaks = {
                    ...midBreaks,
                    everyday: {
                        from: midBreakEverydayFrom,
                        to: midBreakEverydayTo
                    }
                }
            }
            if (midBreakSundayFrom && midBreakSundayTo) {
                midBreaks = {
                    ...midBreaks,
                    sunday: {
                        from: midBreakSundayFrom,
                        to: midBreakSundayTo
                    }
                }
            }
            if (midBreakMondayFrom && midBreakMondayTo) {
                midBreaks = {
                    ...midBreaks,
                    monday: {
                        from: midBreakMondayFrom,
                        to: midBreakMondayTo
                    }
                }
            }
            if (midBreakTuesdayFrom && midBreakTuesdayTo) {
                midBreaks = {
                    ...midBreaks,
                    tuesday: {
                        from: midBreakTuesdayFrom,
                        to: midBreakTuesdayTo
                    }
                }
            }
            if (midBreakWednesdayFrom && midBreakWednesdayTo) {
                midBreaks = {
                    ...midBreaks,
                    wednesday: {
                        from: midBreakWednesdayFrom,
                        to: midBreakWednesdayTo
                    }
                }
            }
            if (midBreakThursdayFrom && midBreakThursdayTo) {
                midBreaks = {
                    ...midBreaks,
                    thursday: {
                        from: midBreakThursdayFrom,
                        to: midBreakThursdayTo
                    }
                }
            }
            if (midBreakFridayFrom && midBreakFridayTo) {
                midBreaks = {
                    ...midBreaks,
                    friday: {
                        from: midBreakFridayFrom,
                        to: midBreakFridayTo
                    }
                }
            }
            if (midBreakSaturdayFrom && midBreakSaturdayTo) {
                midBreaks = {
                    ...midBreaks,
                    saturday: {
                        from: midBreakSaturdayFrom,
                        to: midBreakSaturdayTo
                    }
                }
            }
            request = { ...request, midBreaks: midBreaks };
        }
        //#endregion
        if (!shopID) {
            if (this.state.photos && this.state.photos.length > 0)
                request = { ...request, photos: this.state.photos };
        } else {
            request = {
                ...request,
                urlName: shopID
            };
            if (this.state.photos && this.state.photos.length > 0)
                request = { ...request, photos: this.state.photos };
            if (this.state.oldPhotosName && this.state.oldPhotosName.length > 0)
                request = { ...request, oldPhotos: this.state.oldPhotosName };
        }

        return request;
    }

    isGovCharDesRequired = (value, allValues) => {
        const isRequired = (allValues.governmentCharge !== undefined && allValues.governmentCharge !== null && allValues.governmentCharge !== "" && allValues.governmentCharge > 0)
        if (isRequired && !value)
            return 'Required';
    }

    isExtraCharDesRequired = (value, allValues) => {
        const isRequired = (allValues.extraCharge !== undefined && allValues.extraCharge !== null && allValues.extraCharge !== "" && allValues.extraCharge > 0)
        if (isRequired && !value)
            return 'Required';
    }

    onPlacesChanged = (location) => {
        const { address, coordinate } = location;
        const { lat, lng } = coordinate;
        this.setState({
            location: {
                lat: lat,
                long: lng
            }
        }
        );
        this.props.change('coordinate', `${address}`);
    }

    render() {
        const { handleSubmit, submitting, pristine, isFetching, isUploadingPhotos, formValues, isCheckingAuth, isFetchingShopDetails } = this.props;
        const { data, shopID, oldPhotos, governmentChargeOptional, extraChargeOptional, fatalErrorForm, authErrorForm, openingHoursError, midBreaksError, discounts, discountsError, photosError } = this.state;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="create-shop-area">
                    <div className="container">
                        <div className="create-shop-content">
                            <div className="section-title">
                                <h2><span className="dot"></span> {shopID ? 'Edit Shop Info' : 'Create Shop'} </h2>
                            </div>
                            {(isCheckingAuth || isFetchingShopDetails) ? <React.Fragment><div className="row align-items-center">
                                    <div className="col d-flex justify-content-center">
                                        <Spinner isLoading={isCheckingAuth || isFetchingShopDetails} /> &nbsp;Fetching...
                                    </div>
                                </div>
                            </React.Fragment> :
                            <form className="create-shop-form" onSubmit={handleSubmit(this.onSubmit)}>
                                <Field type="text" name="name" component={renderInput} placeholder="Enter Shop Name" label="Name" validate={[required, minLength2, maxLength200]} maxLength="200" disabled={shopID} />
                                <Field type="select" name="category" component={renderSelect} label="Category" validate={[required]} disabled={shopID}>
                                    {
                                        data && data.shopCategories && data.shopCategories.map((c, i) => <option key={i} value={c.categoryName}>{c.categoryName}</option>)
                                    }
                                </Field>
                                {formValues && formValues.category === 'Custom Category' &&
                                    <Field type="text" name="customCategory" component={renderInput} placeholder="Enter a Custom Category" validate={[required, maxLength100]} maxLength="100" disabled={shopID} />}
                                <Field type="select" name="subcategory" component={renderSelect} label="Subcategory (optional)">
                                    <option></option>
                                    {
                                        data && formValues && formValues.category &&
                                        data.shopCategories.find(c => c.categoryName === formValues.category) &&
                                        data.shopCategories.find(c => c.categoryName === formValues.category).subcategories.map((sc, i) => {
                                            return <option key={i} value={sc}>{sc}</option>
                                        })
                                    }
                                    <option key={'customSubcategory'} value={'Custom Subcategory'}>Custom Subcategory</option>
                                </Field>
                                {formValues && formValues.subcategory === 'Custom Subcategory' &&
                                    <Field type="text" name="customSubcategory" component={renderInput} placeholder="Enter a Custom Subcategory" validate={[required, maxLength100]} maxLength="100" />}
                                <Field type="text" name="description" component={renderTextarea} placeholder="Enter Shop Description" label="Description" validate={[required, minLength5, maxLength5000]} maxLength="5000" rows={7} cols={10} />
                                {this.state.center ? <div className="row">
                                    <div className="col-lg-12">
                                        {shopID ? <label>Shop Location on the Map</label> : <label>Mark the Shop Location on the Map</label>}
                                        <Map center={this.state.center} onPlacesChanged={this.onPlacesChanged} canMakeChanges={!shopID} />
                                    </div>
                                </div> : ''}
                                <div style={{ marginTop: '20px' }}>
                                    <Field type="text" name="coordinate" component={renderInput} label="Marked Location" validate={[required]} readOnly disabled />
                                </div>
                                <Field type="text" name="address" component={renderTextarea} placeholder="Enter Shop Address" label="Address" validate={[required, minLength5, maxLength2000]} maxLength="2000" rows={5} cols={10} disabled={shopID} />
                                <Field type="text" name="instruction" component={renderTextarea} placeholder="Enter Instructions to find the Shop Address" label="Instructions to Find the Shop Address (optional)" validate={[maxLength2000]} maxLength="2000" rows={5} cols={10} />
                                <Field type="text" name="contactNo" component={renderInput} placeholder="Enter Phone Number" label="Contact Number" validate={[required, minLength10, maxLength200]} maxLength="200" />
                                <React.Fragment>
                                    <label className="label">Opening Hours</label>
                                    {openingHoursError && <span className="text-danger">{openingHoursError}</span>}
                                    <Field name="openingHourEveryday" type="hidden" component={renderCheckbox} onChange={this.onChangeOHEDChk} />
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourEverydayFrom`} label="Everyday From" component={renderInput} onChange={this.onChangeOHEDFrom} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourEverydayTo`} label="Everyday To" component={renderInput} onChange={this.onChangeOHEDTo} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourSundayFrom`} label="Sunday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourSundayTo`} label="Sunday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourMondayFrom`} label="Monday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourMondayTo`} label="Monday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourTuesdayFrom`} label="Tuesday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourTuesdayTo`} label="Tuesday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourWednesdayFrom`} label="Wednesday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourWednesdayTo`} label="Wednesday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourThursdayFrom`} label="Thursday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourThursdayTo`} label="Thursday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourFridayFrom`} label="Friday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourFridayTo`} label="Friday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourSaturdayFrom`} label="Saturday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="time" name={`openingHourSaturdayTo`} label="Saturday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                        </div>
                                    </div>
                                </React.Fragment>
                                <React.Fragment>
                                    <div className="row">
                                        <div className="col-lg-12" style={{ margin: '10px 0px 10px 0px' }}>
                                            <Field name="midBreakApplicable" type="checkbox" label="Mid Breaks Applicable" component={renderCheckbox} onChange={this.onChangeMBApplicable} />
                                        </div>
                                    </div>
                                    {this.state.midBreakApplicable &&
                                        <React.Fragment>
                                            <label className="label">Mid Breaks</label>
                                            {midBreaksError && <span className="text-danger">{midBreaksError}</span>}
                                            <Field name="midBreakEveryday" type="hidden" component={renderCheckbox} onChange={this.onChangeMBEDChk} />
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakEverydayFrom`} label="Everyday From" component={renderInput} onChange={this.onChangeMBEDFrom} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakEverydayTo`} label="Everyday To" component={renderInput} onChange={this.onChangeMBEDTo}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakSundayFrom`} label="Sunday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakSundayTo`} label="Sunday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakMondayFrom`} label="Monday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakMondayTo`} label="Monday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakTuesdayFrom`} label="Tuesday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakTuesdayTo`} label="Tuesday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakWednesdayFrom`} label="Wednesday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakWednesdayTo`} label="Wednesday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakThursdayFrom`} label="Thursday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakThursdayTo`} label="Thursday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakFridayFrom`} label="Friday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakFridayTo`} label="Friday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakSaturdayFrom`} label="Saturday From" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                                <div className="col-lg-6">
                                                    <Field type="time" name={`midBreakSaturdayTo`} label="Saturday To" component={renderInput} onChange={this.onChangeMBWeekDays} />
                                                </div>
                                            </div>
                                        </React.Fragment>}
                                </React.Fragment>
                                <div className="row">
                                    <div className="col-lg-4">
                                        <Field type="text" name="governmentCharge" component={renderInputGroup} label="Government Charge (optional)" validate={[number, minValue0, maxValue1000000]} onChange={this.onGovernmentChargeChange} groupText={'%'} />
                                    </div>
                                </div>
                                <Field name="governmentChargeDescription" component={renderInput} placeholder="Describe what the Government Charge is for, e.g: VAT 15%" label={governmentChargeOptional ? "Government Charge Description (optional)" : "Government Charge Description"} validate={[maxLength100, this.isGovCharDesRequired]} maxLength="100" />
                                <Field name="governmentChargeRegNo" component={renderInput} placeholder="Enter Government Charge Registration Number, e.g: VAT Registration Number" label={governmentChargeOptional ? "Government Charge Registration Number (optional)" : "Government Charge Registration Number"} validate={[maxLength100, this.isGovCharDesRequired]} maxLength="100" />
                                <div className="row">
                                    <div className="col-lg-4">
                                        <Field type="text" name="extraCharge" component={renderInputGroup} label="Extra Charge (optional)" validate={[number, minValue0, maxValue1000000]} onChange={this.onExtraChargeChange} groupText={'%'} />
                                    </div>
                                </div>
                                <Field name="extraChargeDescription" component={renderInput} placeholder="Describe what the Extra Charge is for, e.g: Processing Fee 3%" label={extraChargeOptional ? "Extra Charge Description (optional)" : "Extra Charge Description"} validate={[maxLength100, this.isExtraCharDesRequired]} maxLength="100" />
                                <Field type="text" name="processingCapacity" component={renderInput} placeholder="Enter number of orders which can be processed at the same time" label="Processing Capacity" validate={[required, nonZeroPositive]} normalize={numbers} maxLength="15" />
                                <Field type="select" name="productReturnApplicable" component={renderSelect} label="Product Return Policy">
                                    <option key={'Applicable'} value="Applicable">Applicable</option>
                                    <option key={'Not applicable'} value="Not applicable">Not applicable</option>
                                </Field>
                                {formValues && (formValues.productReturnApplicable === 'Applicable') && <Field type="text" name="productReturnPolicy" component={renderTextarea} placeholder="Enter Product Return Policy" validate={[required, minLength5, maxLength5000]} maxLength="5000" rows={7} cols={10} />}
                                <ShopDiscounts formValues={formValues} onDiscountsChange={this.onDiscountsChange} discounts={discounts} priceUnits={this.state.data && this.state.data.priceUnits} discountsError={discountsError} />
                                <Field type="select" name="discountTag" component={renderSelect} label="Discount Tag (if you have any except the Discounts above)">
                                    <option key='' value=""></option>
                                    <option key={'Buy 1 get 1'} value="Buy 1 get 1">Buy 1 get 1</option>
                                    <option key={'Buy 2 get 1'} value="Buy 2 get 1">Buy 2 get 1</option>
                                    <option key={'Buy 1 get 2'} value="Buy 1 get 2">Buy 1 get 2</option>
                                </Field>
                                <PhotosUpload maximumPhotosCount={15} onPhotosUpdate={this.onPhotosUpdate} type="shop" oldPhotos={oldPhotos} />
                                {photosError && <span className="text-danger">{photosError}</span>}
                                <button type="submit" className="btn btn-primary next" disabled={submitting || pristine || isUploadingPhotos}> <Spinner isLoading={isFetching} /> &nbsp;{shopID ? 'Update Shop Info' : 'Create Shop'}</button>
                                {(fatalErrorForm || authErrorForm) && !submitting && <React.Fragment><span className="text-danger">{fatalErrorForm || authErrorForm}</span></React.Fragment>}
                            </form>}
                        </div>
                    </div>
                </section>}
            </React.Fragment >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('create-shop-form')(state),
        isFetching: createLoadingSelector(['CREATE_SHOP'])(state),
        isFetchingShopDetails: createLoadingSelector(['CHECK_AUTH_UPDATE_SHOP'])(state),
        isCheckingAuth: createLoadingSelector(['AUTHENTICATED_CHECK'])(state),
        isUploadingPhotos: createLoadingSelector(['PHOTO_UPLOAD'])(state),
        auth: state.auth,
        shopData: state.shopReducer,
        locationData: state.locationReducer
    };
}

CreateShopComp = reduxForm({
    form: 'create-shop-form',
    initialValues: {
        productReturnApplicable: "Applicable"
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CreateShopComp);

const CreateShop = AccountTab(CreateShopComp, 'ads');

export default connect(mapStateToProps, { createShop, updateShop, authenticated, checkAuthUpdateShop, fetchLocation })(CreateShop);