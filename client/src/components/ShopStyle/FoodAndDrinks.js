import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { bucketUrl } from '../../constants/urls/bucket';

class FoodAndDrinks extends Component {

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
                            Food and Drinks
                        </div>
                        <div className="latest-container">
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Burger">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Burger.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Burger
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Pizza">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Pizza.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Pizza
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Pasta">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Pasta.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Pasta
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Salad">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Salad.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Salad
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=French%20Fry">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/French-Fry.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            French Fry
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Set%20Menu">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Set-Menu.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Set Menu
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Platter">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Platter.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Platter
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Biriyani">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Biriyani.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Biriyani
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Chow%20Mein">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Chow-Mein.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Chow Mein
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Prawn">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Prawn.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Prawn
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Soup">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Soup.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Soup
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div className="food-and-drinks-portion">
                                <Link to="/search-result?searchFor=ads&sortBy=best-match-and-distance&category=Food%20and%20Drinks&searchString=Bengali">
                                    <div className="food-and-drinks-element">
                                        <div className="photo">
                                            <img src={`${bucketUrl}photos/homePhotos/food-and-drinks/Bengali.jpg`} loading="lazy" alt="" />
                                        </div>
                                        <div className="name">
                                            Bengali
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

export default FoodAndDrinks;