import React from 'react'
import { connect } from 'react-redux';
import { reduxForm, Field, getFormValues } from 'redux-form';
import { Link } from 'react-router-dom';
import Pagination from "react-js-pagination";
import { debounce } from "lodash";
import queryString from 'query-string';

import SingleAdBox from '../components/Ad/SingleAdBox';
import renderSelect from '../constants/forms/renderSelect';
import renderInput from '../constants/forms/renderInput';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchAuthShopAds } from '../store/actions/adActions';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import NoContentFound from '../components/Common/NoContentFound';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class AuthShopAdsComp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ads: [],
            shopName: '',
            shopID: null,
            activePage: 1,
            itemsCountPerPage: 60,
            totalItemsCount: 0,
            categories: [],
            errorMessage: {
                fatalError: null,
                authError: null
            }
        };
        this.debouncedOnChange = debounce(this.onChangeSearchString, 1000);
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        const values = queryString.parse(this.props.location.search);
        const { searchString, category, subcategory, condition, page } = values;
        const forfor = values.for;
        this.props.change("searchString", !searchString ? "" : searchString);
        this.props.change("category", !category ? "" : category);
        this.props.change("subcategory", !subcategory ? "" : subcategory);
        this.props.change("for", !forfor ? '' : forfor);
        this.props.change("condition", !condition ? '' : condition);
        
        this.fetchShopAds(searchString, category, subcategory, forfor, condition, Number(page));
    }

    fetchShopAds = (searchString, category, subcategory, forfor, condition, page = 1) => {
        const { match } = this.props;
        const { params } = match;
        const { shopID } = params;
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        const { isFetchingAds } = this.props;
        if(!isFetchingAds) {
            this.props.fetchAuthShopAds({
                urlName: shopID,
                searchString: searchString,
                category: category,
                subcategory: subcategory,
                for: forfor,
                condition: condition
            }).then(() => {
                const { status, errorMessage } = this.props.adsData.payload;
    
                if(status === 'success') {
                    const { ads, categories, shopName } = this.props.adsData.payload;
                    this.setState({
                        ads: ads,
                        categories: categories,
                        totalItemsCount: ads.length,
                        shopName: shopName,
                        shopID: shopID,
                        activePage: page
                    });

                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', page, this.props.location.search)
                    });

                    if(categories.length === 1) {
                        this.props.change("category", categories[0].categoryName);
                        this.props.history.replace({
                            pathname: this.props.location.pathname,
                            search: updateQueryStringParam('category', categories[0].categoryName, this.props.location.search)
                        });
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
    }

    handlePageChange(pageNumber) {
        pageNumber = (pageNumber && Number.isInteger(Number(pageNumber)) && Number(pageNumber) > 1) ? Number(pageNumber) : 1;
        this.setState({ activePage: pageNumber });
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: pageNumber ? updateQueryStringParam('page', pageNumber, this.props.location.search) : ''
        });
        window.scrollTo(0,0);
    }

    onChangeSearchString = ({ target }) => {
        const { value } = target;
        const { category, subcategory, condition } = this.props.formValues;
        this.fetchShopAds(value, category, subcategory, this.props.formValues.for, condition);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('searchString', value === "" ? '' : value, this.props.location.search)
        });
    }

    onChangeCategory = ({ target }) => {
        const { value } = target;
        let category = value ? value : "";
        this.props.change("subcategory", "");
        const { searchString, condition } = this.props.formValues;
        const subcategory = "";
        this.fetchShopAds(searchString, value, subcategory, this.props.formValues.for, condition);
        let search = updateQueryStringParam('category', category, this.props.location.search);
        search = updateQueryStringParam('subcategory', "", search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });
    }

    onChangeSubCategory = ({ target }) => {
        const { value } = target;
        const { searchString, category, condition } = this.props.formValues;
        this.fetchShopAds(searchString, category, value, this.props.formValues.for, condition);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('subcategory', value === "" ? '' : value, this.props.location.search)
        });
    }

    onChangeFor = ({ target }) => {
        const { value } = target;
        const { searchString, condition, category, subcategory } = this.props.formValues;
        this.fetchShopAds(searchString, category, subcategory, value, condition);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('for', value, this.props.location.search)
        });
    }

    onChangeCondition = ({ target }) => {
        const { value } = target;
        const { searchString, category, subcategory } = this.props.formValues;
        this.fetchShopAds(searchString, category, subcategory, this.props.formValues.for, value);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('condition', value, this.props.location.search)
        });
    }

    render() {
        const { shopID, shopName, ads, categories, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentAds = ads.slice(firstIndex, lastIndex);
        const { fatalError, authError, contentUnavailable } = this.state.errorMessage;
        const { formValues, isFetchingAds } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-collections-area">
                    <div className="container">
                        <div className="section-title">
                            <h2 className="word-break"><span className="dot"></span> Ads of {shopName}</h2>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                <span className="float-right"><Link className="btn btn-primary" to={{ pathname: `/account/ads/shops/${shopID}/attach-ad` }}>Attach Ad to this Shop</Link></span>
                            </div>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-lg-12 col-md-12">
                                    <Field type="text" name="searchString" component={renderInput} label="Search" placeholder={'Type to search Ads in ' + shopName} onChange={this.debouncedOnChange} />
                                </div>
                                <div className="col-lg-3 col-md-3">
                                    <Field type="select" name="category" component={renderSelect} label="Category" onChange={this.onChangeCategory}>
                                        <option value="">All</option>
                                        {
                                            categories.map((c, i) => <option key={i} value={c.categoryName}>{c.categoryName}</option>)
                                        }
                                    </Field>
                                </div>
                                {formValues && formValues.category && formValues.category !== "" && <div className="col-lg-3 col-md-3">
                                    <Field type="select" name="subcategory" component={renderSelect} label="Subcategory" onChange={this.onChangeSubCategory}>
                                        <option value="">All</option>
                                        {
                                            categories && categories.length && categories.find(c => c.categoryName === formValues.category).subcategories.map((sc, i) => {
                                                return <option key={i} value={sc}>{sc}</option>
                                            })
                                        }
                                    </Field>
                                </div>}
                                <div className="col-lg-3 col-md-3">
                                    <Field type="select" name="for" component={renderSelect} label="For" onChange={(e) => this.onChangeFor(e)}>
                                        <option value="">All</option>
                                        <option value="Sale">Sale</option>
                                        <option value="Rent">Rent</option>
                                    </Field>
                                </div>
                                {formValues && formValues.for !== "Rent" &&
                                    <div className="col-lg-3 col-md-3">
                                        <Field type="select" name="condition" component={renderSelect} label="Condition" onChange={(e) => this.onChangeCondition(e)}>
                                            <option value="">All</option>
                                            <option value="New">New</option>
                                            <option value="Used">Used</option>
                                            <option value="Reconditioned">Reconditioned</option>
                                        </Field>
                                    </div>}
                            </div>
                        </form>
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                <div className="search-result-listing">
                                    <div className="row align-items-center">
                                        <div className="col d-flex justify-content-center">
                                            <ListingInfo
                                                itemsCount={currentAds.length}
                                                firstIndex={firstIndex}
                                                totalItemsCount={totalItemsCount}
                                                isFetching={this.props.isFetchingAds}
                                                message={'Filtering results...'} />
                                        </div>
                                    </div>
                                </div>
                                {!isFetchingAds && <section>
                                    <div id="products-filter" className="products-collections-listing row">
                                        {currentAds.map((ad, index) => {
                                            return <SingleAdBox
                                                key={ad.adID}
                                                ad={ad}
                                                detailLink={`/account/ads/${ad.adID}`} />
                                        })}
                                    </div>
                                    {currentAds.length > 0 ? <nav className="pagination-area">
                                        <Pagination
                                            activePage={this.state.activePage}
                                            itemsCountPerPage={this.state.itemsCountPerPage}
                                            totalItemsCount={this.state.totalItemsCount}
                                            pageRangeDisplayed={5}
                                            onChange={this.handlePageChange.bind(this)}
                                            linkClass="page-numbers"
                                            itemClassNext="next"
                                            activeLinkClass="current"
                                        />
                                    </nav> : ''}
                                </section>}
                            </div>
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        )
    }
}

AuthShopAdsComp = reduxForm({
    form: 'auth-shop-ads',
    initialValues: {
        category: "",
        subcategory: "",
        name: ""
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(AuthShopAdsComp);

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('auth-shop-ads')(state),
        isFetchingAds: createLoadingSelector(['FETCH_SHOP_ADS'])(state),
        adsData: state.adReducer
    };
}

const AuthShopAds = AccountTab(AuthShopAdsComp, "ads");

export default connect(mapStateToProps, { fetchAuthShopAds })(AuthShopAds);