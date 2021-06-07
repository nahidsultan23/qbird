import React, { Component } from 'react';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { checkAuthAdmin } from '../store/actions/authActions';
import { imposeNewChanges } from '../store/actions/imposeActions';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import NoContentFound from '../components/Common/NoContentFound';

class ImposeChanges extends Component {

    state = {
        permissions: {},
        errorMessage: {
            fatalError: null,
            authError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.checkAuthAdmin().then(() => {
            const { permissions, errorMessage } = this.props.auth.payload;
            const { fatalError, authError } = errorMessage;
            this.setState({
                permissions: permissions,
                errorMessage: {
                    fatalError: fatalError,
                    authError: authError
                }
            });
        });
    }

    onCloseModal = () => {
        this.setState({
            showErrorModal: false
        })
    }

    onSubmit = () => {
        this.props.imposeNewChanges().then(() => {
            const { status, errorMessage } = this.props.imposeReducer.payload;
            if(status !== 'success') {
                const { fatalError, authError, permissionError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : permissionError;
                this.setState({
                    showErrorModal: true,
                    modalMessage: message
                })
            }
        });
    }

    render() {
        const { changeAccountNumber } = this.state.permissions;
        const { isFetchingAdminData, isImposingNewChanges } = this.props;
        const { errorMessage } = this.state;
        const { fatalError, authError, permissionError } = errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : permissionError ? <ErrorDetailSection title={"Permission Error"} errorMessage={permissionError} /> :
                    isFetchingAdminData ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingAdminData} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> : changeAccountNumber ? <section className="about-area ptb-60">
                    <div className="items-container">
                        <button className="btn btn-primary" onClick={this.onSubmit}>{isImposingNewChanges ? <Spinner isLoading={isImposingNewChanges} /> : ""} Impose new changes</button>
                    </div>
                    <Modal
                        title="Error"
                        visible={this.state.showErrorModal}
                        onClose={this.onCloseModal}
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
                                    onClick={this.onCloseModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.modalMessage}</b>
                    </Modal>
                </section>: <NoContentFound />}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        isFetchingAdminData: createLoadingSelector(['CHECK_AUTH_ADMIN'])(state),
        auth: state.auth,
        imposeReducer: state.imposeReducer,
        isImposingNewChanges: createLoadingSelector(['IMPOSE_NEW_CHANGES'])(state)
    };
}

export default connect(mapStateToProps, { checkAuthAdmin, imposeNewChanges })(ImposeChanges);