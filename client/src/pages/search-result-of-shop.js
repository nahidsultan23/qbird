import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, getFormValues } from 'redux-form';
import Pagination from "react-js-pagination";
import { Link } from 'react-router-dom';
import Rating from 'react-rating';

import renderSelect from '../constants/forms/renderSelect';
import { searchResultOfShop } from '../store/actions/searchResultActions';
import SingleAdBox from '../components/Ad/SingleAdBox';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import queryString from 'query-string';
import { updateQueryStringParam } from '../services/common';
import Spinner from '../components/Common/Spinner';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import NoContentFound from '../components/Common/NoContentFound';
import ListingInfo from '../components/Common/ListingInfo';
import { bucketUrl } from '../constants/urls/bucket';
import dummy from '../img/NoPhotoAvailable/noPhotoAvailable640x600.png';
import { truncate, thousandSeparators } from '../services/common';

class SearchResultOfShop extends React.Component {

    state = {
        numberOfShops: 0,
        numberOfIndividualAds: 0,
        items: [],
        activePage: 1,
        itemsCountPerPage: 60,
        totalItemsCount: 0,
        location: null,
        mapVisible: false,
        mapContainerVisible: false,
        category: "",
        searchString: "",
        errorMessage: {
            fatalError: null,
            contentUnavailable: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        window.addEventListener('click', function(e){
            if(document.getElementById('left-panel') && !document.getElementById('left-panel').contains(e.target) && window.innerWidth <= 950){
                if(!(document.getElementById('left-panel').contains(e.target) || document.getElementById('filter-result-options').contains(e.target))){
                    document.getElementById("left-panel").style.display = "none";
                }
            }
        });

        const values = queryString.parse(this.props.location.search)
        const { shopID, category, subcategory, searchString, condition, page } = values;
        this.setState({
            searchString: searchString
        })
        const forfor = values.for;
        if (shopID) {
            this.setState({ shopID: shopID });
            this.props.change("category", category ? category : "");
            this.props.change("subcategory", !subcategory ? "" : subcategory);
            this.props.change("searchString", searchString ? searchString : "");
            this.props.change("condition", condition ? condition : "");
            this.props.change("for", forfor ? forfor : "");
            this.fetchAds(searchString, category, subcategory, forfor, condition, shopID, Number(page));
        }

        if(window.innerWidth <= 600) {
            document.getElementById("collapsible-portion").style.height = 0;
            this.setState({
                collpased: true
            })
        }
    }

    fetchAds = (searchString, category, subcategory, forfor, condition, shopID, page = 1) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        this.setState({ items: [], totalItemsCount: 0 });
        this.props.searchResultOfShop({
            urlName: shopID,
            searchString: searchString ? searchString : '',
            category: category ? category : '',
            subcategory: subcategory ? subcategory : '',
            for: forfor ? forfor : '',
            condition: (forfor === "Rent") ? '' : condition ? condition : ''
        }).then(() => {
            const { status } = this.props.searchResults.payload;
            if(status === "success") {
                const { ads, shopName, contactNo, shopAddress, coordinate, categories, category, subcategory, rating, numberOfRatings, numberOfComments, totalNumberOfAds, shoppingCount, photo } = this.props.searchResults.payload;
                this.setState({ items: ads ? ads : [], totalItemsCount: ads ? ads.length : 0, activePage: page, shopName: shopName, contactNo, shopAddress, coordinate, categories, category, subcategory, rating, numberOfRatings, numberOfComments, totalNumberOfAds, shoppingCount, photo });
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
                const { fatalError, contentUnavailable } = this.props.searchResults.payload.errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError,
                        contentUnavailable: contentUnavailable
                    }
                });
            }
        });
    }

    resize = () => {
        if(document.getElementById("left-panel") && window.innerWidth > 950 && document.getElementById("left-panel").style.display === "none") {
            document.getElementById("left-panel").style.display = "inline-block";
        }
    }

    onCloseLeftPanel = () => {
        document.getElementById("left-panel").style.display = "none";
    }

    onOpenLeftPanel = () => {
        document.getElementById("left-panel").style.display = "inline-block";
    }

    handlePageChange(pageNumber) {
        pageNumber = (pageNumber && Number.isInteger(Number(pageNumber)) && Number(pageNumber) > 1) ? Number(pageNumber) : 1;
        this.setState({ activePage: pageNumber });
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('page', pageNumber, this.props.location.search)
        });
        window.scrollTo(0,0);
    }

    onChangeSearchString = ({ target }) => {
        const { value } = target;
        this.setState({
            currentSearchString: value
        })
    }

    onSubmitSearchString = (e) => {
        e.preventDefault();
        const { currentSearchString } = this.state;
        this.setState({
            searchString: currentSearchString
        })
        this.props.change("searchString", currentSearchString);
        const { category, subcategory,condition } = this.props.formValues;
        this.fetchAds(currentSearchString, category, subcategory, this.props.formValues.for, condition, this.state.shopID);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('searchString', currentSearchString, this.props.location.search)
        });
    }

    onChangeCategory = ({ target }) => {
        const { value } = target;
        let category = value ? value : "";
        this.props.change("subcategory", "");
        const { searchString, condition } = this.props.formValues;
        const subcategory = "";
        this.fetchAds(searchString, value, subcategory, this.props.formValues.for, condition, this.state.shopID);
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
        this.fetchAds(searchString, category, value, this.props.formValues.for, condition, this.state.shopID);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('subcategory', value === "" ? '' : value, this.props.location.search)
        });
    }

    onChangeFor = ({ target }) => {
        const { value } = target;
        const { searchString, condition, category, subcategory } = this.props.formValues;
        this.fetchAds(searchString, category, subcategory, value, condition, this.state.shopID);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('for', value, this.props.location.search)
        });
    }

    onChangeCondition = ({ target }) => {
        const { value } = target;
        const { searchString, category, subcategory } = this.props.formValues;
        this.fetchAds(searchString, category, subcategory, this.props.formValues.for, value, this.state.shopID);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('condition', value, this.props.location.search)
        });
    }

    renderItems = (currentItems) => {
        return currentItems.map((ad, index) => {
            return <SingleAdBox
                key={ad.adID + index}
                ad={ad}
                detailLink={`/ad/${ad.adID}`}
                showDistance={true} />;
        })
    }

    createFilterMessage = () => {
        const { searchString } = this.state;
        const { formValues } = this.props;
        let filterEndMessage = "";
        if(formValues) {
            if(formValues.category) {
                filterEndMessage = formValues.category;
            }

            if(formValues.subcategory) {
                filterEndMessage = filterEndMessage + ": " + formValues.subcategory;
            }

            if(formValues.for) {
                if(formValues.category || formValues.subcategory) {
                    filterEndMessage = filterEndMessage + ": " + formValues.for;
                }
                else {
                    filterEndMessage = formValues.for;
                }
            }

            if(formValues.condition) {
                if(formValues.category || formValues.subcategory || formValues.for) {
                    filterEndMessage = filterEndMessage + ": " + formValues.condition;
                }
                else {
                    filterEndMessage = formValues.condition;
                }
            }

            if(searchString && (formValues.category || formValues.subcategory || formValues.for || formValues.condition)) {
                filterEndMessage = filterEndMessage + ": ";
            }
        }

        return filterEndMessage;
    }

    renderShopPhoto = () => {
        const { photo } = this.state;
        if (photo) {
            return <img src={bucketUrl + "photos/photo-320/" + photo.replace("#","%23")} loading="lazy" alt="" />
        } else {
            return <img src={dummy} alt="" />
        }
    }

    onToggleCollapse = () => {
        if(document.getElementById("collapsible-portion").clientHeight > 0) {
            document.getElementById("collapsible-portion").style.height = 0;
            this.setState({
                collpased: true
            })
        }
        else {
            document.getElementById("collapsible-portion").style.height = "auto";
            this.setState({
                collpased: false
            })
        }
    }

    render() {
        const { isFiltering, formValues } = this.props;
        const { items, activePage, itemsCountPerPage, totalItemsCount, shopID, shopName, contactNo, shopAddress, coordinate, categories, searchString, category, subcategory, rating, numberOfRatings, numberOfComments, totalNumberOfAds, shoppingCount, collpased } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentItems = items.slice(firstIndex, lastIndex);
        const { fatalError, contentUnavailable } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : contentUnavailable ? <NoContentFound /> :
                <section className="products-collections-area ptb-60">
                    <div className="search-result-of-shop items-container">
                        <div className="shop-name-container">
                            <div className="shop-name">{shopName}</div>
                            <div className="visit-shop">
                                <Link className="visit-shop-link" to={`/shop/${shopID}`}>Visit Shop</Link>
                            </div>
                        </div>
                        <div className="collapsible-shop-details">
                            <div className="collapsible-portion" id="collapsible-portion">
                                <div className="photo-container">
                                    <div className="photo">
                                        {this.renderShopPhoto()}
                                    </div>
                                </div>
                                <div className="description">
                                    <div className="description-1-container word-break">
                                        <div className="description-1">
                                            {category ? <div className="category">{category}</div> : null}
                                            {subcategory ? <div className="subcategory">{subcategory}</div> : null}
                                            <div><Rating
                                                emptySymbol={<i className="far fa-star" style={{color: "#dad9d9"}}></i>}
                                                fullSymbol={<i className="fas fa-star" style={{color: "orange"}}></i>}
                                                initialRating={rating ? rating : 0}
                                                readonly={true} /> <span className="number-of-ratings">({numberOfRatings ? thousandSeparators(numberOfRatings) : 0} {(numberOfRatings > 1) ? "ratings" : "rating"})</span>
                                            </div>
                                            <div className="comments">{numberOfComments ? thousandSeparators(numberOfComments) : 0} {(numberOfComments && (numberOfComments > 1)) ? "comments" : "comment"}</div>
                                            <div className="ads">{totalNumberOfAds ? thousandSeparators(totalNumberOfAds) : 0} {(totalNumberOfAds && (totalNumberOfAds > 1)) ? "ads" : "ad"}</div>
                                            <div className="shopping-count">{shoppingCount ? thousandSeparators(shoppingCount) : 0} shopping count</div>
                                        </div>
                                    </div>
                                    <div className="description-2-container word-break">
                                        <div className="description-2">
                                            <div><i className="fa fa-address-card address-icon"></i> {truncate(shopAddress, 80)}</div>
                                            <div><i className="fa fa-phone-square phone-icon"></i> {contactNo}</div>
                                            <div className="check-shop-location-container"><a className="check-shop-location" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/place/${coordinate && coordinate.lat},${coordinate && coordinate.long}/@${coordinate && coordinate.lat},${coordinate && coordinate.long},17z`}>Check Shop Location</a></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="show-details-container" onClick={() => this.onToggleCollapse()}>
                                {collpased ? <div className="cursor-pointer">
                                    <div>Show Shop Details</div>
                                    <div><i className="fas fa-angle-double-down"></i></div>
                                </div> :
                                <div className="cursor-pointer">
                                    <div><i className="fas fa-angle-double-up"></i></div>
                                    <div>Hide Shop Details</div>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="items-container">
                        <div className="left-panel" id="left-panel">
                            <form>
                                <div className="filter-options-div">
                                    <div className="criteria-header">
                                        Criteria
                                    </div>
                                    <div className="filter-options category">
                                        <div className="label">Category</div>
                                        <div className="options">
                                            <Field name="category" component={renderSelect} onChange={(e) => this.onChangeCategory(e)}>
                                                <option value="">All</option>
                                                {categories && categories.map((category, index) => {
                                                    return <option key={index} value={category.categoryName}>{category.categoryName}</option>
                                                })}
                                            </Field>
                                        </div>
                                    </div>
                                    {formValues && formValues.category && formValues.category !== "" && <div className="filter-options subcategory">
                                        <div className="label">Subcategory</div>
                                        <div className="options">
                                            <Field name="subcategory" component={renderSelect} onChange={(e) => this.onChangeSubCategory(e)}>
                                                <option value="">All</option>
                                                {
                                                    categories && categories.length && categories.find(c => c.categoryName === formValues.category).subcategories.map((sc, i) => {
                                                        return <option key={i} value={sc}>{sc}</option>
                                                    })
                                                }
                                            </Field>
                                        </div>
                                    </div>}
                                    <div className="filter-options for">
                                        <div className="label">For</div>
                                        <div className="options">
                                            <Field type="select" name="for" component={renderSelect} onChange={(e) => this.onChangeFor(e)}>
                                                <option value="">All</option>
                                                <option value="Sale">Sale</option>
                                                <option value="Rent">Rent</option>
                                            </Field>
                                        </div>
                                    </div>
                                    {formValues && formValues.for !== "Rent" && <div className="filter-options condition">
                                        <div className="label">Condition</div>
                                        <div className="options">
                                            <Field type="select" name="condition" component={renderSelect} onChange={(e) => this.onChangeCondition(e)}>
                                                <option value="">All</option>
                                                <option value="New">New</option>
                                                <option value="Used">Used</option>
                                                <option value="Reconditioned">Reconditioned</option>
                                            </Field>
                                        </div>
                                    </div>}
                                </div>
                            </form>
                            <div className="close-button">
                                <i className="fa fa-window-close cursor-pointer" aria-hidden="true" onClick={() => {this.onCloseLeftPanel()}}></i>
                            </div>
                        </div>
                        <div className="items-result">
                            <div className="number-of-results">
                                <div className="result-count">
                                    <ListingInfo
                                        itemsCount={currentItems.length}
                                        firstIndex={firstIndex}
                                        totalItemsCount={totalItemsCount}
                                        isFetching={isFiltering}
                                        message={'Filtering results...'}
                                        searchString={searchString}
                                        filterEndMessage={this.createFilterMessage()} />
                                </div>
                                <div className="filter-result-options-div">
                                    <div className="filter-result-options cursor-pointer" id="filter-result-options" onClick={() => {this.onOpenLeftPanel()}}><i className="fa fa-filter" aria-hidden="true"></i> Filter</div>
                                </div>
                                <div className="search-div">
                                    <form onSubmit={(e) => this.onSubmitSearchString(e)}>
                                        <input type="text" name="searchString" className="search-input" placeholder="Type something to search" defaultValue={searchString ? searchString : null} onChange={(e) => this.onChangeSearchString(e)} />
                                        <button className="search-button" type="submit"><i className="fas fa-search"></i></button>
                                    </form>
                                </div>
                            </div>
                            {this.renderItems(currentItems)}

                            {(isFiltering) ? <React.Fragment><div className="row align-items-center">
                                    <div className="col d-flex justify-content-center">
                                        <Spinner isLoading={isFiltering} /> &nbsp;Fetching...
                                    </div>
                                </div>
                            </React.Fragment> :
                            <React.Fragment>
                                <div className="result-count-small-screen">
                                    {currentItems.length === 0 ? <div>
                                        <ListingInfo
                                            itemsCount={currentItems.length}
                                            firstIndex={firstIndex}
                                            totalItemsCount={totalItemsCount}
                                            isFetching={isFiltering}
                                            message={'Filtering results...'}
                                            searchString={searchString}
                                            filterEndMessage={this.createFilterMessage()} />
                                    </div> : ""}
                                </div>
                                <div className="row mt-20">
                                    <div className="col-lg-12 col-md-12">
                                        {currentItems && currentItems.length > 0 ? <nav className="pagination-area">
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
                                    </div>
                                </div>
                            </React.Fragment>}
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        )
    }
}

SearchResultOfShop = reduxForm({
    form: 'search-result-of-shop-form',
    initialValues: {
        for: '',
        condition: '',
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(SearchResultOfShop);

const mapStateToProps = (state) => {
    return {
        formValues: getFormValues('search-result-of-shop-form')(state),
        isFiltering: createLoadingSelector(['SEARCH_RESULT_OF_SHOP'])(state),
        searchResults: state.searchResults
    };
}

export default connect(mapStateToProps, { searchResultOfShop })(SearchResultOfShop);