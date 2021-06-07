import React, { Component } from 'react';
import { connect } from 'react-redux';

import CreateAccount from '../components/Register/CreateAccount';
import AccountConfirmation from '../components/Register/AccountConfirmation';
import { general } from '../store/actions/authActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class Signup extends Component {

    state = {
        from: '/',
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.general().then(() => {
            const { fatalError } = this.props.auth.payload.errorMessage;
            this.setState({
                errorMessage: {
                    fatalError: fatalError
                }
            });
        });
        
        const { state } = this.props.location;
        if (state && state.from) {
            this.setState({ from: state.from });
        }
    }

    render() {
        const registrationPage = (this.props.auth.payload && this.props.auth.payload.registrationPage) ? this.props.auth.payload.registrationPage : 1;
        const { from } = this.state;
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <React.Fragment>
                    {registrationPage === 1 && <CreateAccount from={from} history={this.props.history} />}
                    {registrationPage === 2 && <AccountConfirmation from={from} history={this.props.history} />}
                </React.Fragment>}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
}
export default connect(mapStateToProps, { general })(Signup);
