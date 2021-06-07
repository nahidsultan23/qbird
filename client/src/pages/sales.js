import React from 'react'
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'rc-dialog/assets/index.css';
import Pagination from "react-js-pagination";
import queryString from 'query-string';

import { authCheckSales } from '../store/actions/saleActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import history from '../history';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

import { twoDecimalPoints, thousandSeparators } from '../services/common';

class SalesComp extends React.Component {

    state = {
        fatalError: '',
        authError: '',
        sales: [],
        activePage: 1,
        itemsCountPerPage: 20,
        totalItemsCount: 0,
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        const values = queryString.parse(this.props.location.search);
        const { page } = values;
        const activePage = (page && Number.isInteger(Number(page)) && Number(page)>1) ? Number(page) : 1;
        this.setState({ activePage: activePage });
        this.props.authCheckSales().then(() => {
            const { status, errorMessage } = this.props.salesData.payload;
            
            if(status === 'success') {
                const { sales } = this.props.salesData.payload;
                this.setState({ sales: sales, totalItemsCount: sales.length });
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
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: updateQueryStringParam('page', activePage, this.props.location.search)
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

    onRowClick = (saleID) => {
        history.push(`/account/sales/details/${saleID}`)
    }

    renderSaleList = (sales) => {
        return sales.map(({ saleID, currentState, createdOn, price }) => {
            return (<React.Fragment key={saleID}>
                <tr>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(saleID)}>
                        <b>State:</b> {currentState.state}
                        <br />
                        <b>Order Date:</b> <Moment format="MMM DD, YYYY, hh:mm:ss a">{createdOn}</Moment>
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(saleID)}>
                        {saleID}
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(saleID)}>
                        ৳{thousandSeparators(twoDecimalPoints(price))}
                    </td>
                </tr>
            </React.Fragment>
            )
        })
    }

    render() {
        const { isFetchingSales } = this.props;
        const { sales, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentSales = sales.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="cart-area">
                    <div className="container">
                        <div className="row">
                            {(sales && sales.length === 0 && !isFetchingSales) ?
                                <div className="col-lg-12 col-md-12">
                                    <p>Looks like you do not have any Sale. <Link className="display-inline" to={'/account/ads/shops/create-shop'}>Click here</Link> to create a Shop and start selling.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12">
                                    {isFetchingSales ? <div className="row align-items-center">
                                        <div className="col d-flex justify-content-center">
                                            <ListingInfo
                                                itemsCount={currentSales.length}
                                                firstIndex={firstIndex}
                                                totalItemsCount={totalItemsCount}
                                                isFetching={isFetchingSales} />
                                        </div>
                                    </div> :
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Sale Details</th>
                                                        <th scope="col">Sale ID</th>
                                                        <th scope="col">Price</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {sales && this.renderSaleList(currentSales)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </form>}

                                    
                                    {!isFetchingSales && currentSales.length > 0 ? <nav className="pagination-area">
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
                                </div>}
                        </div>
                    </div>
                    <div className="bottom-gap"></div>
                </section>}
                <div className="bottom-gap"></div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingSales: createLoadingSelector(['AUTH_CHECK_SALES'])(state),
        salesData: state.saleReducer
    }
}
const Sales = AccountTab(SalesComp, "sales");
export default connect(mapStateToProps, { authCheckSales })(Sales);