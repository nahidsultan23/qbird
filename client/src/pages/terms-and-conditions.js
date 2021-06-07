import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { general } from '../store/actions/authActions';
import { connect } from 'react-redux';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';

class TermsAndConditions extends Component {

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
                <section className="about-area ptb-60">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-12 col-md-12">
                                <div className="about-content">
                                    <h2>Terms & Conditions</h2>

                                    <h6 style={{fontWeight: "bold"}}>Last updated: September 16, 2020</h6>
                                    <p>Welcome to Qbird. Qbird provides app and website features subject to the following conditions.
                                        By using Qbird services, you agree to these conditions. Please read them carefully.
                                        We offer various Qbird services and sometimes additional terms may apply. When you use an Qbird Service, you also will be subject to the guidelines, terms and agreements applicable to that Qbird Service. If these Terms & Conditions are inconsistent with the Service Terms, those Service Terms will control.
                                    </p>

                                    <h4>Privacy</h4>
                                    <p>Please review our <Link to="/privacy-policy" className="display-inline">Privacy Policy</Link>, which also governs your use of Qbird Services, to understand our practices.</p>

                                    <h4>Electronic Communications</h4>
                                    <p>When you use Qbird Services, or send e-mails, text messages and other communications from your desktop or mobile device to us, you may be communicating with us electronically. You consent to receive communications from us electronically, such as e-mails, texts, mobile push notices, or notices and messages on this site or through the other Qbird Services, such as our Message Center and you can retain copies of these communications for your records. You agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing.</p>

                                    <h4>Copyright</h4>
                                    <p>All contents included in or made available through any Qbird Service, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations and software is the property of Qbird or its content suppliers and protected by Bangladesh and international copyright laws. The compilation of all content included in or made available through any Qbird Service is the exclusive property of Qbird and protected by Bangladesh and international copyright laws.</p>

                                    <h4>Trademarks</h4>
                                    <p>Graphics, logos, page headers, button icons, scripts and service names included in or made available through any Qbird Service are trademarks or trade dress of Qbird in Bangladesh and other countries. Qbird’s trademarks and trade dress may not be used in connection with any product or service that is not Qbird’s, in any manner that is likely to cause confusion among customers, or in any manner that disparages or discredits Qbird. All other trademarks not owned by Qbird that appear in any Qbird Service are the property of their respective owners, who may or may not be affiliated with, connected to, or sponsored by Qbird.</p>

                                    <h4>License and Access</h4>
                                    <p>Subject to your compliance with these Terms and Conditions and any Service Terms and your payment of any applicable fees, Qbird or its content providers grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and make personal and non-commercial use of the Qbird Services. This license does not include any resale or commercial use of any Qbird Service, or its contents; any collection and use of any product listings, descriptions, or prices; any derivative use of any Qbird Service or its contents; any downloading, copying, or other use of account information for the benefit of any third party; or any use of data mining, robots, or similar data gathering and extraction tools. All rights not expressly granted to you in these Terms and Conditions or any Service Terms are reserved and retained by Qbird or its licensors, suppliers, publishers, rightsholders, or other content providers. No Qbird Service, nor any part of any Qbird Service, may be reproduced, duplicated, copied, sold, resold, visited, or otherwise exploited for any commercial purpose without express written consent of Qbird. You may not frame or utilize framing techniques to enclose any trademark, logo, or other proprietary information (including images, text, page layout, or form) of Qbird without express written consent. You may not use any meta tags or any other "hidden text" utilizing Qbird's name or trademarks without the express written consent of Qbird. You may not misuse the Qbird Services. You may use the Qbird Services only as permitted by law. The licenses granted by Qbird terminate if you do not comply with these Terms and Conditions.</p>

                                    <h4>Your Account</h4>
                                    <p>You may need your own Qbird account to use certain Qbird Services and you may be required to be logged in to the account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account and you agree to accept responsibility for all activities that occur under your account or password. If you are under 18, you may use the Qbird Services only with involvement of a parent or guardian. Alcohol listings on Qbird are intended for adults and available if the law of the country permits. You must be at least 21 years of age to purchase alcohol, or use any site or app functionality related to alcohol. Qbird reserves the right to refuse service, terminate accounts, terminate your rights to use Qbird Services, remove or edit content, or cancel orders in its sole discretion.</p>

                                    <h4>Your Content</h4>
                                    <p>You and only you are responsible for any content that you post in Qbird. This includes the ads, comments, and any other contents posted by the user, owner or the delivery person. Qbird has the right to delete a content without any notice if the content is against Bangladesh or international law but in no way bears the responsibility of that content.</p>

