import React from 'react';
import { connect } from 'react-redux';

import noPhoto from '../../img/person-avatar.png';
import loadingPhoto from '../../img/loading.gif';
import { createShopPhotoProgress } from '../../store/actions/imageActions';
import { updateUserPhoto } from '../../store/actions/userActions';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';
import { bucketUrl } from '../../constants/urls/bucket';

class ProfilePicture extends React.Component {

    state = {
        errorMessage: null,
        photo: noPhoto,
        loadingPhoto: false,
        disabled: false
    }

    componentDidUpdate(prevProps, prevState) {
        let progressBar = document.getElementById("progressBar");
        let ProgressBarValue = document.getElementById("progressBarValue");
        let inputElem = document.getElementById("wizard-picture");
        if (this.props.uploadStatus.payload && this.props.uploadStatus.payload.done === 'onProgress') {
            const { progress } = this.props.uploadStatus.payload;
            progressBar.style.visibility = 'visible';
            ProgressBarValue.style.width = progress.toString().concat('%');
            if((progress === 100) && !this.state.loadingPhoto) {
                this.setState({
                    loadingPhoto: true,
                    photo: loadingPhoto
                })
            }
        }
        else if (this.props.uploadStatus.payload && this.props.uploadStatus.payload.done === 'yes') {
            this.props.uploadStatus.payload.done = ''
            let payload = this.props.uploadStatus.payload;
            if (payload) {
                if (payload.status === 'success') {
                    progressBar.style.visibility = 'hidden';
                    this.setState({ photo: payload.localPhotoUrl });
                    inputElem.removeAttribute("disabled");
                    const { tempPhotoID } = this.props.uploadStatus.payload;
                    this.props.onUpdatePhoto(this.props.uploadStatus.payload.photo);
                    this.props.updateUserPhoto({ photo: tempPhotoID });
                }
                else if (payload.status === 'failure') {
                    let em = payload.errorMessage;
                    let errorMessage = '';
                    if (em.authError !== '') {
                        errorMessage = em.authError;
                    }
                    else if (em.fatalError !== '') {
                        errorMessage = em.fatalError;
                    }
                    else if (em.clientPhotoID !== '') {
                        errorMessage = em.clientPhotoID;
                    }
                    if (errorMessage !== this.state.errorMessage) {
                        this.setState({ errorMessage: errorMessage })
                    }
                }
            }
        }

    }

    onAddingImage = event => {
        if (event.target.files[0]) {
            this.setState({ errorMessage: null })
            let newFile = event.target.files[0];
            let ext = newFile.name.split('.')[1].toLowerCase();
            if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
                this.setState({ errorMessage: 'Images with extensions .jpg, .jpeg or, .png are only acceptable' });
                return;
            }
            
            let serverImageObject = {
                myPhoto: event.target.files[0],
                localPhotoUrl: URL.createObjectURL(event.target.files[0]),
                clientPhotoID: 1,
                type: 'profile'
            }
            document.getElementById("wizard-picture").setAttribute('disabled', '');

            this.props.createShopPhotoProgress(serverImageObject);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(nextProps.uploadStatus.payload) {
            this.setState({
                photo: nextProps.uploadStatus.payload.localPhotoUrl
            });
        }
        else if (this.props.userPhoto !== nextProps.userPhoto && nextProps.userPhoto) {
            this.setState({
                photo: bucketUrl + "photos/photo-320/" + nextProps.userPhoto.replace("#","%23")
            });
        }
    }

    componentDidMount() {
        if(this.props.uploadStatus.payload) {
            this.setState({
                photo: this.props.uploadStatus.payload.localPhotoUrl
            });
        }
        else if(this.props.userPhoto) {
            this.setState({
                photo: bucketUrl + "photos/photo-320/" + this.props.userPhoto.replace("#","%23")
            });
        }
        this.setState({
            disabled: this.props.disabled !== undefined ? this.props.disabled : this.state.disabled
        })
    }

    render() {
        const { errorMessage, photo, disabled } = this.state;
        return (
            <React.Fragment>
                <div className="picture-container">
                    <div className="picture">
                        <img src={photo} loading="lazy" className="picture-src" id="wizardPicturePreview" alt="" />
                        <input type="file" id="wizard-picture" title={disabled === true ? 'Click Edit to change profile picture.' : 'Change Profile Picture.'} accept="image/*" onChange={this.onAddingImage} disabled={(disabled) ? "disabled" : ""} />
                    </div>
                    <div className="progress" id="progressBar" style={{ visibility: "hidden", height: '10px' }}>
                        <div id="progressBarValue" className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style={{ width: '0%', height: '10px' }}></div>
                    </div>
                </div>
                {errorMessage && errorMessage !== "" && <span className="text-danger">{errorMessage}</span>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isUploadingPhoto: createLoadingSelector(["PHOTO_UPLOAD"])(state),
        uploadStatus: state.imageReducer
    }
}
export default connect(mapStateToProps, { createShopPhotoProgress, updateUserPhoto })(ProfilePicture);