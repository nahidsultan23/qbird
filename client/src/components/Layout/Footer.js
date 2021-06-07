import React from 'react'
import { Link } from 'react-router-dom';

import logo from '../../img/logo.png';

const Footer = () => {
    return (
        <React.Fragment>
            <footer className="footer-area" id="footer-area">
                <div className="items-container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="single-footer-widget">
                                <div className="logo">
                                    <Link to={'/'}><img src={logo} loading="lazy" alt="logo" /></Link>
                                </div>
                                <p>Your one-stop site to get commodities from essential to luxury. Promising fast and secure delivery every time. Your satisfaction, our pride.</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="single-footer-widget footer-quick-links">
                                <h3>Quick Links</h3>

                                <ul className="quick-links">
                                    <li><Link to={'/about-us'}>About Us</Link></li>
                                    <li><Link to={'/contact-us'}>Contact Us</Link></li>
                                    <li><Link to={'/terms-&-conditions'}>Terms & Conditions</Link></li>
                                    <li><Link to={'/privacy-policy'}>Privacy Policy</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="single-footer-widget">
                                <h3>Contact Us</h3>

                                <ul className="footer-contact-info">
                                    <li><i className="fas fa-map-marker-alt"></i> Location: Apon Heights, House# 27/1/B (A-5), Road# 03, Shyamoli, Mirpur Road, Dhaka-1207, Bangladesh</li>
                                    <li><i className="far fa-envelope"></i> Email Us: info@qbird.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright-area">
                    <div className="items-container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 col-md-6">
                                <p>Copyright @2020-{new Date().getFullYear()} Qbird Ltd. All Rights Reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <div className="go-top"><i className="fas fa-arrow-up"></i><i className="fas fa-arrow-up"></i></div>
        </React.Fragment>
    );
}
export default Footer;