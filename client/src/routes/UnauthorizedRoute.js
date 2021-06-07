import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

class UnauthorizedRoute extends React.Component {
    render() {
        const { component, auth, ...rest } = this.props;
        const Component = component;
        const { isAuthenticated } = auth;
        return (
            <Route
                {...rest}
                render={props => {
                    if(isAuthenticated) {
                        let url = '/';
                        if(props.location.state && props.location.state.from && props.location.state.from.pathname) {
                            url = props.location.state.from.pathname;
                            if(props.location.state.from.search) {
                                url = url + props.location.state.from.search;
                            }
                        }
                        return <Redirect to={{ pathname: url }} />
                    } else {
                        return <Component
                            {...props} />
                    }
                }}
            />
        );
    }
};

const mapStateToProps = (state) => {
    return { auth: state.auth };
}

export default connect(mapStateToProps)(UnauthorizedRoute);