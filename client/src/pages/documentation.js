import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import DocumentationList from './documentationList';
import Error from './error';
import ReduceShippingCharges from './reduce-shipping-charges';

class Documentation extends Component {

    state = {
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
    }

    render() {
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> :
                <Switch>
                    <Route path='/documentation/how-to-reduce-shipping-charges' component={ReduceShippingCharges} />
                    <Route path='/documentation' exact component={DocumentationList} />
                    <Route path='/documentation/*' component={Error} />
                </Switch>}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps, { general })(Documentation);