import React from 'react';
import { reduxForm, Field, getFormValues, getFormSyncErrors } from 'redux-form';
import { connect } from 'react-redux';

import PhotosUpload from '../components/Common/PhotosUpload';
import renderInput from '../constants/forms/renderInput';
import renderTextarea from '../constants/forms/renderTextarea';
import renderDimensionInput from '../constants/forms/renderDimensionInput';
import { required, number, nonZeroPositive, zeroPositive, minLength2, minLength5, maxLength100, maxLength200, maxLength5000 } from '../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import renderSelect from '../constants/forms/renderSelect';
import Specifications from '../components/Common/Specifications';
import Options from '../components/Common/Options';
import { checkAuthCreateDemoAd, createDemoAd, updateDemoAd } from '../store/actions/demoAdActions';
import Spinner from '../components/Common/Spinner';
import renderServerError from '../constants/forms/renderServerErrors';
import AccountTab from '../components/HOC/AccountTab';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class CreateDemoAdComp extends React.Component {

    state = {
        photos: [],
        fatalError: null,
        photosError: null,
        dimensionError: null,
        parcelDimensionError: null,
        data: null,
        demoAdData: null,
        options: [],
        specifications: [],
        adID: null,
        oldPhotos: [],
        oldPhotosName: [],
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
        const { match } = this.props;
        const { params } = match;
        const { adID } = params;
        this.setState({ adID: adID });
        
        this.props.checkAuthCreateDemoAd({ demoAdID: adID }).then(() => {
            const { status, data, permissions, demoAdData, errorMessage} = this.props.demoAdData.payload;

            if(status === "success") {
                this.setState({
                    data: data,
                    permissions: permissions,
                    demoAdData: demoAdData
                });

                this.props.change('optionType', "Optional");
                this.props.change('extraPriceUnit', data.priceUnits[0]);
                this.props.change('extraWeightUnit', data.weightUnits[2]);

                if(adID) {
                    const { categories } = data;
                    let category = "Custom Category";
                    let subcategory = "";
                    let i = 0;
                    let categoryNameArray = [];
                    while(categories[i]) {
                        categoryNameArray.push(categories[i].categoryName);
                        i++;
                    }

                    let categoryNameIndex = categoryNameArray.indexOf(demoAdData.category);

                    if(categoryNameIndex > -1) {
                        category = demoAdData.category;
                        if(demoAdData.subcategory) {
                            let subcategoryNameIndex = categories[categoryNameIndex].subcategories.indexOf(demoAdData.subcategory);
                            
                            if(subcategoryNameIndex > -1) {
                                subcategory = demoAdData.subcategory;
                            }
                            else {
                                subcategory = "Custom Subcategory";
                            }
                        }
                    }
                    else if(demoAdData.subcategory) {
                        subcategory = "Custom Subcategory";
                    }
                    
                    this.props.change("name", demoAdData.adName);
                    this.props.change("brandName", demoAdData.brandName);
                    this.props.change("category", category);
                    if(category === 'Custom Category') {
                        this.props.change("customCategory", demoAdData.category);
                    }
                    this.props.change("subcategory", subcategory);
                    if(subcategory === "Custom Subcategory") {
                        this.props.change("customSubcategory", demoAdData.subcategory);
                    }
                    this.props.change("description", demoAdData.description);
                    this.props.change("weight", demoAdData.weight);
                    this.props.change("weightUnit", demoAdData.weightUnit);
                    this.props.change("parcelWeight", demoAdData.parcelWeight);
                    this.props.change("parcelWeightUnit", demoAdData.parcelWeightUnit);
                    this.props.change("volume", demoAdData.volume);
                    this.props.change("volumeUnit", demoAdData.volumeUnit);
                    if (demoAdData && demoAdData.dimension) {
                        this.props.change("dimension1", demoAdData.dimension[0] ? demoAdData.dimension[0] : null);
                        this.props.change("dimension2", demoAdData.dimension[1] ? demoAdData.dimension[1] : null);
                        this.props.change("dimension3", demoAdData.dimension[2] ? demoAdData.dimension[2] : null);
                    }
                    this.props.change("dimensionUnit", demoAdData.dimensionUnit);
                    if (demoAdData && demoAdData.parcelDimension) {
                        this.props.change("parcelDimension1", demoAdData.parcelDimension[0] ? demoAdData.parcelDimension[0] : null);
                        this.props.change("parcelDimension2", demoAdData.parcelDimension[1] ? demoAdData.parcelDimension[1] : null);
                        this.props.change("parcelDimension3", demoAdData.parcelDimension[2] ? demoAdData.parcelDimension[2] : null);
                    }
                    this.props.change("parcelDimensionUnit", demoAdData.parcelDimensionUnit);

                    this.setState({ specifications: demoAdData.specifications });

                    this.props.change("price", demoAdData.price);
                    this.props.change("priceUnit", demoAdData.priceUnit);
                    this.props.change("pricePer", demoAdData.pricePer);
                    this.props.change("parcelPrice", demoAdData.parcelPrice);
                    this.props.change("parcelPriceUnit", demoAdData.parcelPriceUnit);
                    this.props.change("expiryTime", demoAdData.expiryTime);

                    this.setState({
                        options: demoAdData.options,
                        oldPhotos: demoAdData.photos
                    });
                }
                else {
                    this.props.change('weightUnit', data.weightUnits[2]);
                    this.props.change('parcelWeightUnit', data.weightUnits[2]);
                    this.props.change('volumeUnit', data.volumeUnits[1]);
                    this.props.change('dimensionUnit', data.dimensionUnits[2]);
                    this.props.change('parcelDimensionUnit', data.dimensionUnits[2]);
                    this.props.change('areaUnit', data.areaUnits[2]);
                    this.props.change('priceUnit', data.priceUnits[0]);
                    this.props.change('pricePer', data.pricePer[5]);
                    this.props.change('parcelPriceUnit', data.priceUnits[0]);
                    this.props.change('expiryTime', "More than 30 days");
                }
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

    componentDidUpdate() {
        const { category } = this.props.formValues;
        if (this.state.data && this.state.data.categories && !category) {
            this.props.change('category', this.state.data.categories[0].categoryName);
            this.state.data.categories.push({ subcategories: [], categoryName: 'Custom Category' });
        }
    }

    onChangeCategory = (e) => {
        if(!this.state.adID) {
            if(e.target.value === "Food and Drinks") {
                this.props.change('expiryTime', "1 hour to 3 hours");
            }
            else if(e.target.value === "Fruit and Vegetable") {
                this.props.change('expiryTime', "12 hours to 24 hours");
            }
            else if(e.target.value === "Grains and Agricultural Stuff") {
                this.props.change('expiryTime', "3 days to 7 days");
            }
            else if(e.target.value === "Grocery") {
                this.props.change('expiryTime', "1 day to 3 days");
            }
            else {
                this.props.change('expiryTime', "More than 30 days");
            }
        }
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
        return 'Price';

    }

    onSpecificationsChange = (specifications) => {
        this.setState({ specifications: specifications });
    }

    onOptionsChange = (options) => {
        this.setState({ options: options });
    }

    onSubmit = (formValues) => {
        const { adID } = this.state;
        let requestObj = this.createRequestObj(formValues);
        if(adID) {
            return this.props.updateDemoAd(requestObj).then(() => {
                const { status, errorMessage } = this.props.demoAdData.payload;

                if(status !== "success") {
                    const { fatalError, authError, dimension, parcelDimension, specifications, options, photos } = errorMessage;
                    if(fatalError || authError || dimension || parcelDimension || specifications || options || photos) {
                        this.setState({
                            fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: authError,
                            dimensionError: dimension,
                            parcelDimensionError: parcelDimension,
                            specificationsError: specifications,
                            optionsError: options,
                            photosError: photos
                        });
                    }
                    else {
                        this.setState({
                            fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: null,
                            dimensionError: null,
                            parcelDimensionError: null,
                            specificationsError: null,
                            optionsError: null,
                            photosError: null
                        });
                        renderServerError(this.props.demoAdData.payload);
                    }
                }
            });
        }
        else {
            return this.props.createDemoAd(requestObj).then(() => {
                const { status, errorMessage } = this.props.demoAdData.payload;

                if(status !== "success") {
                    const { fatalError, authError, dimension, parcelDimension, specifications, options, photos } = errorMessage;
                    if(fatalError || authError || dimension || parcelDimension || specifications || options || photos) {
                        this.setState({
                            fatalErrorForm: (fatalError || authError) ? fatalError : "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: authError,
                            dimensionError: dimension,
                            parcelDimensionError: parcelDimension,
                            specificationsError: specifications,
                            optionsError: options,
                            photosError: photos
                        });
                    }
                    else {
                        this.setState({
                            fatalErrorForm: "One or more errors occurred. Recheck the fields to find the errors",
                            authErrorForm: null,
                            dimensionError: null,
                            parcelDimensionError: null,
                            specificationsError: null,
                            optionsError: null,
                            photosError: null
                        });
                        renderServerError(this.props.demoAdData.payload);
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

    createRequestObj(formValues) {
        const {
            name,
            brandName,
            description,
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
            price,
            priceUnit,
            parcelPrice,
            parcelPriceUnit,
            expiryTime
        } = formValues;
        let dimensionArray = [];
        let request = {};
        if (dimension1) {
            dimensionArray.push(+dimension1);
        }
        if (dimension2) {
            dimensionArray.push(+dimension2);
        }
        if (dimension3) {
            dimensionArray.push(+dimension3);
        }

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
        const { adID } = this.state;
        request = {
            ...request,
            name: name ? name : '',
            brandName: brandName ? brandName : '',
            category: this.getCategory(),
            subcategory: this.getSubcategory(),
            options: (this.state.options && this.state.options.length > 0) ? this.state.options : [],
            description: description ? description : '',
            weight: weight ? weight : '',
            weightUnit: weightUnit ? weightUnit : '',
            parcelWeight: parcelWeight ? parcelWeight : '',
            parcelWeightUnit: parcelWeightUnit ? parcelWeightUnit : '',
            volume: volume ? volume : '',
            volumeUnit: volumeUnit ? volumeUnit : '',
            dimension: dimensionArray,
            dimensionUnit: dimensionUnit ? dimensionUnit : '',
            parcelDimension: parcelDimensionArray,
            parcelDimensionUnit: parcelDimensionUnit ? parcelDimensionUnit : '',
            specifications: (this.state.specifications && this.state.specifications.length > 0) ? this.state.specifications : [],
            price: price ? price : '',
            priceUnit: priceUnit ? priceUnit : '',
            parcelPrice: parcelPrice ? parcelPrice : '',
            parcelPriceUnit: parcelPriceUnit ? parcelPriceUnit : '',
            expiryTime: expiryTime ? expiryTime : '',
            photos: []
        };
        if (this.state.photos && this.state.photos.length > 0)
            request = { ...request, photos: this.state.photos };
        if (adID) {
            request = {
                ...request,
                adID: adID,
                oldPhotos: []
            };
            if (this.state.oldPhotosName && this.state.oldPhotosName.length > 0)
                request = { ...request, oldPhotos: this.state.oldPhotosName };
        }
        return request;
    }

    onChangeCategory = ({ target }) => {
        const { value } = target;
        if (value.indexOf('Custom Category') < 0) {
            this.props.change('customCategory', null);
        }
    }

    onChangeSubcategory = ({ target }) => {
        const { value } = target;
        if (value.indexOf('Custom Subcategory') < 0) {
            this.props.change('customSubcategory', null);
        }
    }

    onChangeGCA = ({ target }) => {
        const { checked } = target;
        if (!checked) {
            this.props.change('governmentCharge', null);
            this.props.change('governmentChargeDescription', null);
        }
    }

    onChangeECA = ({ target }) => {
        const { checked } = target;
        if (!checked) {
            this.props.change('extraCharge', null);
            this.props.change('extraChargeDescription', null);
        }
    }

    render() {
        const { createDemoAd } = this.state.permissions;
        const { handleSubmit, formValues, pristine, submitting, isCreatingDemoAd, isUploadingPhotos, isCheckingAuthCreateDemoAd } = this.props;
        const { adID, data, specifications, options, oldPhotos, fatalErrorForm, authErrorForm, dimensionError, parcelDimensionError, specificationsError, optionsError, photosError } = this.state;
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                isCheckingAuthCreateDemoAd ? <React.Fragment><div className="row align-items-center">
                        <div className="col d-flex justify-content-center">
                            <Spinner isLoading={isCheckingAuthCreateDemoAd} /> &nbsp;Fetching...
                        </div>
                    </div>
                </React.Fragment> : createDemoAd ? <section className="create-ad-area">
                    <div className="container">
                        <div className="create-ad-content">
                            <div className="section-title">
                                <h2><span className="dot"></span> {adID ? 'Edit Demo Ad' : 'Create Demo Ad'} </h2>
                            </div>
                            <form className="create-ad-form" onSubmit={handleSubmit(this.onSubmit)}>
                            <Field type="text" name="name" component={renderInput} placeholder="Enter Ad Name" label="Name" validate={[required, minLength2, maxLength200]} maxLength="200" />
                                <Field type="text" name="brandName" component={renderInput} placeholder="Enter Brand Name" label="Brand (optional)" validate={[maxLength200]} maxLength="200" />
                                <Field type="select" name="category" component={renderSelect} label="Category" validate={[required]} onChange={(e) => this.onChangeCategory(e)}>
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
                                </div>
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
                                </div>
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
                                </div>
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
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <label className="label">Shipping Dimension</label>
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
                                </div>
                                <div className="row">
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
                                </div>
                                <Options formValues={formValues} onOptionsChange={this.onOptionsChange} options={options} priceUnits={data ? data.priceUnits : []} weightUnits={data ? data.weightUnits : []} optionsError={optionsError} />
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
                                </Field>
                                <PhotosUpload maximumPhotosCount={15} onPhotosUpdate={this.onPhotosUpdate} type="demo-ad" oldPhotos={oldPhotos} oldPhotosFrom="demo-ad" />
                                {photosError && <span className="text-danger word-break">{photosError}</span>}
                                <button type="submit" className="btn btn-primary next" disabled={submitting || pristine || isUploadingPhotos}> <Spinner isLoading={isCreatingDemoAd} /> {adID ? ' Update Demo Ad' : ' Create Demo Ad'}</button>
                                {(fatalErrorForm || authErrorForm) && !submitting && <React.Fragment><span className="text-danger">{fatalErrorForm || authErrorForm}</span></React.Fragment>}
                            </form>
                        </div>
                    </div>
                </section> : <NoContentFound />}
            </React.Fragment >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('create-demo-ad')(state),
        formErrors: getFormSyncErrors('create-demo-ad')(state),
        isCreatingDemoAd: createLoadingSelector(['CREATE_DEMO_AD'])(state),
        isCheckingAuthCreateDemoAd: createLoadingSelector(['CHECK_AUTH_CREATE_DEMO_AD'])(state),
        isUploadingPhotos: createLoadingSelector(['PHOTO_UPLOAD'])(state),
        demoAdData: state.demoAdReducer
    };
}
CreateDemoAdComp = reduxForm({
    form: 'create-demo-ad',
    initialValues: {},
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CreateDemoAdComp);

const CreateDemoAd = AccountTab(CreateDemoAdComp, "demoAds");

export default connect(mapStateToProps, { checkAuthCreateDemoAd, createDemoAd, updateDemoAd })(CreateDemoAd);
