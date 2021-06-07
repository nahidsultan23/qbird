import React from 'react'
import { connect } from 'react-redux';
import { Field, reduxForm, getFormValues } from 'redux-form';
import Pagination from "react-js-pagination";
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { debounce } from "lodash";

import renderInput from '../constants/forms/renderInput';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import { fetchShops } from '../store/actions/shopActions';
import SingleShopBox from '../components/Shop/SingleShopBox';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class ShopsComp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            shops: [],
            activePage: 1,
            itemsCountPerPage: 60,
            totalItemsCount: 0,
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
        const { searchString, page } = values;
        this.props.change("searchString", !searchString ? "" : searchString);
        this.fetchAuthShops(searchString, Number(page));
    }

    fetchAuthShops = (searchString, page = 1) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        const { isFetchingShops } = this.props;
        if(!isFetchingShops) {
            this.props.fetchShops({
                searchString: searchString
            }).then(() => {
                const { status, shops, errorMessage } = this.props.shopsData.payload;
    
                if(status === 'success') {
                    this.setState({
                        shops: shops,
                        totalItemsCount: shops.length,
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

    onChangeSearchString = ({ target }) => {
        const { value } = target;
        this.fetchAuthShops(value);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('searchString', value === "" ? '' : value, this.props.location.search)
        });
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

    render() {
        const { shops, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentShop = shops.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        const { isFetchingShops } = this.props;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="products-collections-area">
                    <div className="container">
                        <div className="section-title">
                            <h2><span className="dot"></span> Shops</h2>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                <Link className="float-right btn btn-primary" to={'/account/ads/shops/create-shop'}>Create Shop</Link>
                            </div>
                        </div>
                        <form>
                            <div className="row">
                                <div className="col-lg-12 col-md-12">
                                    <Field type="text" name="searchString" component={renderInput} label="Search" placeholder="Type to search Shops" onChange={this.debouncedOnChange} />
                                </div>
                            </div>
                        </form>
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                <div className="search-result-listing">
                                    <div className="row align-items-center">
                                        <div className="col d-flex justify-content-center">
                                            <ListingInfo
                                                itemsCount={currentShop.length}
                                                firstIndex={firstIndex}
                                                totalItemsCount={totalItemsCount}
                                                isFetching={this.props.isFetchingShops} />
                                        </div>
                                    </div>
                                </div>
                                {!isFetchingShops && <section>
                                    <div id="products-filter" className="products-collections-listing row ">
                                        {currentShop.map((shop, index) => {
                                            return <SingleShopBox
                                                key={shop.shopID}
                                                shop={shop}
                                                detailLink={`/account/ads/shops/${shop.urlName}`}
                                                adsLink={`/account/ads/shops/${shop.urlName}/ads`} />
                                        })}
                                    </div>
                                    {currentShop.length > 0 ? <nav className="pagination-area">
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

ShopsComp = reduxForm({
    form: 'shops',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(ShopsComp);

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('shops')(state),
        isFetchingShops: createLoadingSelector(['FETCH_SHOPS'])(state),
        shopsData: state.shopReducer
    };
}

const Shops = AccountTab(ShopsComp, "ads");

export default connect(mapStateToProps, { fetchShops })(Shops);
