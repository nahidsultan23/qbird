import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { bucketUrl } from '../../constants/urls/bucket';

class VisitShops extends Component {

    state = {
        display: false
    };

    componentDidMount() {
        this.setState({ display: true })
    }

    render() {
        return (
            <section className="products-collections-area pb-60">
                <div className="items-container">
                    <div className="homepage-slider-area-container">
                        <div className="homepage-portion-heading">
                            Visit Shops
                        </div>
                        <div className="latest-container">
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=chillox">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Chillox.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Chillox
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=comic-cafe">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Comic-Cafe.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Comic Cafe
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=game-on-sports-cafe">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Game-on-Sports-Cafe.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Game on Sports Cafe
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=shakibs75">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Shakibs75.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Shakib's75
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=olympia-palace">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Olympia-Palace.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Olympia Palace
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=the-dark-music-cafe-restaurant">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/The-Dark-Music-Cafe-&-Restaurant.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            The Dark Music Cafe & Restaurant
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=zero-1s-cafe">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Zero-1s-Cafe.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Zero 1's Cafe
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=olivia-restaurant">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Olivia-Restaurant.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Olivia Restaurant
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=fatty-bun">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Fatty-Bun.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Fatty Bun
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=cafe-majlish">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Cafe-Majlish.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Cafe Majlish
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=new-treat-cafe-restaurant">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/New-Treat-Cafe-&-Restaurant.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            New Treat Cafe & Restaurant
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=cafe-dhanmondi">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Cafe-Dhanmondi.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Cafe Dhanmondi
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=levis-store-bangladesh">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Levis-Store-Bangladesh.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Levi's Store Bangladesh
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=the-shop-today">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/The-Shop-Today.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            The Shop Today
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=kebab-fusion">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Kebab-Fusion.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Kebab Fusion
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=omg">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/OMG.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            OMG
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=burger-mania-mirpur">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Burger-Mania-Mirpur.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Burger Mania Mirpur
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=cafe-d-amore">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Cafe-DAmore.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Cafe D'Amore
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=smokin-patty">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/Smokin-Patty.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Smokin' Patty
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result-of-shop?shopID=bbq-chicken-dhanmondi-branch">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/visit-shops/bbq.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            bb.q Chicken
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        );
    }
}

export default VisitShops;