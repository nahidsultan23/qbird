import React from 'react';
import AdBlockDetect from 'react-ad-block-detect';
import Modal from 'rc-dialog';

class AdBlockerDetect extends React.Component {

    state = {
        showModal: true
    };

    onCloseModal = () => {
        this.setState({ showModal: false });
    }

    render() {
        return (
            <React.Fragment>
                <AdBlockDetect>
                    <Modal
                        title="Ad Blocker Detected"
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
                        Please turn off the Ad Blocker of your browser for better experience. Some of the features may not work properly if the Ad Blocker is turned on.
                    </Modal>
                </AdBlockDetect>
            </React.Fragment>
        )
    }
}

export default AdBlockerDetect;