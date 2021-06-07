import React from 'react'
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import 'rc-dialog/assets/index.css';
import Pagination from "react-js-pagination";
import queryString from 'query-string';
import Modal from 'rc-dialog';

import { authCheckOrders, cancelOrder, completeOrder } from '../store/actions/orderActions';
import Spinner from '../components/Common/Spinner';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import history from '../history';
import CancelOrder from '../components/Order/CancelOrder';
import AccountTab from '../components/HOC/AccountTab';
import ListingInfo from '../components/Common/ListingInfo';
import { updateQueryStringParam } from '../services/common';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

import { twoDecimalPoints, thousandSeparators } from '../services/common';

class OrdersComp extends React.Component {

    state = {
        cancelOrderId: null,
        cancelModalError: {},
        completeModalError: {},
        visible: false,
        orders: [],
        activePage: 1,
        itemsCountPerPage: 20,
        totalItemsCount: 0,
        showVerifyDeliveryModal: false,
        verifyOrderId: null,
        showErrorModal: false,
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
        this.props.authCheckOrders().then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
                const { orders } = this.props.orderData.payload;
                this.setState({ orders: orders, totalItemsCount: orders.length });
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

    onCancelOrder = (formValues) => {
        const { cancelOrderId } = this.state;
        const { reason } = formValues;
        this.props.cancelOrder({ orderID: cancelOrderId, reason: reason }).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
                let index = this.state.orders.findIndex(o => o.orderID === this.state.cancelOrderId);
                if (index > -1) {
                    let newObj = this.state.orders[index];
                    newObj.currentState.state = "Order Canceled";
                    this.state.orders.splice(index, 1, newObj)
                    this.setState({ orders: this.state.orders });
                }
                this.setState({ visible: false, cancelOrderId: null });
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    cancelModalError: {
                        errorMessage: message
                    }
                })
            }
        })
    }

    onClose = () => {
        this.setState({ visible: false, cancelOrderId: null });
    }

    onShow = (orderID) => {
        this.setState({ visible: true, cancelOrderId: orderID });
    }

    onVerifyDelivery = (orderID) => {
        this.setState({ showVerifyDeliveryModal: true, verifyOrderId: orderID });
    }

    onCloseVerifyModal = () => {
        this.setState({ showVerifyDeliveryModal: false, verifyOrderId: null });
    }

    verifyOrder = () => {
        const { verifyOrderId } = this.state;
        this.props.completeOrder({ orderID: verifyOrderId }).then(() => {
            const { status, errorMessage } = this.props.orderData.payload;
            if(status === 'success') {
               history.push(`/account/orders/details/${verifyOrderId}`);
            }
            else {
                const { fatalError, authError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : "";
                this.setState({
                    showErrorModal: true,
                    showVerifyDeliveryModal: false,
                    verifyOrderId: null,
                    completeModalError: {
                        errorMessage: message
                    }
                })
            }
        })
    }

    onCloseErrorModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    onRowClick = (orderID) => {
        history.push(`/account/orders/details/${orderID}`)
    }

    renderOrderList = (orders) => {
        return orders.map(({ currentState, createdOn, orderID, netPayable }) => {
            return (<React.Fragment key={orderID}>
                <tr>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(orderID)}>
                        <b>State:</b> {currentState.state}
                        <br />
                        <b>Order Date:</b> <Moment format="MMM DD, YYYY, hh:mm:ss a">{createdOn}</Moment>
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(orderID)}>
                        {orderID}
                    </td>
                    <td className="cursor-pointer" onClick={() => this.onRowClick(orderID)}>
                        ৳{thousandSeparators(twoDecimalPoints(netPayable))}
                    </td>
                    <td>
                        {currentState.state === "Order Placed" ? <button title="Cancel Order" type="button" className="btn btn-danger btn-sm" onClick={() => this.onShow(orderID)}>Cancel</button> : ''}
                        {currentState.state === "Waiting for User Response" && <button title="Verify Delivery" type="button" className="btn complete-order-button" onClick={() => this.onVerifyDelivery(orderID)}>Verify Delivery</button>}
                    </td>

                </tr>
            </React.Fragment>
            )
        })
    }

    render() {
        const { isFetchingOrders, isCompletingOrder } = this.props;
        const { orders, activePage, itemsCountPerPage, totalItemsCount } = this.state;
        const lastIndex = activePage * itemsCountPerPage;
        const firstIndex = lastIndex - itemsCountPerPage;
        const currentOrders = orders.slice(firstIndex, lastIndex);
        const { fatalError, authError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> :
                <section className="cart-area">
                    <div className="container">
                        <div className="row">
                            {(orders && orders.length === 0 && !isFetchingOrders) ?
                                <div className="col-lg-12 col-md-12">
                                    <p>Looks like you do not have any Order. <Link className="display-inline" to={'/'}>Click here</Link> to continue shopping.</p>
                                </div>
                                : <div className="col-lg-12 col-md-12">
                                    {isFetchingOrders ? <div className="row align-items-center">
                                        <div className="col d-flex justify-content-center">
                                            <ListingInfo
                                                itemsCount={currentOrders.length}
                                                firstIndex={firstIndex}
                                                totalItemsCount={totalItemsCount}
                                                isFetching={isFetchingOrders} />
                                        </div>
                                    </div> :
                                    <form>
                                        <div className="cart-table table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Order Details</th>
                                                        <th scope="col">Order ID</th>
                                                        <th scope="col">Price</th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {orders && this.renderOrderList(currentOrders)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </form>}

                                    
                                    {!isFetchingOrders && currentOrders.length > 0 ? <nav className="pagination-area">
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
                    {this.state.visible === true ? <CancelOrder onCancelOrder={this.onCancelOrder} onClose={this.onClose} errorMessage={this.state.cancelModalError.errorMessage} /> : ''}
                </section>}
                <Modal
                    title="Confirmation"
                    visible={this.state.showVerifyDeliveryModal}
                    onOk={this.verifyOrder}
                    onClose={this.onCloseVerifyModal}
                    closable={true}
                    animation="slide-fade"
                    maskAnimation="fade"
                    footer={
                        [
                            <button
                                type="button"
                                className="btn btn-light"
                                key="close"
                                onClick={this.onCloseVerifyModal}
                            >
                                Cancel
                            </button>,
                            <button
                                type="button"
                                className="btn complete-order-button modal-remove-button"
                                key="save"
                                onClick={this.verifyOrder}
                            >
                                <Spinner isLoading={isCompletingOrder} /> &nbsp;Confirm
                            </button>,
                        ]
                    }
                >
                    Are you sure you want to mark this Order as "Complete"? Confirm only if you have recieved the delivery successfully.
                </Modal>
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
                    {this.state.completeModalError.errorMessage}
                </Modal>
                <div className="bottom-gap"></div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetchingOrders: createLoadingSelector(['AUTH_CHECK_ORDERS'])(state),
        isCancellingOrder: createLoadingSelector(['CANCEL_ORDER'])(state),
        isCompletingOrder: createLoadingSelector(['COMPLETE_ORDER'])(state),
        orderData: state.orderReducer
    }
}
const Orders = AccountTab(OrdersComp, "orders");
export default connect(mapStateToProps, { authCheckOrders, cancelOrder, completeOrder })(Orders);