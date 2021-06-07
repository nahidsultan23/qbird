import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

class AuthorizedRoute extends React.Component {
    render() {
        const { component, auth, ...rest } = this.props;
        const Component = component;
        const { notAuthenticated } = auth;
        return (
            <Route
                {...rest}
                render={props => {
                    if(notAuthenticated) {
                        return <Redirect to={{ pathname: '/log-in', state: { from: props.location } }} />
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

export default connect(mapStateToProps)(AuthorizedRoute);
