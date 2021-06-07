import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Link } from 'react-router-dom';

import Spinner from '../components/Common/Spinner';
import { login, general } from '../store/actions/authActions';
import renderInput from '../constants/forms/renderInput';
import renderSelect from '../constants/forms/renderSelect';
import renderInputGroup from '../constants/forms/renderInputGroup';
import { required, minLength10, minLength6, maxLength200, maxLength11 } from '../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import renderServerErrors from '../constants/forms/renderServerErrors';
import { numbers } from '../constants/forms/fieldNormalization';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class Login extends React.Component {

    _isMounted = false;

    state = {
        fatalErrorForm: null,
        from: '/',
        showPassword: false,
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    submit = (formvalues) => {
        return this.props.login(formvalues, this.state.from).then(() => {
            const { fatalError, alreadyLoggedIn } = this.props.auth.payload.errorMessage;
            if(this._isMounted) {
                if(alreadyLoggedIn) {
                    this.setState({
                        errorMessage: {
                            fatalError: "You are already logged in to an account. Refresh the page to access the current account"
                        }
                    });
                }
                else if(fatalError) {
                    this.setState({ fatalErrorForm: fatalError });
                }
                else {
                    this.setState({ fatalErrorForm: null });
                    renderServerErrors(this.props.auth.payload);
                }
            }
        });
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

        this._isMounted = true;
        const { state } = this.props.location;
        if (state && state.from) {
            const { from } = state;
            const { pathname, search } = from;
            let url = pathname;
            if(search) {
                url = url + search;
            }
            this.setState({ from: url });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    togglePasswordView = () => {
        let state = this.state.showPassword;
        this.setState({
            showPassword: !state
        })
    }

    render() {
        const { handleSubmit, pristine, submitting, isFetching } = this.props;
        const { fatalError } = this.state.errorMessage;
        const { fatalErrorForm, showPassword } = this.state;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <section className="login-area ptb-60">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="login-content">
                                    <div className="section-title">
                                        <h2><span className="dot"></span> Login</h2>
                                    </div>
                                    <form className="login-form" onSubmit={handleSubmit(this.submit)}>
                                        <Field type="select" name="countryCode" component={renderSelect} label="Country Code" validate={required} value={'Bangladesh (+880)'}>
                                            <option key={'Bangladesh (+880)'} value="Bangladesh (+880)">Bangladesh (+880)</option>
                                        </Field>
                                        <Field type="text" name="phoneNumber" component={renderInput} placeholder="Enter Phone Number" label="Phone Number"
                                            validate={[required, minLength10, maxLength11]} normalize={numbers} maxLength="11" />
                                        <Field type={showPassword ? "text" : "password"} name="password" component={renderInputGroup} placeholder="Enter Password" label="Password" validate={[required, minLength6, maxLength200]} maxLength="255"  groupText={<span className="show-hide-password" onClick={this.togglePasswordView}>{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}</span>} />
                                        <button type="submit" className="btn btn-primary" disabled={submitting || pristine}>
                                            <Spinner isLoading={isFetching} /> &nbsp;Log In
                                        </button>
                                        <div className="text-danger-div">
                                            {(fatalErrorForm) && !submitting && <span className="text-danger">{fatalErrorForm}</span>}
                                        </div>
                                    </form>
                                    <Link to={{ pathname: `/recover-password`, state: { from: this.state.from } }} className="auth-return-to">
                                        Lost your password?
                                    </Link>
                                </div>
                            </div>

                            <div className="col-lg-6 col-md-12">
                                <div className="new-customer-content">
                                    <div className="section-title">
                                        <h2><span className="dot"></span> New Customer</h2>
                                    </div>

                                    <span>Create an Account</span>
                                    <p>Register for a free account on our website. Registration is quick and easy. It allows you to be able to add items to your Cart and Wishlist and also allows you to order from our numerous items.</p>
                                    <Link to={{ pathname: `/register`, state: { from: this.state.from } }} className="btn btn-light">Create an Account
                                        </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        );
    }
}

Login = reduxForm({
    form: 'loginForm',
    initialValues: {
        countryCode: 'Bangladesh (+880)'
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(Login);


const mapStateToProps = (state) => {
    return {
        isFetching: createLoadingSelector(['LOGIN'])(state),
        auth: state.auth
    };
}

export default connect(mapStateToProps, { login, general })(Login);
