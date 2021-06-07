import React from 'react'
import { connect } from 'react-redux';

import Banner from '../components/ShopStyle/Banner';
import CategoryArea from '../components/ShopStyle/CategoryArea';
import FoodAndDrinks from '../components/ShopStyle/FoodAndDrinks';
import VisitShops from '../components/ShopStyle/VisitShops';
import { fetchHome } from '../store/actions/homeActions';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

export class Home extends React.Component {

    state = {
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.fetchHome().then(() => {
            const { status, errorMessage } = this.props.home.payload;
            if(status === 'failure') {
                const { fatalError } = errorMessage;
                this.setState({
                    errorMessage: {
                        fatalError: fatalError
                    }
                });
            }
        });
    }

    render() {
        const { fatalError } = this.state.errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection page="Home" errorMessage={fatalError} /> :
                <React.Fragment>
                    <div className="homepage-container">
                        <Banner />
                        <CategoryArea />
                        <FoodAndDrinks />
                        <VisitShops />
                    </div>
                </React.Fragment>}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        home: state.home
    };
}

export default connect(mapStateToProps, { fetchHome })(Home);