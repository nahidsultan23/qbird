import React, { Component } from 'react';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { checkAuthAdmin } from '../store/actions/authActions';
import { connect } from 'react-redux';
import PhotosUpload from '../components/Common/PhotosUpload';
import ErrorDetailSection from '../components/Common/ErrorDetailSection';
import { topSliderUpdate, secondSliderUpdate, latestUpdate, specialUpdate, featuredUpdate, spanAUpdate, spanBUpdate, spanCUpdate, trendingUpdate, bestsellerUpdate } from '../store/actions/updateHomepageActions';
import { createLoadingSelector } from '../store/selectors/createLoadingSelector';
import Spinner from '../components/Common/Spinner';
import NoContentFound from '../components/Common/NoContentFound';

class UpdateHomepage extends Component {

    state = {
        selectedOption: "Top Slider",
        type: "topSlider",
        permissions: {},
        topSlider: {
            urlName: "",
            smallLine: "",
            biggerLine: "",
            photo: ""
        },
        secondSlider: {
            categoryName: "",
            photo: ""
        },
        latest: {
            adID: "",
            photo: ""
        },
        special: {
            adID: "",
            photo: ""
        },
        featured: {
            adID: "",
            photo: ""
        },
        spanA: {
            adID: "",
            photo: ""
        },
        spanB: {
            adID: "",
            photo: ""
        },
        spanC: {
            adID: "",
            photo: ""
        },
        trending: {
            adID: "",
            photo: ""
        },
        bestseller: {
            adID: "",
            photo: ""
        },
        showModal: false,
        modalMessage: "",
        errorMessage: {
            fatalError: null
        }
    };

    UNSAFE_componentWillMount() {
        window.scrollTo(0,0);
    }

    componentDidMount() {
        this.props.checkAuthAdmin().then(() => {
            const { permissions, errorMessage } = this.props.auth.payload;
            const { fatalError, authError } = errorMessage;
            this.setState({
                permissions: permissions,
                errorMessage: {
                    fatalError: fatalError,
                    authError: authError
                }
            });
        });
    }

    onCloseModal = () => {
        this.setState({
            showModal: false
        })
    }

    optionChanged = (e) => {
        let type = "";
        if(e.target.value === "Top Slider") {
            type = "topSlider";
        }
        else if(e.target.value === "Second Slider") {
            type = "secondSlider";
        }
        else if(e.target.value === "Latest") {
            type = "latest";
        }
        else if(e.target.value === "Special") {
            type = "special";
        }
        else if(e.target.value === "Featured") {
            type = "featured";
        }
        else if(e.target.value === "Span A") {
            type = "spanA";
        }
        else if(e.target.value === "Span B") {
            type = "spanB";
        }
        else if(e.target.value === "Span C") {
            type = "spanC";
        }
        else if(e.target.value === "Trending") {
            type = "trending";
        }
        else if(e.target.value === "Best Sellers") {
            type = "bestseller";
        }
        this.setState({
            selectedOption: e.target.value,
            type: type
        })
    }

    onChangeTopSliderUrlName = (e) => {
        this.setState({
            topSlider: {
                ...this.state.topSlider,
                urlName: e.target.value
            }
        });
    }

    onChangeTopSliderSmallLine = (e) => {
        this.setState({
            topSlider: {
                ...this.state.topSlider,
                smallLine: e.target.value
            }
        });
    }

    onChangeTopSliderBiggerLine = (e) => {
        this.setState({
            topSlider: {
                ...this.state.topSlider,
                biggerLine: e.target.value
            }
        });
    }

    onTopSliderPhotosUpdate = ({ serverPhotoIDs }) => {
        this.setState({
            topSlider: {
                ...this.state.topSlider,
                photo: serverPhotoIDs[0]
            }
        });
    }

