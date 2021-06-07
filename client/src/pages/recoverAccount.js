import React, { Component } from 'react';
import { connect } from 'react-redux';

import SendOTP from '../components/AccountRecovery/SendOTP';
import VerifyOTP from '../components/AccountRecovery/VerifyOTP';
import ChangePassword from '../components/AccountRecovery/ChangePassword';
import { general } from '../store/actions/authActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class RecoverAccount extends Component {

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
        const recoverPasswordPage = (this.props.auth.payload && this.props.auth.payload.recoverPasswordPage) ? this.props.auth.payload.recoverPasswordPage : 1;
        const { from } = this.state;
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <React.Fragment>
                    {recoverPasswordPage === 1 && <SendOTP onSubmit={this.submit} from={from} history={this.props.history} />}
                    {recoverPasswordPage === 2 && <VerifyOTP onSubmit={this.submit} from={from} history={this.props.history} />}
                    {recoverPasswordPage === 3 && <ChangePassword onSubmit={this.submit} from={from} history={this.props.history} />}
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
export default connect(mapStateToProps, { general })(RecoverAccount);

