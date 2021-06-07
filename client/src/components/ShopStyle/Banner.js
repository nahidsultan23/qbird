import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel2';
import { connect } from 'react-redux';
import { bucketUrl } from '../../constants/urls/bucket';

const options = {
    loop: true,
    nav: true,
    dots: false,
    autoplayHoverPause: true,
    items: 1,
    smartSpeed: 750,
    autoplay: true,
    navText: [
        "<i class='fas fa-arrow-left'></i>",
        "<i class='fas fa-arrow-right'></i>"
    ],
    lazyLoad: true
}

class Banner extends Component {
    state = {
        display: false,
        panel: true,
    };

    componentDidMount() {
        this.setState({ display: true })
    }

    renderPhoto = (index) => {
        const { data } = this.props;
        if(data[index]) {
            return `url(${bucketUrl}photos/homePhotos/${data[index].photo.replace("#","%23")})`
        }
    }

    render() {
        const { data } = this.props;
        return (
            <React.Fragment>
                {this.state.display ? <OwlCarousel
                    className="home-slides owl-carousel owl-theme"
                    options={options}
                >
                    <Link to={(data && data[0]) ? `/search-result-of-shop?shopID=${data[0].urlName}` : ""}>
                        <div className="main-banner" key={0} style={{ backgroundImage: this.renderPhoto(0), lazyLoad: true }}>
                        </div>
                    </Link>
                    <Link to={(data && data[1]) ? `/search-result-of-shop?shopID=${data[1].urlName}` : ""}>
                        <div className="main-banner" key={1} style={{ backgroundImage: this.renderPhoto(1), lazyLoad: true }}>
                        </div>
                    </Link>
                    <Link to={(data && data[2]) ? `/search-result-of-shop?shopID=${data[2].urlName}` : ""}>
                        <div className="main-banner" key={2} style={{ backgroundImage: this.renderPhoto(2), lazyLoad: true }}>
                        </div>
                    </Link>
                    <Link to={(data && data[3]) ? `/search-result-of-shop?shopID=${data[3].urlName}` : ""}>
                        <div className="main-banner" key={3} style={{ backgroundImage: this.renderPhoto(3), lazyLoad: true }}>
                        </div>
                    </Link>
                    <Link to={(data && data[4]) ? `/search-result-of-shop?shopID=${data[4].urlName}` : ""}>
                        <div className="main-banner" key={4} style={{ backgroundImage: this.renderPhoto(4), lazyLoad: true }}>
                        </div>
                    </Link>
                </OwlCarousel> : ''}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.home.payload.topSlider
    }
}

export default connect(mapStateToProps)(Banner);
