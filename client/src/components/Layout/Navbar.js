import React from 'react'

import Menu from '../Layout/Menu';

class Navbar extends React.Component {

    render() {
        const { categories } = this.props;
        return (
            <React.Fragment >
                <Menu categories={categories} />
            </React.Fragment >
        );
    }
}

export default Navbar;