import React from 'react';
import { reduxForm, Field, getFormValues, getFormSyncErrors } from 'redux-form';
import { connect } from 'react-redux';

import Map from '../components/Maps/Map';
import PhotosUpload from '../components/Common/PhotosUpload';
import renderInput from '../constants/forms/renderInput';
import renderTextarea from '../constants/forms/renderTextarea';
import renderCheckbox from '../constants/forms/renderCheckbox';
import renderInputGroup from '../constants/forms/renderInputGroup';
import renderDimensionInput from '../constants/forms/renderDimensionInput';
import { required, number, nonZeroPositive, zeroPositive, minLength5, minLength10, maxLength100, maxLength200, maxLength2000, maxLength5000, maxValue1000000 } from '../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import renderSelect from '../constants/forms/renderSelect';
import Specifications from '../components/Common/Specifications';
import Options from '../components/Common/Options';
import { checkAuthUpdateAd, updateIndividualAd, updateShopAd } from '../store/actions/adActions';
import Spinner from '../components/Common/Spinner';
import renderServerError from '../constants/forms/renderServerErrors';
import AccountTab from '../components/HOC/AccountTab';
import { capitalizeFirstLetter } from '../services/common';
import { numbers } from '../constants/forms/fieldNormalization';
import { Weekdays } from '../services/common';
import AdDiscounts from '../components/Common/AdDiscounts';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';

class CreateAdComp extends React.Component {