    onTopSliderSubmit = (e) => {
        e.preventDefault();
        this.props[this.state.type + 'Update'](this.state[this.state.type]).then(() => {
            const { status, errorMessage } = this.props.updateHomepageReducer.payload;
            if(status === 'success') {
                this.setState({
                    topSlider: {
                        urlName: "",
                        photo: ""
                    }
                });
            }
            else {
                const { fatalError, authError, permissionError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : permissionError;
                this.setState({
                    showModal: true,
                    modalMessage: "Item was not added to the Top Slider store. " + message
                });
            }
        });
    }

    onChangeSecondSliderCategoryName = (e) => {
        this.setState({
            secondSlider: {
                ...this.state.secondSlider,
                categoryName: e.target.value
            }
        })
    }

    onSecondSliderPhotosUpdate = ({ serverPhotoIDs }) => {
        this.setState({
            secondSlider: {
                ...this.state.secondSlider,
                photo: serverPhotoIDs[0]
            }
        });
    }

    onSecondSliderSubmit = (e) => {
        e.preventDefault();
        this.props.secondSliderUpdate(this.state.secondSlider).then(() => {
            const { status, errorMessage } = this.props.updateHomepageReducer.payload;
            if(status === 'success') {
                this.setState({
                    secondSlider: {
                        categoryName: "",
                        photo: ""
                    }
                });
            }
            else {
                const { fatalError, authError, permissionError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : permissionError;
                this.setState({
                    showModal: true,
                    modalMessage: "Item was not added to the Second Slider store. " + message
                });
            }
        });
    }

    onChangeAdID = (e) => {
        this.setState({
            [this.state.type]: {
                ...this.state[this.state.type],
                adID: e.target.value
            }
        })
    }
 
    onPhotosUpdate = ({ serverPhotoIDs }) => {
        this.setState({
            [this.state.type]: {
                ...this.state[this.state.type],
                photo: serverPhotoIDs[0]
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props[this.state.type + 'Update'](this.state[this.state.type]).then(() => {
            const { status, errorMessage } = this.props.updateHomepageReducer.payload;
            if(status === 'success') {
                this.setState({
                    [this.state.type]: {
                        adID: "",
                        photo: ""
                    }
                });
            }
            else {
                const { fatalError, authError, permissionError } = errorMessage;
                const message = fatalError ? fatalError : authError ? "Authentication failed" : permissionError;
                this.setState({
                    showModal: true,
                    modalMessage: "Item was not added to the " + this.state.selectedOption + " store. " + message
                });
            }
        });
    }

    render() {
        const { updateHomepageData } = this.state.permissions;
        const { isFetchingAdminData, isAddingTopSlider, isAddingSecondSlider, isAdding } = this.props;
        const { selectedOption, type, errorMessage } = this.state;
        const { fatalError, authError, permissionError } = errorMessage;
        return (
            <React.Fragment>
                {fatalError ? <ErrorDetailSection errorMessage={fatalError} /> : authError ? <ErrorDetailSection title={"Athentication Error"} errorMessage={authError} /> : permissionError ? <ErrorDetailSection title={"Permission Error"} errorMessage={permissionError} /> :
                    isFetchingAdminData ? <React.Fragment><div className="row align-items-center">
                            <div className="col d-flex justify-content-center">
                                <Spinner isLoading={isFetchingAdminData} /> &nbsp;Fetching...
                            </div>
                        </div>
                    </React.Fragment> : updateHomepageData ? <section className="about-area ptb-60">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-12 col-md-12">
                                <div className="about-content">
                                    <div>
                                        <select onChange={(e) => this.optionChanged(e)}>
                                            <option>Top Slider</option>
                                            <option>Second Slider</option>
                                            <option>Latest</option>
                                            <option>Special</option>
                                            <option>Featured</option>
                                            <option>Span A</option>
                                            <option>Span B</option>
                                            <option>Span C</option>
                                            <option>Trending</option>
                                            <option>Best Sellers</option>
                                        </select>
                                    </div>
                                    {(selectedOption === "Top Slider") && <div>
                                        <h2>Top Slider</h2>
                                        <form onSubmit={this.onTopSliderSubmit}>
                                            <div>Shop ID: <input type="text" onChange={(e) => this.onChangeTopSliderUrlName(e)} /></div>
                                            <div>Small Line: <input type="text" onChange={(e) => this.onChangeTopSliderSmallLine(e)} /></div>
                                            <div>Bigger Line: <input type="text" onChange={(e) => this.onChangeTopSliderBiggerLine(e)} /></div>
                                            <PhotosUpload maximumPhotosCount={1} onPhotosUpdate={this.onTopSliderPhotosUpdate} type={type} />
                                            <button><Spinner isLoading={isAddingTopSlider} /> Submit</button>
                                        </form>
                                    </div>}
                                    {(selectedOption === "Second Slider") && <div>
                                        <h2>Second Slider</h2>
                                        <form onSubmit={(e) => this.onSecondSliderSubmit(e)}>
                                            <div>Category Name: <input type="text" onChange={(e) => this.onChangeSecondSliderCategoryName(e)} /></div>
                                            <PhotosUpload maximumPhotosCount={1} onPhotosUpdate={this.onSecondSliderPhotosUpdate} type={type} />
                                            <button><Spinner isLoading={isAddingSecondSlider} /> Submit</button>
                                        </form>
                                    </div>}
                                    {!((selectedOption === "Top Slider") || (selectedOption === "Second Slider")) && <div>
                                        <h2>{selectedOption}</h2>
                                        <form onSubmit={(e) => this.onSubmit(e)}>
                                            <div>Ad ID: <input type="text" onChange={(e) => this.onChangeAdID(e)} /></div>
                                            <PhotosUpload maximumPhotosCount={1} onPhotosUpdate={this.onPhotosUpdate} type={type} />
                                            <button><Spinner isLoading={isAdding} /> Submit</button>
                                        </form>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal
                        title="Error"
                        visible={this.state.showModal}
                        onClose={this.onCloseModal}
                        closable={true}
                        className="word-break"
                        animation="slide-fade"
                        maskAnimation="fade"
                        footer={
                            [
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    key="close"
                                    onClick={this.onCloseModal}
                                >
                                    OK
                                </button>
                            ]
                        }
                    >
                        <b>{this.state.modalMessage}</b>
                    </Modal>
                </section>: <NoContentFound />}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        isFetchingAdminData: createLoadingSelector(['CHECK_AUTH_ADMIN'])(state),
        isAddingTopSlider: createLoadingSelector(['UPDATE_HOMEPAGE_TOP_SLIDER'])(state),
        isAddingSecondSlider: createLoadingSelector(['UPDATE_HOMEPAGE_SECOND_SLIDER'])(state),
        isAdding: createLoadingSelector(['UPDATE_HOMEPAGE_LATEST', 'UPDATE_HOMEPAGE_SPECIAL', 'UPDATE_HOMEPAGE_FEATURED', 'UPDATE_HOMEPAGE_SPANA', 'UPDATE_HOMEPAGE_SPANB', 'UPDATE_HOMEPAGE_SPANC', 'UPDATE_HOMEPAGE_TRENDING', 'UPDATE_HOMEPAGE_BESTSELLERS'])(state),
        auth: state.auth,
        updateHomepageReducer: state.updateHomepageReducer
    };
}

export default connect(mapStateToProps, { checkAuthAdmin, topSliderUpdate, secondSliderUpdate, latestUpdate, specialUpdate, featuredUpdate, spanAUpdate, spanBUpdate, spanCUpdate, trendingUpdate, bestsellerUpdate })(UpdateHomepage);