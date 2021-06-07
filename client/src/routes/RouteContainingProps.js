import React from 'react'
import { Route } from 'react-router-dom'

export const RouteContainingProps = ({ component: Component, extraProps, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props => {
                return <Component
                    {...props} extraProps={extraProps} />
            }}
        />
    );
};