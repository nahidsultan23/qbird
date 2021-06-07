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
import { fetchAds } from '../store/actions/adActions';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class AuthAdsComp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            numberOfShops: 0,
            numberOfIndividualAds: 0,
            ads: [],
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
        
        this.fetchAds(searchString, category, subcategory, forfor, condition, Number(page));
    }

    fetchAds = (searchString, category, subcategory, forfor, condition, page = 1) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        const { isFetchingAds } = this.props;
        if(!isFetchingAds) {
            this.props.fetchAds({
                searchString: searchString,
                category: category,
                subcategory: subcategory,
                for: forfor,
                condition: condition
            }).then(() => {
                const { status, errorMessage } = this.props.adsData.payload;

                if(status === 'success') {
                    const { ads, categories, numberOfIndividualAds, numberOfShops } = this.props.adsData.payload;
                    this.setState({
                        ads: ads,
                        categories: categories,
                        totalItemsCount: ads.length,
                        numberOfIndividualAds: numberOfIndividualAds,
                        numberOfShops: numberOfShops,
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
        this.fetchAds(value, category, subcategory, this.props.formValues.for, condition);
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
        this.fetchAds(searchString, value, subcategory, this.props.formValues.for, condition);
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
        this.fetchAds(searchString, category, value, this.props.formValues.for, condition);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('subcategory', value === "" ? '' : value, this.props.location.search)
        });
    }

    onChangeFor = ({ target }) => {
        const { value } = target;
        const { searchString, condition, category, subcategory } = this.props.formValues;
        this.fetchAds(searchString, category, subcategory, value, condition);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('for', value, this.props.location.search)
        });
    }

    onChangeCondition = ({ target }) => {
        const { value } = target;
        const { searchString, category, subcategory } = this.props.formValues;
        this.fetchAds(searchString, category, subcategory, this.props.formValues.for, value);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('condition', value, this.props.location.search)
        });
    }

    render() {
        const { ads, categories, numberOfShops, numberOfIndividualAds, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentAds = ads.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        const { formValues, isFetchingAds } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="products-collections-area">
                    <div className="container">
                        <span className="pull-right">
                            <div className="shop-create-link"><Link className="btn btn-primary" to={'/account/ads/shops/create-shop'}>Create Shop</Link></div>
                            <div className="ad-create-link"><Link className="btn btn-primary" to={'/account/create-ad'}>Create Ad</Link></div>
                        </span>
                        <div className="create-ad-content">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-6">
                                    <Link to="/account/ads/shops">
                                        <div className="card" style={{ marginBottom: '10px', cursor: 'pointer' }}>
                                            <div className="card-body">
                                                <h5 className="card-title">{numberOfShops}</h5>
                                                <h6 className="card-subtitle mb-2 text-muted">Shops</h6>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-6">
                                    <Link to="/account/ads/individual-ads">
                                        <div className="card" style={{ marginBottom: '10px', cursor: 'pointer' }}>
                                            <div className="card-body">
                                                <h5 className="card-title">{numberOfIndividualAds}</h5>
                                                <h6 className="card-subtitle mb-2 text-muted">Individual Ads</h6>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-lg-12 col-md-12">
                                    <Field type="text" name="searchString" component={renderInput} label="Search" placeholder="Type to search Ads" onChange={this.debouncedOnChange} />
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

AuthAdsComp = reduxForm({
    form: 'auth-ads',
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
})(AuthAdsComp);


const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('auth-ads')(state),
        isFetchingAds: createLoadingSelector(['FETCH_ADS'])(state),
        adsData: state.adReducer
    };
}
const AuthAds = AccountTab(AuthAdsComp, 'ads');
export default connect(mapStateToProps, { fetchAds })(AuthAds);
