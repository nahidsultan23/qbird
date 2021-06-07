import React from 'react'
import Moment from 'react-moment';
import { connect } from 'react-redux';
import 'rc-dialog/assets/index.css';
import Pagination from "react-js-pagination";
import queryString from 'query-string';

import { authCheckDeliveries } from '../store/actions/deliveryActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import history from '../history';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

import { twoDecimalPoints, thousandSeparators } from '../services/common';

class DeliveriesComp extends React.Component {

    state = {
        fatalError: '',
        authError: '',
        deliveries: [],
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
        this.props.authCheckDeliveries().then(() => {
            const { status, errorMessage } = this.props.deliveriesData.payload;
            
            if(status === 'success') {
                const { deliveries } = this.props.deliveriesData.payload;
                this.setState({ deliveries: deliveries, totalItemsCount: deliveries.length });
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

    onRowClick = (deliveryID) => {
        history.push(`/account/deliveries/details/${deliveryID}`)
    }

    renderDeliveryList = (deliveries) => {
        return deliveries.map(({ currentState, createdOn, deliveryID, price }) => {
            return (<React.Fragment key={deliveryID}>
                <tr>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(deliveryID)}>
                        <b>State:</b> {currentState.state}
                        <br />
                        <b>Order Date:</b> <Moment format="MMM DD, YYYY, hh:mm:ss a">{createdOn}</Moment>
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(deliveryID)}>
                        {deliveryID}
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(deliveryID)}>
                        ৳{thousandSeparators(twoDecimalPoints(price))}
                    </td>
                </tr>
            </React.Fragment>
            )
        })
    }

    render() {
        const { isFetchingDeliveries } = this.props;
        const { deliveries, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentDeliveries = deliveries.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="cart-area">
                    <div className="container">
                        <div className="row">
                            {(deliveries && deliveries.length === 0 && !isFetchingDeliveries) ?
                                <div className="col-lg-12 col-md-12">
                                    <p>Looks like you do not have any Delivery record.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12">
                                    {isFetchingDeliveries ? <div className="row align-items-center">
                                        <div className="col d-flex justify-content-center">
                                            <ListingInfo
                                                itemsCount={currentDeliveries.length}
                                                firstIndex={firstIndex}
                                                totalItemsCount={totalItemsCount}
                                                isFetching={isFetchingDeliveries} />
                                        </div>
                                    </div> :
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Delivery Details</th>
                                                        <th scope="col">Delivery ID</th>
                                                        <th scope="col">Price</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {deliveries && this.renderDeliveryList(currentDeliveries)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </form>}

                                    
                                    {!isFetchingDeliveries && currentDeliveries.length > 0 ? <nav className="pagination-area">
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
        isFetchingDeliveries: createLoadingSelector(['AUTH_CHECK_DELIVERIES'])(state),
        deliveriesData: state.deliveryReducer
    }
}
const Deliveries = AccountTab(DeliveriesComp, "deliveries");
export default connect(mapStateToProps, { authCheckDeliveries })(Deliveries);