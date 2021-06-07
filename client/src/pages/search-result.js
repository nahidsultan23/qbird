import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, getFormValues } from 'redux-form';
import Pagination from "react-js-pagination";

import renderSelect from '../constants/forms/renderSelect';
import { fetchLocation } from '../store/actions/locationActions';
import { searchResultAds, searchResultShops } from '../store/actions/searchResultActions';
import SingleAdBox from '../components/Ad/SingleAdBox';
import Spinner from '../components/Common/Spinner';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Map from '../components/Maps/Map';
import SingleShopBox from '../components/Shop/SingleShopBox';
import queryString from 'query-string'
import { updateQueryStringParam, getAddress } from '../services/common';
import { srs } from '../services/srs';
import ListingInfo from '../components/Common/ListingInfo';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class SearchResult extends React.Component {

    state = {
        numberOfShops: 0,
        numberOfIndividualAds: 0,
        items: [],
        activePage: 1,
        itemsCountPerPage: 60,
        totalItemsCount: 0,
        location: {
            lat: null,
            long: null
        },
        mapVisible: false,
        mapContainerVisible: false,
        searchFor: "ads",
        category: "",
        searchString: "",
        subscription: null,
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    componentDidMount() {
        this.subscription = srs.catchEvent().subscribe(r => {
            this.handleSearchBarEvent(r);
        });

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        window.addEventListener('click', function(e){
            if(document.getElementById('left-panel') && !document.getElementById('left-panel').contains(e.target) && window.innerWidth <= 950){
                if(!(document.getElementById('left-panel').contains(e.target) || document.getElementById('filter-result-options').contains(e.target))){
                    document.getElementById("left-panel").style.display = "none";
                }
            }
        });

        // query string handling
        const values = queryString.parse(this.props.location.search);
        const { searchString, category, condition, lat, long, page, sortBy } = values;

        let searchSortBy = "Shops and Distance";

        if(searchString && searchString.length > 1 && !sortBy) {
            searchSortBy = "Best Match and Distance";
        }

        if(sortBy === "best-match") {
            searchSortBy = "Best Match";
        }
        else if(sortBy === "shops") {
            searchSortBy = "Shops";
        }
        else if(sortBy === "best-match-and-distance") {
            searchSortBy = "Best Match and Distance";
        }

        let urlSortBy = searchSortBy.toLowerCase().replace(/ /g,"-");

        let search = updateQueryStringParam('sortBy', urlSortBy, this.props.location.search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });

        this.setState({
            searchString: searchString
        })
        const forfor = values.for;
        let searchFor = values.searchFor;
        searchFor = (!searchFor || searchFor === '') ? 'ads' : searchFor;
        this.setState({
            searchFor: searchFor,
            sortBy: searchSortBy
        })
        this.props.change("searchString", !searchString ? "" : searchString);
        this.props.change("searchFor", searchFor);
        this.props.change("category", !category ? "" : category);
        this.props.change("for", !forfor ? "" : forfor);
        this.props.change("condition", !condition ? "" : condition);
        this.props.change("sortBy", searchSortBy);

        this.fetchLocation({
            searchString: searchString,
            searchFor: searchFor,
            category: category,
            forfor: forfor,
            condition: condition,
            coordinates: {
                lat: lat,
                long: long
            },
            page: page,
            sortBy: searchSortBy
        })
    }

    fetchLocation = ({searchString, searchFor, category, forfor, condition, coordinates, page, sortBy}) => {
        this.props.fetchLocation().then(() => {
            const { status, location } = this.props.locationData.payload;
            let latitude = Number(location.lat);
            let longitude = Number(location.long);
            let usableLat = Number(coordinates.lat);
            let usableLng = Number(coordinates.long);

            if(status === 'success') {
                this.setState({
                    defaultLocation: {
                        lat: latitude,
                        lng: longitude
                    },
                    center: {
                        lat: latitude,
                        lng: longitude
                    },
                    gotLocation: true
                });

                if(!(usableLat && usableLng)) {
                    usableLat = latitude;
                    usableLng = longitude;
                }

                this.setState({
                    location: {
                        lat: usableLat,
                        long: usableLng
                    }
                });
                getAddress(usableLat, usableLng).then(response => this.props.change('coordinate', `${response.address}`));

                if(!(Number(coordinates.lat) && Number(coordinates.lat))) {
                    let search = updateQueryStringParam('lat', usableLat, this.props.location.search);
                    search = updateQueryStringParam('long', usableLng, search);
                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: search
                    });
                }

                if (searchFor === 'ads')
                    this.fetchAds(category, searchString, forfor, condition, { lat: usableLat, long: usableLng }, Number(page), sortBy);
                else if (searchFor === 'shops')
                    this.fetchShops(searchString, category, { lat: usableLat, long: usableLng }, Number(page));
            }
            else {
                const success = (position) => {
                    latitude = Number(position.coords.latitude);
                    longitude = Number(position.coords.longitude);

                    localStorage.setItem('fetchLocation', 'success');
                    localStorage.setItem('lat', latitude);
                    localStorage.setItem('long', longitude);
                    
                    this.setState({
                        defaultLocation: {
                            lat: latitude,
                            lng: longitude
                        },
                        center: {
                            lat: latitude,
                            lng: longitude
                        },
                        gotLocation: true
                    });

                    if(!(usableLat && usableLng)) {
                        usableLat = latitude;
                        usableLng = longitude;
                    }
        
                    this.setState({
                        location: {
                            lat: usableLat,
                            long: usableLng
                        }
                    });
                    getAddress(usableLat, usableLng).then(response => this.props.change('coordinate', `${response.address}`));
    
                    if(!(Number(coordinates.lat) && Number(coordinates.lat))) {
                        let search = updateQueryStringParam('lat', usableLat, this.props.location.search);
                        search = updateQueryStringParam('long', usableLng, search);
                        this.props.history.replace({
                            pathname: this.props.location.pathname,
                            search: search
                        });
                    }
                    
                    if (searchFor === 'ads')
                        this.fetchAds(category, searchString, forfor, condition, { lat: usableLat, long: usableLng }, Number(page), sortBy);
                    else if (searchFor === 'shops')
                        this.fetchShops(searchString, category, { lat: usableLat, long: usableLng }, Number(page));
                };
                
                const error = () => {
                    this.setState({
                        defaultLocation: {
                            lat: latitude,
                            lng: longitude
                        },
                        center: {
                            lat: latitude,
                            lng: longitude
                        },
                        gotLocation: true
                    });

                    if(!(usableLat && usableLng)) {
                        usableLat = "";
                        usableLng = "";
                    }
        
                    if (usableLat && usableLng) {
                        this.setState({
                            location: {
                                lat: usableLat,
                                long: usableLng
                            }
                        });
                        getAddress(usableLat, usableLng).then(response => this.props.change('coordinate', `${response.address}`));
                    };
                    if (searchFor === 'ads')
                        this.fetchAds(category, searchString, forfor, condition, { lat: usableLat, long: usableLng }, Number(page), sortBy);
                    else if (searchFor === 'shops')
                        this.fetchShops(searchString, category, { lat: usableLat, long: usableLng }, Number(page));
                };
        
                navigator.geolocation.getCurrentPosition(success, error);
            }
        })
    }

    resize = () => {
        if(document.getElementById("left-panel") && window.innerWidth > 950 && document.getElementById("left-panel").style.display === "none") {
            document.getElementById("left-panel").style.display = "inline-block";
        }
    }

    handleSearchBarEvent = ({ category, searchString, searchFor }) => {
        const { reset } = this.props;
        reset();

        if(document.getElementById("search-input")) {
            document.getElementById("search-input").value = searchString;
        }

        let sortBy = (searchString && searchString.length > 1) ? "Best Match and Distance" : "Shops and Distance";

        this.fetchLocation({
            searchString: searchString,
            searchFor: !searchFor ? 'ads' : searchFor,
            category: category,
            coordinates: {
                lat: "",
                long: ""
            },
            page: 1,
            sortBy: sortBy
        })

        let urlSortBy = sortBy.toLowerCase().replace(/ /g,"-");

        let search = updateQueryStringParam('sortBy', urlSortBy, this.props.location.search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });

        this.props.change("searchString", !searchString ? "" : searchString);
        this.props.change("ads", !searchFor ? 'ads' : searchFor);
        this.props.change("sortBy", sortBy);

        this.setState({
            searchString: searchString,
            searchFor: !searchFor ? 'ads' : searchFor,
            sortBy: sortBy
        })

        this.props.change("category", !category ? '' : category);
        this.setState({ mapVisible: false });
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

    fetchAds = (category, searchString, forfor, condition, location, page = 1, sortBy) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        this.setState({ items: [], totalItemsCount: 0 });
        this.props.searchResultAds({
            searchString: searchString ? searchString : '',
            category: category ? category : '',
            coordinate: {
                lat: location && location.lat ? location.lat : '',
                long: location && location.long ? location.long : ''
            },
            for: forfor ? forfor : '',
            condition: (forfor === "Rent") ? '' : condition ? condition : '',
            sortBy: sortBy
        }).then(() => {
            const { ads, status, errorMessage } = this.props.searchResults.payload;
            if(status === "success") {
                if(ads && ads.length > 0) {
                    this.setState({ items: ads, totalItemsCount: ads.length, activePage: page });
                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', page, this.props.location.search)
                    });
                }
                else {
                    this.setState({ items: [], totalItemsCount: 0, activePage: 1 });
                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', 1, this.props.location.search)
                    });
                }
            }
            else {
                const { fatalError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError
                    }
                });
            }
        });
    }

    fetchShops = (searchString, category, location, page = 1) => {
        page = (page && Number.isInteger(page) && page > 1) ? page : 1;
        this.setState({ items: [], totalItemsCount: 0 });
        this.props.searchResultShops({
            searchString: searchString ? searchString : '',
            category: category ? category : '',
            coordinate: {
                lat: location && location.lat ? location.lat : '',
                long: location && location.long ? location.long : ''
            },
        }).then(() => {
            const { shops, status, errorMessage } = this.props.searchResults.payload;
            if(status === "success") {
                if(shops && shops.length > 0) {
                    this.setState({ items: shops ? shops : [], totalItemsCount: shops && shops.length ? shops.length : 0, activePage: page });
                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', page, this.props.location.search)
                    });
                } else {
                    this.setState({ items: [], totalItemsCount: 0, activePage: 1 });
                    this.props.history.replace({
                        pathname: this.props.location.pathname,
                        search: updateQueryStringParam('page', 1, this.props.location.search)
                    });
                }
            }
            else {
                const { fatalError} = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError
                    }
                });
            }
        });
    }

    onChangeSearchFor = (value) => {
        if(((value === "ads") && (this.state.searchFor !== "ads")) || ((value === "shops") && (this.state.searchFor !== "shops"))) {
            this.setState({
                searchFor: value
            })
            const { searchString } = this.props.searchResultFormValues;
            const { location, sortBy } = this.state;
            this.props.change("searchFor", value);
            this.props.change("category", "");
            this.props.change("for", "");
            this.props.change("condition", "");
            this.props.change("sortBy", sortBy);
            let urlSortBy = sortBy.toLowerCase().replace(/ /g,"-");

            if (value === "ads") {
                let search = updateQueryStringParam('for', '', this.props.location.search);
                search = updateQueryStringParam('searchFor', 'ads', search);
                search = updateQueryStringParam('condition', '', search);
                search = updateQueryStringParam('category', '', search);
                search = updateQueryStringParam('sortBy', urlSortBy, search);
                this.props.history.replace({
                    pathname: this.props.location.pathname,
                    search: search
                });
                this.fetchAds("", searchString, "", "", location, 1, sortBy);
            } else if (value === "shops") {
                let search = updateQueryStringParam('for', '', this.props.location.search);
                search = updateQueryStringParam('searchFor', 'shops', search);
                search = updateQueryStringParam('condition', '', search);
                search = updateQueryStringParam('category', '', search);
                search = updateQueryStringParam('sortBy', '', search);
                this.props.history.replace({
                    pathname: this.props.location.pathname,
                    search: search
                });
                this.fetchShops(searchString, "", location);
            }
        }
    }

    onChangeCategory = ({ target }) => {
        const { value } = target;
        const { searchString, condition, sortBy } = this.props.searchResultFormValues;
        const { location } = this.state;
        this.fetchAds(value, searchString, this.props.searchResultFormValues.for, condition, location, 1, sortBy);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('category', value, this.props.location.search)
        });
    }

    onChangeShopCategory = ({ target }) => {
        const { value } = target;
        const { searchString } = this.props.searchResultFormValues;
        const { location } = this.state;
        this.fetchShops(searchString, value, location);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('category', value, this.props.location.search)
        });
    }

    onChangeFor = ({ target }) => {
        const { value } = target;
        const { searchString, condition, category, sortBy } = this.props.searchResultFormValues;
        const { location } = this.state;
        this.fetchAds(category, searchString, value, condition, location, 1, sortBy);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('for', value, this.props.location.search)
        });
    }

    onChangeCondition = ({ target }) => {
        const { value } = target;
        const { searchString, category, sortBy } = this.props.searchResultFormValues;
        const { location } = this.state;
        this.fetchAds(category, searchString, this.props.searchResultFormValues.for, value, location, 1, sortBy);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('condition', value, this.props.location.search)
        });
    }

    onChangeSortBy = ({ target }) => {
        const { value } = target;
        this.props.change("sortBy", value);
        this.setState({
            sortBy: value
        })
        const { searchString, condition, category } = this.props.searchResultFormValues;
        const { location } = this.state;
        let urlSortBy = value.toLowerCase().replace(/ /g,"-");
        let search = updateQueryStringParam('sortBy', urlSortBy, this.props.location.search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });
        this.fetchAds(category, searchString, this.props.searchResultFormValues.for, condition, location, 1, value);
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
        const { searchFor, condition, category, sortBy } = this.props.searchResultFormValues;
        const { location } = this.state;
        if (searchFor === 'ads') {
            this.fetchAds(category, currentSearchString, this.props.searchResultFormValues.for, condition, location, 1, sortBy);
        }
        else if (searchFor === 'shops') {
            this.fetchShops(currentSearchString, category, location);
        }
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('searchString', currentSearchString, this.props.location.search)
        });
    }

    onCloseLeftPanel = () => {
        document.getElementById("left-panel").style.display = "none";
    }

    onOpenLeftPanel = () => {
        document.getElementById("left-panel").style.display = "inline-block";
    }

    removeSelectedLocation = () => {
        this.setState({
            center: {
                lat: this.state.defaultLocation.lat,
                lng: this.state.defaultLocation.lng
            },
            location: {
                lat: '',
                long: ''
            }
        });
        this.props.change('coordinate', '');
        this.setState({ mapVisible: false });
        const { searchFor, condition, searchString, category, sortBy } = this.props.searchResultFormValues;
        if (searchFor === 'ads') {
            this.fetchAds(category, searchString, this.props.searchResultFormValues.for, condition, { lat: '', long: '' }, 1, sortBy);
        }
        else if (searchFor === 'shops') {
            this.fetchShops(searchString, category, { lat: '', long: '' });
        }
        let search = updateQueryStringParam('long', '', this.props.location.search);
        search = updateQueryStringParam('lat', '', search);
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: search
        });
    }

    onPlacesChanged = (changedLocation) => {
        if(this.state.locationChanged) {
            const { address, coordinate } = changedLocation;
            const { lat, lng } = coordinate;
            this.setState({
                location: {
                    lat: lat,
                    long: lng
                }
            });
            this.props.change('coordinate', `${address}`);
            const { searchFor, condition, searchString, category, sortBy } = this.props.searchResultFormValues;
            if (searchFor === 'ads') {
                this.fetchAds(category, searchString, this.props.searchResultFormValues.for, condition, { lat: lat, long: lng }, 1, sortBy);
            }
            else if (searchFor === 'shops') {
                this.fetchShops(searchString, category, { lat: lat, long: lng });
            }
            let search = updateQueryStringParam('lat', coordinate.lat, this.props.location.search);
            search = updateQueryStringParam('long', coordinate.lng, search);
            this.props.history.replace({
                pathname: this.props.location.pathname,
                search: search
            });
        }
        else {
            this.setState({
                locationChanged: true
            })
        }
    }

    toggleMap = () => {
        if(!this.state.mapVisible && this.state.location.lat && this.state.location.long) {
            this.setState({
                center: {
                    lat: this.state.location.lat,
                    lng: this.state.location.long
                },
                locationChanged: false
            })
        }
        else {
            this.setState({
                locationChanged: true
            })
        }
        
        if (this.state.location.lat === "" || this.state.location.long === "") {
            this.setState({
                location: {
                    lat: this.state.defaultLocation.lat,
                    long: this.state.defaultLocation.lng
                }
            });
        }  
        this.setState({ mapVisible: !this.state.mapVisible });
    }

    renderItems = (currentItems) => {
        const { searchResultFormValues } = this.props;
        if (searchResultFormValues && searchResultFormValues.searchFor) {
            const { searchFor, category, searchString, condition } = searchResultFormValues;
            if (searchFor && searchFor === 'ads') {
                return currentItems.map((ad, index) => {
                    return <SingleAdBox
                        key={ad.adID}
                        ad={ad}
                        meta={{
                            category: category,
                            searchString: searchString,
                            forfor: searchResultFormValues.for,
                            filterCondition: condition
                        }}
                        detailLink={`/ad/${ad.adID}`}
                        showSimilarAds={true}
                        showDistance={true} />
                });
            } else if (searchFor && searchFor === 'shops') {
                return currentItems.map((shop, index) => {
                    return <SingleShopBox
                        key={shop.shopID}
                        shop={shop}
                        detailLink={`/shop/${shop.urlName}`}
                        adsLink={`/ads/shops/${shop.urlName}/ads`}
                        showDistance={true}
                    />
                });
            }
        } else {
            return '';
        }
    }

    createFilterMessage = () => {
        const { searchString } = this.state;
        const { searchResultFormValues } = this.props;
        let filterEndMessage = "";
        if(searchResultFormValues) {
            if(searchResultFormValues.searchFor === "ads") {
                filterEndMessage = "Ads";
            }
            else if(searchResultFormValues.searchFor === "shops") {
                filterEndMessage = "Shops";
            }

            if(searchResultFormValues.category) {
                filterEndMessage = filterEndMessage + ": " + searchResultFormValues.category;
            }

            if(searchResultFormValues.for) {
                filterEndMessage = filterEndMessage + ": " + searchResultFormValues.for;
            }

            if(searchResultFormValues.condition) {
                filterEndMessage = filterEndMessage + ": " + searchResultFormValues.condition;
            }

            if(searchString) {
                filterEndMessage = filterEndMessage + ": ";
            }
        }

        return filterEndMessage;
    }

    render() {
        const { extraProps, isFiltering, searchResultFormValues } = this.props;
        let { categories, shopCategories } = extraProps;
        const { items, activePage, itemsCountPerPage, totalItemsCount, mapVisible, center, gotLocation, searchString, searchFor } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentItems = items.slice(firstIndex, lastIndex);
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <section className="products-collections-area ptb-60">
                    <div className="items-container">
                        <div className="left-panel" id="left-panel">
                            <form>
                                <div className="filter-options-div">
                                    <div className="criteria-header">
                                        Criteria
                                    </div>
                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "ads" && <div className="filter-options category">
                                        <div className="label">Category</div>
                                        <div className="options">
                                            <Field name="category" component={renderSelect} onChange={(e) => this.onChangeCategory(e)}>
                                                <option value="">All</option>
                                                {categories && categories.map((category, index) => {
                                                    return <option key={index} value={category.categoryName}>{category.categoryName}</option>
                                                })}
                                            </Field>
                                        </div>
                                    </div>}
                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "shops" && <div className="filter-options category">
                                        <div className="label">Category</div>
                                        <div className="options">
                                            <Field name="category" component={renderSelect} onChange={(e) => this.onChangeShopCategory(e)}>
                                                <option value="">All</option>
                                                {shopCategories && shopCategories.map((category, index) => {
                                                    return <option key={index} value={category.categoryName}>{category.categoryName}</option>
                                                })}
                                            </Field>
                                        </div>
                                    </div>}
                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "ads" && <div className="filter-options for">
                                        <div className="label">For</div>
                                        <div className="options">
                                            <Field type="select" name="for" component={renderSelect} onChange={(e) => this.onChangeFor(e)}>
                                                <option value="">All</option>
                                                <option value="Sale">Sale</option>
                                                <option value="Rent">Rent</option>
                                            </Field>
                                        </div>
                                    </div>}
                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "ads" && searchResultFormValues.for !== "Rent" && <div className="filter-options condition">
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

                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "ads" && <div className="sort-header">
                                        Sort
                                    </div>}

                                    {searchResultFormValues && searchResultFormValues.searchFor && searchResultFormValues.searchFor === "ads" && <div className="filter-options sort-by">
                                        <div className="label">Sort by</div>
                                        <div className="options">
                                            <Field name="sortBy" component={renderSelect} onChange={(e) => this.onChangeSortBy(e)}>
                                                <option key="Best Match" value="Best Match">Best Match</option>
                                                <option key="Shops" value="Shops">Shops</option>
                                                <option key="Best Match and Distance" value="Best Match and Distance">Best Match and Distance</option>
                                                <option key="Shops and Distance" value="Shops and Distance">Shops and Distance</option>
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
                            <form>
                                <div className="search-near">
                                    <div className="search-near-label">Search near</div>
                                    <div className="location-area form-group">
                                        <div className="input-group mb-3">
                                            <Field type="text" name="coordinate" component="input" label="Search Near" placeholder="" className="form-control search-near" autoComplete="off" readOnly={true} onClick={() => this.toggleMap()} />
                                            <div className="input-group-append">
                                                {searchResultFormValues && searchResultFormValues.coordinate && searchResultFormValues.coordinate !== "" && <span className="input-group-text cursor-pointer btn btn-light remove-location" id="basic-addon2" onClick={() => this.removeSelectedLocation()}>
                                                    <i className="fa fa-times" title="Remove"></i>
                                                </span>}
                                                <span className="input-group-text cursor-pointer btn btn-light toggle-map" id="basic-addon2" onClick={() => this.toggleMap()}>
                                                    <i className="fa fa-map-marked-alt" title="Show/Hide Map"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            {mapVisible && this.state.center && <div>
                                <Map center={center} onPlacesChanged={this.onPlacesChanged} canMakeChanges={true} />
                            </div>}
                            <div className="ads-and-shops-div">
                                <div className={searchFor === "ads" ? "ads-active" : "ads"} onClick={() => this.onChangeSearchFor("ads")}>Ads</div>
                                <div className={searchFor === "shops" ? "shops-active" : "shops"} onClick={() => this.onChangeSearchFor("shops")}>Shops</div>
                            </div>
                            <div className="number-of-results">
                                <div className="result-count">
                                    <ListingInfo
                                        itemsCount={currentItems.length}
                                        firstIndex={firstIndex}
                                        totalItemsCount={totalItemsCount}
                                        isFetching={isFiltering || !gotLocation}
                                        message={'Filtering results...'}
                                        searchString={searchString}
                                        filterEndMessage={this.createFilterMessage()} />
                                </div>
                                <div className="filter-result-options-div">
                                    <div className="filter-result-options cursor-pointer" id="filter-result-options" onClick={() => {this.onOpenLeftPanel()}}><i className="fa fa-filter" aria-hidden="true"></i> Filter</div>
                                </div>
                                <div className="search-div">
                                    <form onSubmit={(e) => this.onSubmitSearchString(e)}>
                                        <input type="text" name="searchString" id="search-input" className="search-input" placeholder="Type something to search"  defaultValue={searchString ? searchString : null} onChange={(e) => this.onChangeSearchString(e)} />
                                        <button className="search-button" type="submit"><i className="fas fa-search"></i></button>
                                    </form>
                                </div>
                            </div>
                            {(isFiltering || !gotLocation) ? <React.Fragment><div className="row align-items-center">
                                    <div className="col d-flex justify-content-center">
                                        <Spinner isLoading={isFiltering || !gotLocation} /> &nbsp;Fetching...
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
                                            isFetching={isFiltering || !gotLocation}
                                            message={'Filtering results...'}
                                            searchString={searchString}
                                            filterEndMessage={this.createFilterMessage()} />
                                    </div> : ""}
                                </div>
                                {this.renderItems(currentItems)}
                                
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
            </React.Fragment >
        )
    }
}

SearchResult = reduxForm({
    form: 'search-result-form',
    initialValues: {
        searchFor: 'ads',
        for: '',
        condition: ''
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(SearchResult);

const mapStateToProps = (state) => {
    return {
        searchResultFormValues: getFormValues('search-result-form')(state),
        isFiltering: createLoadingSelector(['SEARCH_RESULT_ADS', 'SEARCH_RESULT_SHOPS'])(state),
        searchResults: state.searchResults,
        locationData: state.locationReducer
    };
}

export default connect(mapStateToProps, { searchResultAds, searchResultShops, fetchLocation })(SearchResult);