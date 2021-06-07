import React from 'react'
import { connect } from 'react-redux'

import { setActiveTab } from '../../store/actions/authActions';

const AccountTab = (WrappedComponent, tabName) => {
    class HOC extends React.Component {

        componentDidMount() {
            this.props.setActiveTab(tabName);
        }
        render() {
            return <WrappedComponent {...this.props}  {...this.state} />
        }
    }
    return connect(null, { setActiveTab })(HOC);
}

export default AccountTab;