    state = {
        adType: 'Individual Ad',
        shopAd: false,
        availableHoursEveryday: false,
        midBreakEveryday: false,
        midBreakApplicable: false,
        photos: [],
        fatalError: null,
        dimensionError: null,
        parcelDimensionError: null,
        availableHoursError: null,
        midBreaksError: null,
        photosError: null,
        location: null,
        data: null,
        options: [],
        specifications: [],
        isCreatingShopAd: false,
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
        const { params } = this.props.match;
        const { adID } = params;
        this.setState({ adID: adID });
        this.props.checkAuthUpdateAd({ adID: adID }).then(() => {
            const { status, data, adData, errorMessage } = this.props.adData.payload;
            if(status === "success") {
                this.setState({
                    data: data,
                    ad: adData,
                    center: {
                        lat: adData.coordinate.lat,
                        lng: adData.coordinate.long
                    }
                });
                this.props.change('extraPriceUnit', data.priceUnits[0]);
                this.props.change('extraWeightUnit', data.weightUnits[2]);
                this.props.change('optionType', "Optional");
                this.props.change("discountOn", "Number");
                this.props.change("discountType", "Amount");
                this.props.change("discountUnit", data.priceUnits[0]);
                this.props.change("minOrderUnit", "Unit");
                this.props.change("maxOrderUnit", "Unit");

                if (adData.shopID) {
                    this.props.change("shopID", adData.shopName + " (" + adData.shopID + ")");
                    this.setState({
                        adType: "Shop Ad",
                        shopAd: true
                    });
                } else {
                    this.props.change("type", "Individual Ad");
                }

                this.props.change("name", adData.adName);
                this.props.change("brandName", adData.brandName);

                const { categories } = data;

                let category = "Custom Category";
                let subcategory = "";
                let i = 0;
                let categoryNameArray = [];
                
                while(categories[i]) {
                    categoryNameArray.push(categories[i].categoryName);
                    i++;
                }

                let categoryNameIndex = categoryNameArray.indexOf(adData.category);

                if(categoryNameIndex > -1) {
                    category = adData.category;
                    if(adData.subcategory) {
                        let subcategoryNameIndex = categories[categoryNameIndex].subcategories.indexOf(adData.subcategory);
                        
                        if(subcategoryNameIndex > -1) {
                            subcategory = adData.subcategory;
                        }
                        else {
                            subcategory = "Custom Subcategory";
                        }
                    }
                }
                else if(adData.subcategory) {
                    subcategory = "Custom Subcategory";
                }
                

                this.props.change("category", category);
                if(category === 'Custom Category') {
                    this.props.change("customCategory", adData.category);
                }
                this.props.change("subcategory", subcategory);
                if(subcategory === "Custom Subcategory") {
                    this.props.change("customSubcategory", adData.subcategory);
                }
                this.props.change("description", adData.description);
                this.props.change("for", adData.for);
                this.props.change("condition", adData.condition);
                this.props.change("parcel", adData.parcel);
                this.props.change("weight", adData.weight);
                this.props.change("weightUnit", adData.weightUnit);
                this.props.change("parcelWeight", adData.parcelWeight);
                this.props.change("parcelWeightUnit", adData.parcelWeightUnit);
                this.props.change("volume", adData.volume);
                this.props.change("volumeUnit", adData.volumeUnit);
                if (adData && adData.dimension) {
                    this.props.change("dimension1", adData.dimension[0] ? adData.dimension[0] : null);
                    this.props.change("dimension2", adData.dimension[1] ? adData.dimension[1] : null);
                    this.props.change("dimension3", adData.dimension[2] ? adData.dimension[2] : null);
                }
                this.props.change("dimensionUnit", adData.dimensionUnit);
                if (adData && adData.parcelDimension) {
                    this.props.change("parcelDimension1", adData.parcelDimension[0] ? adData.parcelDimension[0] : null);
                    this.props.change("parcelDimension2", adData.parcelDimension[1] ? adData.parcelDimension[1] : null);
                    this.props.change("parcelDimension3", adData.parcelDimension[2] ? adData.parcelDimension[2] : null);
                }
                this.props.change("parcelDimensionUnit", adData.parcelDimensionUnit);
                this.props.change("area", adData.area);
                this.props.change("areaUnit", adData.areaUnit);

                this.setState({ specifications: adData.specifications });

                this.props.change("price", adData.originalPrice ? adData.originalPrice : adData.price);
                this.props.change("priceUnit", adData.priceUnit);
                this.props.change("pricePer", adData.pricePer);
                this.props.change("parcelPrice", adData.originalParcelPrice ? adData.originalParcelPrice : adData.parcelPrice);
                this.props.change("parcelPriceUnit", adData.parcelPriceUnit);

                this.setState({ options: adData.options });

                this.props.change("numOfItems", adData.numOfItems);
                this.props.change("numOfItemsPerOrder", adData.numOfItemsPerOrder);

                this.props.change("governmentChargeApplicable", adData.governmentChargeApplicable);
                this.props.change("governmentCharge", adData.governmentCharge);
                this.props.change("governmentChargeDescription", adData.governmentChargeDescription);
                this.props.change("governmentChargeRegNo", adData.governmentChargeRegNo);

                this.props.change("extraChargeApplicable", adData.extraChargeApplicable);
                this.props.change("extraCharge", adData.extraCharge);
                this.props.change("extraChargeDescription", adData.extraChargeDescription);

                this.props.change("leadTime", adData.leadTime);
                this.props.change("expiryTime", adData.expiryTime);
                
                this.setState({ center: { lat: adData.coordinate.lat, lng: adData.coordinate.long } });

                this.props.change("address", adData.address);
                this.props.change("instruction", adData.instruction);
                this.props.change("contactNo", adData.contactNo);

                this.props.change("processingCapacity", adData.processingCapacity);
                this.props.change("productReturnApplicable", adData.productReturnApplicable);
                this.props.change("productReturnPolicy", adData.productReturnPolicy);
                this.props.change("discountTag", adData.discountTag);
                this.props.change("sameAsShopOpeningHours", adData.sameAsShopOpeningHours);

                this.setState({
                    discounts: adData.discounts,
                    oldPhotos: adData.photos
                });

                if (adData.midBreaks && adData.midBreaks.everyday && adData.midBreaks.everyday.from && adData.midBreaks.everyday.to) {
                    this.setState({ midBreakApplicable: true });
                    this.props.change("midBreakApplicable", true);

                    this.props.change("midBreakEverydayFrom", adData.midBreaks.everyday.from);
                    this.props.change("midBreakEverydayTo", adData.midBreaks.everyday.to);

                    Weekdays.forEach((weekday) => {
                        let fieldNameFrom = `midBreak${capitalizeFirstLetter(weekday)}From`;
                        let fieldNameTo = `midBreak${capitalizeFirstLetter(weekday)}To`;
                        this.props.change(fieldNameFrom, adData.midBreaks.everyday.from);
                        this.props.change(fieldNameTo, adData.midBreaks.everyday.to);
                    })
                }
                else if (adData.midBreaks && Object.keys(adData.midBreaks).length > 0) {
                    this.setState({ midBreakApplicable: true });
                    this.props.change("midBreakApplicable", true);
                    Object.keys(adData.midBreaks).forEach((key) => {
                        if (key !== 'everyday') {
                            let fieldNameFrom = `midBreak${capitalizeFirstLetter(key)}From`;
                            let fieldNameTo = `midBreak${capitalizeFirstLetter(key)}To`;
                            if(adData.midBreaks[key]) {
                                this.props.change(fieldNameFrom, adData.midBreaks[key].from);
                                this.props.change(fieldNameTo, adData.midBreaks[key].to);
                            }
                        }
                    });
                }

                if (adData.availableHours && adData.availableHours.everyday && adData.availableHours.everyday.from && adData.availableHours.everyday.to) {
                    this.props.change("availableHoursEverydayFrom", adData.availableHours.everyday.from);
                    this.props.change("availableHoursEverydayTo", adData.availableHours.everyday.to);
                    
                    return Weekdays.forEach((weekday) => {
                        let fieldNameFrom = `availableHours${capitalizeFirstLetter(weekday)}From`;
                        let fieldNameTo = `availableHours${capitalizeFirstLetter(weekday)}To`;
                        this.props.change(fieldNameFrom, adData.availableHours.everyday.from);
                        this.props.change(fieldNameTo, adData.availableHours.everyday.to);
                    })
                } else if (adData.availableHours) {
                    Object.keys(adData.availableHours).forEach((key) => {
                        if (key !== 'everyday') {
                            let fieldNameFrom = `availableHours${capitalizeFirstLetter(key)}From`;
                            let fieldNameTo = `availableHours${capitalizeFirstLetter(key)}To`;
                            this.props.change(fieldNameFrom, adData.availableHours[key].from);
                            this.props.change(fieldNameTo, adData.availableHours[key].to);
                        }
                    });
                }
            }
            else {
                this.setState({ adID: null });
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

    componentDidUpdate() {
        const { category } = this.props.formValues;
        if (this.state.data && this.state.data.categories && !category) {
            this.props.change('category', this.state.data.categories[0].categoryName);
            this.state.data.categories.push({ subcategories: [], categoryName: 'Custom Category' });
        }
    }

    onPlacesChanged = (location) => {
        const { address, coordinate } = location;
        const { lat, lng } = coordinate;
        this.setState({
            location: {
                lat: lat,
                long: lng
            }
        });
        this.props.change('coordinate', `${address}`);
    }

    onChangeAHEDChk = ({ target }) => {
        const { checked } = target;
        const { availableHoursEverydayFrom, availableHoursEverydayTo } = this.props.formValues;
        this.setState({ availableHoursEveryday: checked });
        if (checked) {
            this.props.change('availableHoursSundayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursSundayTo', availableHoursEverydayTo);
            this.props.change('availableHoursMondayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursMondayTo', availableHoursEverydayTo);
            this.props.change('availableHoursTuesdayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursTuesdayTo', availableHoursEverydayTo);
            this.props.change('availableHoursWednesdayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursWednesdayTo', availableHoursEverydayTo);
            this.props.change('availableHoursThursdayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursThursdayTo', availableHoursEverydayTo);
            this.props.change('availableHoursFridayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursFridayTo', availableHoursEverydayTo);
            this.props.change('availableHoursSaturdayFrom', availableHoursEverydayFrom);
            this.props.change('availableHoursSaturdayTo', availableHoursEverydayTo);
        } else {
            this.props.change('availableHoursEverydayFrom', null);
            this.props.change('availableHoursEverydayTo', null);
        }
    }

    onChangeAHEDFrom = ({ target }) => {
        const { value } = target;
        this.props.change('availableHoursSundayFrom', value);
        this.props.change('availableHoursMondayFrom', value);
        this.props.change('availableHoursTuesdayFrom', value);
        this.props.change('availableHoursWednesdayFrom', value);
        this.props.change('availableHoursThursdayFrom', value);
        this.props.change('availableHoursFridayFrom', value);
        this.props.change('availableHoursSaturdayFrom', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('availableHoursEveryday', true);
        } else {
            this.props.change('availableHoursEveryday', false);
        }
    }

    onChangeAHEDTo = ({ target }) => {
        const { value } = target;
        this.props.change('availableHoursSundayTo', value);
        this.props.change('availableHoursMondayTo', value);
        this.props.change('availableHoursTuesdayTo', value);
        this.props.change('availableHoursWednesdayTo', value);
        this.props.change('availableHoursThursdayTo', value);
        this.props.change('availableHoursFridayTo', value);
        this.props.change('availableHoursSaturdayTo', value);
        if (value !== null && value !== undefined && value !== "") {
            this.props.change('availableHoursEveryday', true);
        } else {
            this.props.change('availableHoursEveryday', false);
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
        this.setState({ availableHoursEveryday: false });
        this.props.change('availableHoursEveryday', false);
        this.props.change('availableHoursEverydayFrom', null);
        this.props.change('availableHoursEverydayTo', null);
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

    getPriceLabel = () => {
        if (this.props.formValues && this.props.formValues.category && this.props.formValues.category === 'Job') {
            return 'Salary';
        }
        if (this.props.formValues && this.props.formValues.category && this.props.formValues.category === 'Service') {
            return 'Price';
        }
        if (this.props.formValues && this.props.formValues.for && this.props.formValues.for === 'Rent') {
            return 'Rental Price';
        }
        return 'Price';

    }

    onSpecificationsChange = (specifications) => {
        this.setState({ specifications: specifications });
    }

    onOptionsChange = (options) => {
        this.setState({ options: options });
    }

    isGovernmentChargeRequired = (value, allValues) => {
        if(this.state.shopAd) {
            return '';
        }
        else {
            if (allValues.governmentChargeApplicable === true && !value) {
                return 'Required';
            } else {
                return '';
            }
        }
    }

    isExtraChargeRequired = (value, allValues) => {
        if(this.state.shopAd) {
            return '';
        }
        else {
            if (allValues.extraChargeApplicable === true && !value) {
                return 'Required';
            } else {
                return '';
            }
        }
    }

    onDiscountsChange = (discounts) => {
        this.setState({
            discounts: discounts
        });
    }

    onDisountOnChange = (discountOn) => {
        if(discountOn === "Number") {
            this.props.change("discountType", "Amount");
        }
    }

    onSubmit = (formValues) => {
        let requestObj = this.createRequestObj(formValues);
        const { type } = this.props.formValues;
        const { adID } = this.state;
        if (type === 'Shop Ad') {
            if (adID) {
                return this.props.updateShopAd(requestObj).then(() => {
                    const { status, errorMessage } = this.props.adData.payload;
                    if(status !== "success") {
                        const { fatalError, authError, dimension, parcelDimension, specifications, options, availableHours, discounts, photos } = errorMessage;
                
                        if (fatalError || authError || dimension || parcelDimension || specifications || options || availableHours || discounts || photos) {
                            this.setState({
                                fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                                authErrorForm: authError,
                                dimensionError: dimension,
                                parcelDimensionError: parcelDimension,
                                specificationsError: specifications,
                                optionsError: options,
                                availableHoursError: availableHours,
                                discountsError: discounts,
                                photosError: photos
                            });
                        }
                        else{
                            this.setState({
                                fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                                authErrorForm: null,
                                dimensionError: null,
                                parcelDimensionError: null,
                                specificationsError: null,
                                optionsError: null,
                                availableHoursError: null,
                                discountsError: null,
                                photosError: null
                            });
                            renderServerError(this.props.adDetails);
                        }
                    }
                });
            }
        } else if (type === 'Individual Ad') {
            if (adID) {
                return this.props.updateIndividualAd(requestObj).then(() => {
                    const { status, errorMessage } = this.props.adData.payload;
                    if(status !== "success") {
                        const { fatalError, authError, dimension, parcelDimension, specifications, options, availableHours, midBreaks, discounts, photos } = errorMessage;
                
                        if (fatalError || authError || dimension || parcelDimension || specifications || options || availableHours || midBreaks || discounts || photos) {
                            this.setState({
                                fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                                authErrorForm: authError,
                                dimensionError: dimension,
                                parcelDimensionError: parcelDimension,
                                specificationsError: specifications,
                                optionsError: options,
                                availableHoursError: availableHours,
                                midBreaksError: midBreaks,
                                discountsError: discounts,
                                photosError: photos
                            });
                        }
                        else{
                            this.setState({
                                fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                                authErrorForm: null,
                                dimensionError: null,
                                parcelDimensionError: null,
                                specificationsError: null,
                                optionsError: null,
                                availableHoursError: null,
                                midBreaksError: null,
                                discountsError: null,
                                photosError: null
                            });
                            renderServerError(this.props.adDetails);
                        }
                    }
                });
            }
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

    createRequestObj(formValues) {
        const {
            type,
            name,
            brandName,
            description,
            condition,
            parcel,
            weight,
            weightUnit,
            parcelWeight,
            parcelWeightUnit,
            volume,
            volumeUnit,
            dimension1,
            dimension2,
            dimension3,
            dimensionUnit,
            parcelDimension1,
            parcelDimension2,
            parcelDimension3,
            parcelDimensionUnit,
            area,
            areaUnit,
            price,
            priceUnit,
            pricePer,
            parcelPrice,
            parcelPriceUnit,
            numOfItems,
            numOfItemsPerOrder,
            governmentChargeApplicable,
            governmentCharge,
            governmentChargeDescription,
            governmentChargeRegNo,
            extraChargeApplicable,
            extraCharge,
            extraChargeDescription,
            leadTime,
            expiryTime,
            address,
            instruction,
            contactNo,
            sameAsShopOpeningHours,
            availableHoursSundayFrom,
            availableHoursMondayFrom,
            availableHoursTuesdayFrom,
            availableHoursWednesdayFrom,
            availableHoursThursdayFrom,
            availableHoursFridayFrom,
            availableHoursSaturdayFrom,
            availableHoursEverydayFrom,
            availableHoursSundayTo,
            availableHoursMondayTo,
            availableHoursTuesdayTo,
            availableHoursWednesdayTo,
            availableHoursThursdayTo,
            availableHoursFridayTo,
            availableHoursSaturdayTo,
            availableHoursEverydayTo,
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
            processingCapacity,
            productReturnApplicable,
            productReturnPolicy,
            discountTag
        } = formValues;
        const forfor = this.props.formValues['for'];
        let request =
        {
            type: type ? type : '',
            adID: this.state.adID ? this.state.adID : '',
            name: name ? name : '',
            brandName: brandName ? brandName : '',
            category: this.getCategory(),
            subcategory: this.getSubcategory(),
            options: (this.state.options && this.state.options.length > 0) ? this.state.options : [],
            description: description ? description : '',
            condition: condition ? condition : '',
            for: forfor ? forfor : '',
            parcel: parcel === 'true' || parcel === true ? true : false,
            weight: weight ? weight : '',
            weightUnit: weightUnit ? weightUnit : '',
            parcelWeight: parcelWeight ? parcelWeight : '',
            parcelWeightUnit: parcelWeightUnit ? parcelWeightUnit : '',
            volume: volume ? volume : '',
            volumeUnit: volumeUnit ? volumeUnit : '',
            dimension: [],
            dimensionUnit: dimensionUnit ? dimensionUnit : '',
            parcelDimension: [],
            parcelDimensionUnit: parcelDimensionUnit ? parcelDimensionUnit : '',
            area: area ? area : '',
            areaUnit: areaUnit ? areaUnit : '',
            specifications: (this.state.specifications && this.state.specifications.length > 0) ? this.state.specifications : [],
            price: price ? price : '',
            pricePer: pricePer ? pricePer : '',
            priceUnit: priceUnit ? priceUnit : '',
            parcelPrice: parcelPrice ? parcelPrice : '',
            parcelPriceUnit: parcelPriceUnit ? parcelPriceUnit : '',
            numOfItems: numOfItems ? numOfItems : '',
            numOfItemsPerOrder: numOfItemsPerOrder ? numOfItemsPerOrder : '',
            governmentChargeApplicable: governmentChargeApplicable ? governmentChargeApplicable : false,
            governmentCharge: governmentCharge ? governmentCharge : '',
            governmentChargeDescription: governmentChargeDescription ? governmentChargeDescription : '',
            governmentChargeRegNo: governmentChargeRegNo ? governmentChargeRegNo : '',
            extraChargeApplicable: extraChargeApplicable ? extraChargeApplicable : false,
            extraCharge: extraCharge ? extraCharge : '',
            extraChargeDescription: extraChargeDescription ? extraChargeDescription : '',
            leadTime: leadTime ? leadTime : '',
            expiryTime: expiryTime ? expiryTime : '',
            coordinate: this.state.location ? this.state.location : {},
            address: address ? address : '',
            instruction: instruction ? instruction : '',
            contactNo: contactNo ? contactNo : '',
            sameAsShopOpeningHours: (this.state.adType && (this.state.adType === 'Shop Ad') && sameAsShopOpeningHours) ? true : false,
            availableHours: {},
            midBreaks: {},
            midBreakApplicable: false,
            processingCapacity: processingCapacity ? processingCapacity : null,
            productReturnApplicable: productReturnApplicable ? productReturnApplicable : '',
            productReturnPolicy: productReturnPolicy ? productReturnPolicy : '',
            discounts: (this.state.discounts && this.state.discounts.length > 0) ? this.state.discounts : [],
            discountTag: discountTag ? discountTag : null,
            photos: [],
            oldPhotos: [],
            demoPhotos: []
        };
        
        let dimensionArray = [];
        if (dimension1) {
            dimensionArray.push(+dimension1);
        }
        if (dimension2) {
            dimensionArray.push(+dimension2);
        }
        if (dimension3) {
            dimensionArray.push(+dimension3);
        }
        request = { ...request, dimension: dimensionArray };
        if (parcel && Boolean(parcel) === true) {
            let parcelDimensionArray = [];
            if (parcelDimension1) {
                parcelDimensionArray.push(+parcelDimension1);
            }
            if (parcelDimension2) {
                parcelDimensionArray.push(+parcelDimension2);
            }
            if (parcelDimension3) {
                parcelDimensionArray.push(+parcelDimension3);
            }
            request = { ...request, parcelDimension: parcelDimensionArray };
        } else {
            request = { ...request, parcelDimension: [] };
        }
        let availableHours = null;
        if (availableHoursEverydayFrom && availableHoursEverydayTo) {
            availableHours = {
                ...availableHours,
                everyday: {
                    from: availableHoursEverydayFrom,
                    to: availableHoursEverydayTo
                }
            }
        }
        if (availableHoursSundayFrom && availableHoursSundayTo) {
            availableHours = {
                ...availableHours,
                sunday: {
                    from: availableHoursSundayFrom,
                    to: availableHoursSundayTo
                }
            }
        }
        if (availableHoursMondayFrom && availableHoursMondayTo) {
            availableHours = {
                ...availableHours,
                monday: {
                    from: availableHoursMondayFrom,
                    to: availableHoursMondayTo
                }
            }
        }
        if (availableHoursTuesdayFrom && availableHoursTuesdayTo) {
            availableHours = {
                ...availableHours,
                tuesday: {
                    from: availableHoursTuesdayFrom,
                    to: availableHoursTuesdayTo
                }
            }
        }
        if (availableHoursWednesdayFrom && availableHoursWednesdayTo) {
            availableHours = {
                ...availableHours,
                wednesday: {
                    from: availableHoursWednesdayFrom,
                    to: availableHoursWednesdayTo
                }
            }
        }
        if (availableHoursThursdayFrom && availableHoursThursdayTo) {
            availableHours = {
                ...availableHours,
                thursday: {
                    from: availableHoursThursdayFrom,
                    to: availableHoursThursdayTo
                }
            }
        }
        if (availableHoursFridayFrom && availableHoursFridayTo) {
            availableHours = {
                ...availableHours,
                friday: {
                    from: availableHoursFridayFrom,
                    to: availableHoursFridayTo
                }
            }
        }
        if (availableHoursSaturdayFrom && availableHoursSaturdayTo) {
            availableHours = {
                ...availableHours,
                saturday: {
                    from: availableHoursSaturdayFrom,
                    to: availableHoursSaturdayTo
                }
            }
        }
        request = { ...request, availableHours: availableHours };
        let midBreaks = null;
        if (midBreakApplicable) {
            request = { ...request, midBreakApplicable: midBreakApplicable };
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
        if (this.state.photos && this.state.photos.length > 0)
            request = { ...request, photos: this.state.photos };
        if (this.state.oldPhotosName && this.state.oldPhotosName.length > 0)
            request = { ...request, oldPhotos: this.state.oldPhotosName };

        return request;
    }

    render() {
        const { handleSubmit, formValues, pristine, submitting, isCreatingShopAd, isCreatingIndividualAd, isUploadingPhotos, isFetchingAd } = this.props;
        const { adType, shopAd, center, data, oldPhotos, specifications, options, discounts, fatalErrorForm, authErrorForm, dimensionError, parcelDimensionError, specificationsError, optionsError, availableHoursError, midBreaksError, discountsError, photosError } = this.state;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="create-ad-area">
                    <div className="container">
                        <div className="create-ad-content">
                            <div className="section-title">
                                <h2><span className="dot"></span> Edit Ad Info</h2>
                            </div>
                            {isFetchingAd ? <React.Fragment><div className="row align-items-center">
                                    <div className="col d-flex justify-content-center">
                                        <Spinner isLoading={isFetchingAd} /> &nbsp;Fetching...
                                    </div>
                                </div>
                            </React.Fragment> :
                            <form className="create-ad-form" onSubmit={handleSubmit(this.onSubmit)}>
                                <Field type="text" name="type" component={renderInput} label="Type" disabled />
                                {adType && adType === 'Shop Ad' &&
                                    <Field type="text" name="shopID" component={renderInput} label="Shop" disabled />}
                                <Field type="text" name="name" component={renderInput} placeholder="Enter Ad Name" label="Name" disabled />
                                <Field type="text" name="brandName" component={renderInput} label="Brand" disabled />
                                <Field type="select" name="category" component={renderSelect} label="Category" validate={[required]}>
                                    {
                                        this.state.data && this.state.data.categories.map((c, i) => <option key={i} value={c.categoryName}>{c.categoryName}</option>)
                                    }
                                </Field>
                                {formValues && formValues.category === 'Custom Category' &&
                                    <Field type="text" name="customCategory" component={renderInput} placeholder="Enter a Custom Category" validate={[required, maxLength100]} maxLength="100" />}
                                <Field type="select" name="subcategory" component={renderSelect} label="Subcategory (optional)">
                                    <option></option>
                                    {
                                        this.state.data && formValues && formValues.category &&
                                        this.state.data.categories.find(c => c.categoryName === formValues.category) &&
                                        this.state.data.categories.find(c => c.categoryName === formValues.category).subcategories.map((sc, i) => {
                                            return <option key={i} value={sc}>{sc}</option>
                                        })
                                    }
                                    <option key={'customSubcategory'} value={'Custom Subcategory'}>Custom Subcategory</option>
                                </Field>
                                {formValues && formValues.subcategory === 'Custom Subcategory' &&
                                    <Field type="text" name="customSubcategory" component={renderInput} placeholder="Enter a Custom Subcategory" validate={[required, maxLength100]} maxLength="100" />}
                                <Field type="text" name="description" component={renderTextarea} placeholder="Enter Ad Description" label="Description" validate={[required, minLength5, maxLength5000]} maxLength="5000" rows={7} cols={10} />
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Food and Drinks' && formValues.category !== 'Fruit and Vegetable' && formValues.category !== 'Grocery' && formValues.category !== 'Medicine') &&
                                    <Field type="select" name="for" component={renderSelect} label="For">
                                        <option key={'Sale'} value={'Sale'}>Sale</option>
                                        <option key={'Rent'} value={'Rent'}>Rent</option>
                                    </Field>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Food and Drinks' && formValues.category !== 'Fruit and Vegetable' && formValues.category !== 'Grocery' && formValues.category !== 'Medicine' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="select" name="condition" component={renderSelect} label="Condition">
                                        <option key={'New'} value={'New'}>New</option>
                                        <option key={'Used'} value={'Used'}>Used</option>
                                        <option key={'Reconditioned'} value={'Reconditioned'}>Reconditioned</option>
                                    </Field>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="select" name="parcel" component={renderSelect} label="Is Shipping Available?">
                                        <option key={'Yes'} value={true}>Yes</option>
                                        <option key={'No'} value={false}>No</option>
                                    </Field>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="text" name="weight" component={renderInput} placeholder="Enter Product Weight" label="Weight (optional)" validate={[number, nonZeroPositive]} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="select" name="weightUnit" component={renderSelect} label="Unit">
                                                {
                                                    this.state.data && this.state.data.weightUnits.map((wu, i) => {
                                                        return <option key={i} value={wu}>{wu}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                    </div>}
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="text" name="parcelWeight" component={renderInput} placeholder="Enter Shipping Weight" label="Shipping Weight" validate={[number, nonZeroPositive, required]} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="select" name="parcelWeightUnit" component={renderSelect} label="Unit">
                                                {
                                                    this.state.data && this.state.data.weightUnits.map((wu, i) => {
                                                        return <option key={i} value={wu}>{wu}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                    </div>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Field type="text" name="volume" component={renderInput} placeholder="Enter Volume" label="Volume (optional)" validate={[number, nonZeroPositive]} />
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="select" name="volumeUnit" component={renderSelect} label="Unit">
                                                {
                                                    this.state.data && this.state.data.volumeUnits.map((vu, i) => {
                                                        return <option key={i} value={vu}>{vu}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                    </div>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <label className="label">Dimension (optional)</label>
                                            <div className="input-group">
                                                <Field type="text" name="dimension1" placeholder="Length" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                                <div className="input-group-append">
                                                    <span className="pd-10">x</span>
                                                </div>
                                                <Field type="text" name="dimension2" placeholder="Width" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                                <div className="input-group-append">
                                                    <span className="pd-10">x</span>
                                                </div>
                                                <Field type="text" name="dimension3" placeholder="Height" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                            </div>
                                            <div className="custom-input-error">{this.props.formErrors.dimension1 || this.props.formErrors.dimension2 || this.props.formErrors.dimension3}</div>
                                        </div>
                                        <div className="col-lg-6">
                                            <Field type="select" name="dimensionUnit" component={renderSelect} label="Unit">
                                                {
                                                    this.state.data && this.state.data.dimensionUnits.map((du, i) => {
                                                        return <option key={i} value={du}>{du}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                        {dimensionError && <div className="col-lg-6 text-danger-div-dimension">
                                            {dimensionError}
                                        </div>}
                                    </div>}
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <label className="label">Shipping Dimension (optional)</label>
                                                <div className="input-group">
                                                    <Field type="text" name="parcelDimension1" placeholder="Length" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                                    <div className="input-group-append">
                                                        <span className="pd-10">x</span>
                                                    </div>
                                                    <Field type="text" name="parcelDimension2" placeholder="Width" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                                    <div className="input-group-append">
                                                        <span className="pd-10">x</span>
                                                    </div>
                                                    <Field type="text" name="parcelDimension3" placeholder="Height" component={renderDimensionInput} validate={[number, nonZeroPositive]} />
                                                </div>
                                                <div className="custom-input-error">{this.props.formErrors.parcelDimension1 || this.props.formErrors.parcelDimension2 || this.props.formErrors.parcelDimension3}</div>
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="select" name="parcelDimensionUnit" component={renderSelect} label="Unit">
                                                    {
                                                        this.state.data && this.state.data.dimensionUnits.map((du, i) => {
                                                            return <option key={i} value={du}>{du}</option>
                                                        })
                                                    }
                                                </Field>
                                            </div>
                                            {parcelDimensionError && <div className="col-lg-6 text-danger-div-dimension">
                                                {parcelDimensionError}
                                            </div>}
                                        </div>
                                    </React.Fragment>}
                                {formValues && formValues.category && formValues.category === 'Property' && <div className="row">
                                    <div className="col-lg-6">
                                        <Field type="text" name="area" component={renderInput} placeholder="Enter Area" label="Area (optional)" validate={[number, nonZeroPositive]} />
                                    </div>
                                    <div className="col-lg-6">
                                        <Field type="select" name="areaUnit" component={renderSelect} label="Unit">
                                            {
                                                this.state.data && this.state.data.areaUnits.map((au, i) => {
                                                    return <option key={i} value={au}>{au}</option>
                                                })
                                            }
                                        </Field>
                                    </div>
                                </div>}
                                <Specifications formValues={formValues} onSpecificationsChange={this.onSpecificationsChange} specifications={specifications} specificationsError={specificationsError} />
                                <div className="row">
                                    <div className="col-lg-3">
                                        <Field type="text" name="price" component={renderInput} placeholder="Enter Price" label={this.getPriceLabel()} validate={[required, number, zeroPositive]} />
                                    </div>
                                    <div className="col-lg-6">
                                        <Field type="select" name="priceUnit" component={renderSelect} label="Unit" validate={[required]}>
                                            {
                                                this.state.data && this.state.data.priceUnits.map((pu, i) => {
                                                    return <option key={i} value={pu}>{pu}</option>
                                                })
                                            }
                                        </Field>
                                    </div>
                                    {formValues && (formValues.category === 'Job' || formValues.category === "Service" || formValues.for === 'Rent') &&
                                        <div className="col-lg-3">
                                            <Field type="select" name="pricePer" component={renderSelect} label="Per" validate={[required]}>
                                                {
                                                    this.state.data && this.state.data.pricePer.map((pp, i) => {
                                                        return <option key={i} value={pp}>{pp}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                    }
                                </div>
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') && <div className="row">
                                    <div className="col-lg-6">
                                        <Field type="text" name="parcelPrice" component={renderInput} placeholder="Enter Extra Price for Shippable Product" label="Extra Price for Shippable Product (optional)" validate={[number, zeroPositive]} />
                                    </div>
                                    <div className="col-lg-6">
                                        <Field type="select" name="parcelPriceUnit" component={renderSelect} label="Unit" validate={[required]}>
                                            {
                                                this.state.data && this.state.data.priceUnits.map((pu, i) => {
                                                    return <option key={i} value={pu}>{pu}</option>
                                                })
                                            }
                                        </Field>
                                    </div>
                                </div>}
                                {formValues && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && (formValues.parcel === true || formValues.parcel === 'true')) && 
                                    <Options formValues={formValues} onOptionsChange={this.onOptionsChange} options={options} priceUnits={data ? data.priceUnits : []} weightUnits={data ? data.weightUnits : []} optionsError={optionsError} />
                                }
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="text" name="numOfItems" component={renderInput} placeholder="Enter how many items are available" label="Number of Items in Stock" validate={[required, zeroPositive]} normalize={numbers} maxLength="15" />
                                }
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="text" name="numOfItemsPerOrder" component={renderInput} placeholder="Enter maximum how many items can be in one order" label="Maximum Number of Items Per Order" validate={[required, nonZeroPositive]} normalize={numbers} maxLength="15" />
                                }
                                <div className="row">
                                    <div className="col-lg-12">
                                        <Field name="governmentChargeApplicable" type="checkbox" component={renderCheckbox} label="Government Charge Applicable" />
                                    </div>
                                </div>
                                {formValues && formValues.governmentChargeApplicable && formValues.governmentChargeApplicable === true &&
                                    <React.Fragment>
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <Field type="text" name="governmentCharge" component={renderInputGroup} label="Government Charge" disabled={shopAd} validate={[number, zeroPositive, maxValue1000000, this.isGovernmentChargeRequired]} groupText={'%'} />
                                            </div>
                                        </div>
                                        <Field name="governmentChargeDescription" component={renderInput} placeholder={shopAd ? "Edit Government Charge Description in the Shop Info" : "Describe what the Government Charge is for, e.g: VAT 15%"} label="Government Charge Description" disabled={shopAd} validate={[maxLength100, this.isGovernmentChargeRequired]} maxLength="100" />
                                        <Field name="governmentChargeRegNo" component={renderInput} placeholder={shopAd ? "Edit Government Charge Registration Number in the Shop Info" : "Enter Government Charge Registration Number, e.g: VAT Registration Number"} label="Government Charge Registration Number" disabled={shopAd} validate={[maxLength100, this.isGovernmentChargeRequired]} maxLength="100" />
                                    </React.Fragment>}
                                <div className="row">
                                    <div className="col-lg-12">
                                        <Field name="extraChargeApplicable" type="checkbox" component={renderCheckbox} label="Extra Charge Applicable" />
                                    </div>
                                </div>
                                {formValues && formValues.extraChargeApplicable && formValues.extraChargeApplicable === true &&
                                    <React.Fragment> <div className="row">
                                            <div className="col-lg-4">
                                                <Field type="text" name="extraCharge" component={renderInputGroup} label="Extra Charge" disabled={shopAd} validate={[number, zeroPositive, maxValue1000000, this.isExtraChargeRequired]} groupText={'%'} />
                                            </div>
                                        </div>
                                        <Field name="extraChargeDescription" component={renderInput} placeholder={shopAd ? "Edit Extra Charge Description in the Shop Info" : "Describe what the Extra Charge is for, e.g: Processing Fee 3%"} label="Extra Charge Description" disabled={shopAd} validate={[maxLength100, this.isExtraChargeRequired]} maxLength="100" />
                                    </React.Fragment>}
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="select" name="leadTime" component={renderSelect} label="Lead Time" onChange={this.onChangeLeadTime} validate={[required]}>
                                        <option key="Less than 10 minutes" value="Less than 10 minutes">Less than 10 minutes</option>
                                        <option key="10 minutes to 30 minutes" value="10 minutes to 30 minutes">10 minutes to 30 minutes</option>
                                        <option key="30 minutes to 1 hour" value="30 minutes to 1 hour">30 minutes to 1 hour</option>
                                        <option key="1 hour to 3 hours" value="1 hour to 3 hours">1 hour to 3 hours</option>
                                        <option key="3 hours to 24 hours" value="3 hours to 24 hours">3 hours to 24 hours</option>
                                        <option key="More than 1 day" value="More than 1 day">More than 1 day</option>
                                    </Field>}
                                {formValues && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') &&
                                    <Field type="select" name="expiryTime" component={renderSelect} label="Expiry Time of the Product" onChange={this.onChangeLeadTime} validate={[required]}>
                                        <option key="Less than 10 minutes" value="Less than 10 minutes">Less than 10 minutes</option>
                                        <option key="10 minutes to 30 minutes" value="10 minutes to 30 minutes">10 minutes to 30 minutes</option>
                                        <option key="30 minutes to 1 hour" value="30 minutes to 1 hour">30 minutes to 1 hour</option>
                                        <option key="1 hour to 3 hours" value="1 hour to 3 hours">1 hour to 3 hours</option>
                                        <option key="3 hours to 6 hours" value="3 hours to 6 hours">3 hours to 6 hours</option>
                                        <option key="6 hours to 12 hours" value="6 hours to 12 hours">6 hours to 12 hours</option>
                                        <option key="12 hours to 24 hours" value="12 hours to 24 hours">12 hours to 24 hours</option>
                                        <option key="1 day to 3 days" value="1 day to 3 days">1 day to 3 days</option>
                                        <option key="3 days to 7 days" value="3 days to 7 days">3 days to 7 days</option>
                                        <option key="7 days to 15 days" value="7 days to 15 days">7 days to 15 days</option>
                                        <option key="15 days to 30 days" value="15 days to 30 days">15 days to 30 days</option>
                                        <option key="More than 30 days" value="More than 30 days">More than 30 days</option>
                                    </Field>}
                                {center ? <div className="row">
                                    <div className="col-lg-12">
                                        {shopAd ? <label>Shop Location on the Map</label> : <label>Ad Location on the Map</label>}
                                        <Map center={center} onPlacesChanged={this.onPlacesChanged} canMakeChanges={false} />
                                    </div>
                                </div> : ""}
                                <div style={{ marginTop: '20px' }}>
                                    <Field type="text" name="coordinate" component={renderInput} label="Marked Location" validate={[required]} disabled />
                                </div>
                                <Field type="text" name="address" component={renderTextarea} placeholder="Enter Address" label="Address" disabled rows={5} cols={10} />
                                <Field type="text" name="instruction" component={renderTextarea} placeholder={shopAd ? "Edit Instructions to Find the Address in the Shop Info" : "Enter Instructions to find the Address"} label={shopAd ? "Instructions to Find the Address" : "Instructions to Find the Address (optional)"} disabled={shopAd} validate={[maxLength2000]} maxLength="2000" rows={5} cols={10} />
                                <Field type="text" name="contactNo" component={renderInput} placeholder="Enter Phone Number" label="Contact Number" validate={[required, minLength10, maxLength200]} maxLength="200" disabled={shopAd} />
                                <React.Fragment>
                                    <label className="label">{(formValues && formValues.category && (formValues.category === 'Job' || formValues.category === 'Property')) ? 'Contact Hours' : 'Available Hours'}</label>
                                    {availableHoursError && <span className="text-danger">{availableHoursError}</span>}
                                    {shopAd && <Field name="sameAsShopOpeningHours" type="checkbox" component={renderCheckbox} label="Same as the Shop's Opening Hours" />}
                                    {this.props.formValues && !this.props.formValues.sameAsShopOpeningHours && <React.Fragment>
                                        <Field name="availableHoursEveryday" type="hidden" component={renderCheckbox} onChange={this.onChangeAHEDChk} />
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursEverydayFrom`} label="Everyday From" component={renderInput} onChange={this.onChangeAHEDFrom} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursEverydayTo`} label="Everyday To" component={renderInput} onChange={this.onChangeAHEDTo} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursSundayFrom`} label="Sunday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursSundayTo`} label="Sunday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursMondayFrom`} label="Monday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursMondayTo`} label="Monday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursTuesdayFrom`} label="Tuesday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursTuesdayTo`} label="Tuesday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursWednesdayFrom`} label="Wednesday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursWednesdayTo`} label="Wednesday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursThursdayFrom`} label="Thursday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursThursdayTo`} label="Thursday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursFridayFrom`} label="Friday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursFridayTo`} label="Friday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursSaturdayFrom`} label="Saturday From" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                            <div className="col-lg-6">
                                                <Field type="time" name={`availableHoursSaturdayTo`} label="Saturday To" component={renderInput} onChange={this.onChangeOHWeekDays} />
                                            </div>
                                        </div>
                                    </React.Fragment>}
                                </React.Fragment>
                                {!shopAd ? <React.Fragment>
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
                                </React.Fragment> : ""}
                                {!shopAd && formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') && (formValues.parcel === true || formValues.parcel === 'true') &&
                                <Field type="text" name="processingCapacity" component={renderInput} placeholder="Enter number of orders which can be processed at the same time" label="Processing Capacity" validate={[required, nonZeroPositive]} normalize={numbers} maxLength="15" />}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') && (formValues.parcel === true || formValues.parcel === 'true') &&
                                    <Field type="select" name="productReturnApplicable" component={renderSelect} label="Product Return Policy">
                                        <option key={'Applicable'} value="Applicable">Applicable</option>
                                        <option key={'Not applicable'} value="Not applicable">Not applicable</option>
                                    </Field>}
                                {formValues && formValues.category && (formValues.category !== 'Job' && formValues.category !== 'Service' && formValues.category !== 'Property' && formValues.for !== 'Rent') && (formValues.parcel === true || formValues.parcel === 'true') && (formValues.productReturnApplicable === 'Applicable') &&
                                    <Field type="text" name="productReturnPolicy" component={renderTextarea} placeholder={shopAd ? "Edit Product Return Policy in the Shop Info" : "Enter Product Return Policy"} disabled={shopAd} validate={shopAd ? [] : [required, minLength5, maxLength5000]} maxLength="5000" rows={7} cols={10} />}
                                {formValues && formValues.category && (formValues.category !== 'Job') && <AdDiscounts formValues={formValues} onDiscountsChange={this.onDiscountsChange} discounts={discounts} priceUnits={this.state.data && this.state.data.priceUnits} discountsError={discountsError} onDisountOnChange={this.onDisountOnChange} />}
                                {formValues && formValues.category && (formValues.category !== 'Job') && <Field type="select" name="discountTag" component={renderSelect} label="Discount Tag (if you have any except the Discounts above)">
                                    <option key='' value=""></option>
                                    <option key={'Buy 1 get 1'} value="Buy 1 get 1">Buy 1 get 1</option>
                                    <option key={'Buy 2 get 1'} value="Buy 2 get 1">Buy 2 get 1</option>
                                    <option key={'Buy 1 get 2'} value="Buy 1 get 2">Buy 1 get 2</option>
                                </Field>}
                                <PhotosUpload maximumPhotosCount={15} onPhotosUpdate={this.onPhotosUpdate} type="ad" oldPhotos={oldPhotos} />
                                {photosError && <span className="text-danger">{photosError}</span>}
                                <button type="submit" className="btn btn-primary next" disabled={submitting || pristine || isUploadingPhotos}> <Spinner isLoading={isCreatingShopAd || isCreatingIndividualAd} /> &nbsp;Update Ad Info</button>
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
        formValues: getFormValues('create-ad-form')(state),
        formErrors: getFormSyncErrors('create-ad-form')(state),
        isCreatingShopAd: createLoadingSelector(['ATTACH_AD'])(state),
        isCreatingIndividualAd: createLoadingSelector(['CREATE_INDIVIDUAL_AD'])(state),
        isFetchingAd: createLoadingSelector(['CHECK_AUTH_UPDATE_AD'])(state),
        isUploadingPhotos: createLoadingSelector(['PHOTO_UPLOAD'])(state),
        adData: state.adReducer
    };
}
CreateAdComp = reduxForm({
    form: 'create-ad-form',
    initialValues: {
        for: 'Sale',
        condition: 'New',
        parcel: true,
        type: 'Shop Ad',
        productReturnApplicable: "Applicable"
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CreateAdComp);

const CreateAd = AccountTab(CreateAdComp, "ads");

export default connect(mapStateToProps, { checkAuthUpdateAd, updateShopAd, updateIndividualAd })(CreateAd);