                                    <h4>Reviews, Comments, Communications and Other Contents</h4>
                                    <p>You may post reviews, comments, photos, videos and other content; send messages and other communications; and submit suggestions, ideas, comments, questions, or other information, so long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, infringing of intellectual property rights (including publicity rights), or otherwise injurious to third parties or objectionable and does not consist of or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings, or any form of "spam" or unsolicited commercial electronic messages. You may not use a false e-mail address, impersonate any person or entity, or otherwise mislead as to the origin of any content. Qbird reserves the right (but not the obligation) to remove or edit such content, but does not regularly review posted content.
                                        If you do post content or submit material and unless we indicate otherwise, you grant Qbird a nonexclusive, royalty-free, perpetual, irrevocable and fully sublicensable right to use, reproduce, modify, adapt, publish, perform, translate, create derivative works from, distribute and display such content throughout the world in any media. You grant Qbird and sublicensees the right to use the name that you submit in connection with such content, if they choose. You represent and warrant that you own or otherwise control all of the rights to the content that you post; that the content is accurate; that use of the content you supply does not violate this policy and will not cause injury to any person or entity; and that you will indemnify Qbird for all claims resulting from content you supply. Qbird has the right but not the obligation to monitor and edit or remove any activity or content. Qbird takes no responsibility and assumes no liability for any content posted by you or any third party.
                                    </p>

                                    <h4>Product Descriptions</h4>
                                    <p>Qbird attempts to be as accurate as possible. However, Qbird does not warrant that product and service descriptions or other content of any Qbird Service is accurate, complete, reliable, current, or error-free. The owners of the ads and shops are liable for the descriptions of their products and services. If a product or service offered by Qbird is not as described, it is completely up to the corresponding seller.</p>

                                    <h4>Pricing</h4>
                                    <p>‘Price’ means the suggested price of a product or service as provided by the owner of the ad. Despite our best efforts, a small number of the items and services in our catalog may be mispriced. If the correct price of an item or service is higher than the stated price, you should contact the owner of the ad or shop to know details about that pricing. The contact info can be found with each shop and ad in the "Additional Information" section.</p>

                                    <h4>Charges</h4>
                                    <p>While most of the services of Qbird are free, charges may apply to some Qbird services on some conditions. To use those services, you may have to pay the charges. Qbird preserves all rights to apply, cancel or modify any charge of any service and conditions for charges to be applicable at any time without any prior notice.</p>
                                    
                                    <h4>Delivery</h4>
                                    <p>Delivery is a very important part of Qbird Services. The charges shown in the Checkout or Details of the Order cover the order to be delivered at your doorstep. However, the following cases do not cover delivery at your doorstep:
                                        <ul>
                                            <li>If your apartment is above the 1st floor and there is no elevator to reach your apartment.</li>
                                            <li>If the delivery cannot be delivered using the elevator.</li>
                                            <li>If the total weight of the items in your order is more than 20 kg - Kilogram.</li>
                                        </ul>
                                        In these cases, the charges cover the order to be delivered at the ground floor of your house. If you still want the delivery at your doorstep, you may need special arrangement with the delivery person. If both of you agree on terms, the delivery person may deliver your order at your doorstep. This special arrangement is completely between you and the delivery person and Qbird does not bear any responsibility of the special arrangement between you and the delivery person.
                                    </p>
                                    
                                    <h4>App Permissions</h4>
                                    <p>When you use apps created by Qbird, such as the Qbird App and Qbird Delivery App, you may grant certain permissions to us for your device. Most mobile devices provide you with information about these permissions.</p>

                                    <h4>Sanctions</h4>
                                    <p>You may not use any Qbird Service if you are the subject of Bangladesh sanctions or of sanctions consistent with Bangladesh law imposed by the governments of the country where you are using Qbird Services.</p>

                                    <h4>Applicable Law</h4>
                                    <p>By using any Qbird Service, you agree that the Federal Arbitration Act, applicable federal law and the laws of Bangladesh, without regard to principles of conflict of laws, will govern these Terms and Conditions and any dispute of any sort that might arise between you and Qbird.</p>

                                    <h4>Policies, Modification and Severability</h4>
                                    <p>We reserve the right to make changes to our site, policies, Service Terms and these Conditions at any time. If any of these conditions shall be deemed invalid, void, or for any reason unenforceable, that condition shall be deemed severable and shall not affect the validity and enforceability of any remaining condition.</p>

                                    <h4>Additional Qbird Software Terms</h4>
                                    <p>The following terms (“Software Terms”) apply to any software (including any updates or upgrades to the software) and any related documentation we make available to you in connection with Qbird Services.</p>
                                    <ol>
                                        <li>
                                            <b>Use of the Qbird Software:</b> You may use Qbird Software solely for purposes of enabling you to use the Qbird Services as provided by Qbird and as permitted by these Terms and Conditions. You may not incorporate any portion of the Qbird Software into other programs or compile any portion of it in combination with other programs, or otherwise copy (except to exercise rights granted in this section), modify, create derivative works of, distribute, assign any rights to, or license the Qbird Software in whole or in part. All softwares used in any Qbird Service is the property of Qbird or its software suppliers and is protected by Bangladesh and international copyright laws.
                                        </li>
                                        <li>
                                            <b>No Reverse Engineering:</b> You may not reverse engineer, decompile or disassemble, tamper with, or bypass any security associated with the Qbird Software, whether in whole or in part.
                                        </li>
                                        <li>
                                            <b>Updates:</b> We may offer automatic or manual updates to the Qbird Software at any time and without notice to you.
                                        </li>
                                        <li>
                                            <b>Conflicts:</b> In the event of any conflict between these Terms and Conditions and any other Qbird or third-party terms applicable to any portion of Qbird Software, such as open-source license terms, such other terms will control as to that portion of the Qbird Software and to the extent of the conflict.
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        auth: state.auth
    };
}

export default connect(mapStateToProps, { general })(TermsAndConditions);