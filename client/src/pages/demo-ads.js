import React from 'react'
import { connect } from 'react-redux';
import { reduxForm, Field, getFormValues } from 'redux-form';
import Pagination from "react-js-pagination";
import { debounce } from "lodash";
import queryString from 'query-string';
import Modal from 'rc-dialog';

import AccountTab from '../components/HOC/AccountTab';
import { fetchDemoAds, addAdToList, removeAdFromList } from '../store/actions/demoAdActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { Link } from 'react-router-dom';
import renderSelect from '../constants/forms/renderSelect';
import renderInput from '../constants/forms/renderInput';
import DemoSingleAdBox from '../components/DemoAd/DemoSingleAdBox';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class DemoAdsComp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ads: [],
            listedDemoAds: [],
            ongoingListModification: [],
            activePage: 1,
            itemsCountPerPage: 60,
            totalItemsCount: 0,
            permissions: {},
            categories: [],
            showErrorModal: false,
            errorModalMessage: null,
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
        const { searchString, category, subcategory, page } = values;
        this.props.change("searchString", !searchString ? "" : searchString);
        this.props.change("category", !category ? "" : category);
        this.props.change("subcategory", !subcategory ? "" : subcategory);
        
        this.fetchDemoAds(searchString, category, subcategory, Number(page));
    }

    fetchDemoAds = (searchString, category, subcategory, page = 1) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        const { isFetchingAds } = this.props;
        if(!isFetchingAds) {
            this.props.fetchDemoAds({ searchString, category, subcategory }).then(() => {
                const { status, ads, categories, permissions, listedDemoAds, errorMessage } = this.props.demoAdsData.payload;
                if(status === 'success') {
                    this.setState({
                        ads: ads,
                        categories: categories,
                        permissions: permissions,
                        listedDemoAds: listedDemoAds,
                        totalItemsCount: ads.length,
                        activePage: page
                    });

                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', page, this.props.location.search)
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
        const { category, subcategory } = this.props.formValues;
        this.fetchDemoAds(value, category, subcategory);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('searchString', value === "" ? '' : value, this.props.location.search)
        });
    }

    onChangeCategory = ({ target }) => {
        const { value } = target;
        let category = value ? value : "";
        this.props.change("subcategory", "");
        const { searchString } = this.props.formValues;
        this.fetchDemoAds(searchString, value, "");
        let search = updateQueryStringParam('category', category, this.props.location.search);
        search = updateQueryStringParam('subcategory', "", search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });
    }

    onChangeSubCategory = ({ target }) => {
        const { value } = target;
        const { category, searchString } = this.props.formValues;
        this.fetchDemoAds(searchString, category, value);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('subcategory', value === "" ? '' : value, this.props.location.search)
        });
    }

    onAddToList = (adID) => {
        let ongoingListModification = this.state.ongoingListModification;
        ongoingListModification.push(adID);
        this.setState({
            ongoingListModification: ongoingListModification
        });

        this.props.addAdToList({ adID: adID }).then(() => {
            if(ongoingListModification.length === 1) {
                this.setState({
                    ongoingListModification: []
                });
            }
            else {
                ongoingListModification.splice(ongoingListModification.indexOf(adID), 1);
                this.setState({
                    ongoingListModification: ongoingListModification
                });
            }

            const { status, listedDemoAds, errorMessage } = this.props.demoAdsData.payload;

            if(status === "success") {
                this.setState({
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
        })
    }

    onRemoveFromList = (adID) => {
        let ongoingListModification = this.state.ongoingListModification;
        ongoingListModification.push(adID);
        this.setState({
            ongoingListModification: ongoingListModification
        });

        this.props.removeAdFromList({ adID: adID }).then(() => {
            if(ongoingListModification.length === 1) {
                this.setState({
                    ongoingListModification: []
                });
            }
            else {
                ongoingListModification.splice(ongoingListModification.indexOf(adID), 1);
                this.setState({
                    ongoingListModification: ongoingListModification
                });
            }

            const { status, listedDemoAds, errorMessage } = this.props.demoAdsData.payload;

            if(status === "success") {
                this.setState({
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
        })
    }

    onCloseErrorModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    render() {
        const { ads, categories, listedDemoAds, ongoingListModification, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const { attachDemoAd, createDemoAd } = this.state.permissions;
        const { formValues, isModifyingList } = this.props;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentAds = ads.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="products-collections-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 list-create-demo-ad-link">
                                {attachDemoAd && listedDemoAds && listedDemoAds.length > 0 ? <span className="pull-right"><Link className="btn list-link-button-demo-ad" to={'/account/demo-ads/add-to-account'}>Listed Demo Ads</Link></span> : ''}
                                {createDemoAd ? <span className="pull-right"><Link className="btn btn-primary" to={'/account/demo-ads/create'}>Create Demo Ad</Link></span> : ''}
                            </div>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-lg-4">
                                    <Field type="text" name="searchString" component={renderInput} label="Search" placeholder="Type something to search in Demo Ads" onChange={this.debouncedOnChange} />
                                </div>
                                <div className="col-lg-4">
                                    <Field type="select" name="category" component={renderSelect} label="Category" onChange={this.onChangeCategory}>
                                        <option value="">All</option>
                                        {
                                            categories.map((c, i) => <option key={i} value={c.categoryName}>{c.categoryName}</option>)
                                        }
                                    </Field>
                                </div>
                                <div className="col-lg-4">
                                    <Field type="select" name="subcategory" component={renderSelect} label="Subcategory" onChange={this.onChangeSubCategory}>
                                        <option value="">All</option>
                                        {
                                            formValues && formValues.category && formValues.category !== "" && categories.find(c => c.categoryName === formValues.category).subcategories.map((sc, i) => {
                                                return <option key={i} value={sc}>{sc}</option>
                                            })
                                        }
                                    </Field>
                                </div>
                            </div>
                        </form>
                        <div className="row mt-20">
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
                                {!this.props.isFetchingAds && <section>
                                    <div id="products-filter" className="products-collections-listing row">
                                        {currentAds.map((ad, index) => {
                                            return <DemoSingleAdBox key={ad.adID} ad={ad} redirectUrl={`/account/demo-ads/${ad.adID}`} listedDemoAds={listedDemoAds} attachDemoAd={attachDemoAd} onAddToList={this.onAddToList} onRemoveFromList={this.onRemoveFromList} isModifyingList={isModifyingList} ongoingListModification={ongoingListModification} />
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
            </React.Fragment>
        )
    }
}

DemoAdsComp = reduxForm({
    form: 'demo-ads',
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
})(DemoAdsComp);

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('demo-ads')(state),
        isFetchingAds: createLoadingSelector(["FETCH_DEMO_ADS"])(state),
        isModifyingList: createLoadingSelector(["DEMO_AD_ADD_TO_LIST", "DEMO_AD_REMOVE_FROM_LIST"])(state),
        demoAdsData: state.demoAdReducer
    }
};

const DemoAds = AccountTab(DemoAdsComp, "demoAds");

export default connect(mapStateToProps, { fetchDemoAds, addAdToList, removeAdFromList })(DemoAds);