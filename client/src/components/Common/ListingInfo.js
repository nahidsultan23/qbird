import React from 'react'
import Spinner from './Spinner';

class ListingInfo extends React.Component {

    state = {
        itemsCount: 0,
        firstIndex: 0,
        totalItemsCount: 0,
        isFetching: false,
        message: 'Fetching...'
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            itemsCount: nextProps.itemsCount,
            firstIndex: nextProps.firstIndex,
            totalItemsCount: nextProps.totalItemsCount,
            isFetching: nextProps.isFetching,
            message: nextProps.message !== null && nextProps.message !== undefined && nextProps.message !== "" ? nextProps.message : this.state.message,
            searchString: nextProps.searchString,
            filterEndMessage: nextProps.filterEndMessage
        });
    }


    componentDidMount() {
        this.setState({
            itemsCount: this.props.itemsCount,
            firstIndex: this.props.firstIndex,
            totalItemsCount: this.props.totalItemsCount,
            isFetching: this.props.isFetching,
            message: this.props.message !== null && this.props.message !== undefined && this.props.message !== "" ? this.props.message : this.state.message,
            searchString: this.props.searchString,
            filterEndMessage: this.props.filterEndMessage
        });
    }

    renderDetail = () => {
        const { itemsCount, firstIndex, totalItemsCount, isFetching, message, searchString, filterEndMessage } = this.state;
        if (isFetching === true)
            return (<React.Fragment><Spinner isLoading={isFetching} /> &nbsp;{message}</React.Fragment>);
        else if (totalItemsCount > 0) {
            if(totalItemsCount === 1) {
                return (<React.Fragment>Showing 1 of 1 result{(filterEndMessage || searchString) ? <span> for <b>{filterEndMessage}{searchString ? <span className="search-string-number-of-results">"{searchString}"</span> : null}</b></span> : null}</React.Fragment>);
            }
            else if((totalItemsCount > 1) && (itemsCount === 1)) {
                return (<React.Fragment>Showing {firstIndex + 1} of {totalItemsCount} results{(filterEndMessage || searchString) ? <span> for <b>{filterEndMessage}{searchString ? <span className="search-string-number-of-results">"{searchString}"</span> : null}</b></span> : null}</React.Fragment>);
            }
            else {
                return (<React.Fragment>Showing {firstIndex + 1} to {firstIndex + itemsCount} of {totalItemsCount} results{(filterEndMessage || searchString) ? <span> for <b>{filterEndMessage}{searchString ? <span className="search-string-number-of-results">"{searchString}"</span> : null}</b></span> : null}</React.Fragment>);
            }
        } else {
            return (<React.Fragment>No result to show{(filterEndMessage || searchString) ? <span> for <b>{filterEndMessage}{searchString ? <span className="search-string-number-of-results">"{searchString}"</span> : null}</b></span> : null}</React.Fragment>);
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.renderDetail()}
            </React.Fragment>)
    }

}
export default ListingInfo;