import React from 'react'

import plus from '../../img/plus_sign.png';
import noPhoto from '../../img/NoPhotoAvailable/noPhotoAvailable320x300.png';
import loadingPhoto from '../../img/loading.gif';
import cross from '../../img/cross.png';
import cross2 from '../../img/cross2.png';
import exclamation from '../../img/exclamation.jpg';
import { connect } from 'react-redux';

import { createShopPhotoProgress } from '../../store/actions/imageActions';
import { bucketUrl } from '../../constants/urls/bucket';


class PhotosUpload extends React.Component {

    state = {
        uploadedCount: 0,
        serverPhotoIDs: [], //all photoIDs came from server, includes deleted photos too
        maximumPhotosCount: this.props.maximumPhotosCount,
        localPhotoIDs: [],    //local photoIDs that will be included
        errorMessage: '',
        deletedIDs: [],
        done: false,
        oldPhotosName: []
    }

    // on remove image
    onCrossClick = e => {
        let id = parseInt(e.target.id.match(/(\d+)/)[0]);
        let containerID = 'container'.concat(id.toString());
        let containerElement = document.getElementById(containerID);
        containerElement.style.display = 'none';
        if (containerElement.hasAttribute('data-name')) {
            let oldPhotoName = containerElement.dataset.name;
            let oldPhotosName = this.state.oldPhotosName.filter(opn => opn !== oldPhotoName);
            this.props.onPhotosUpdate({ serverPhotoIDs: this.state.serverPhotoIDs, oldPhotosName: oldPhotosName });
            this.setState({ oldPhotosName: oldPhotosName });
        } else {
            let localPhotoIDs = this.state.localPhotoIDs;
            let serverPhotoIDs = this.state.serverPhotoIDs;
            let index = localPhotoIDs.indexOf(id.toString());
            if (index !== -1) {
                localPhotoIDs.splice(index, 1);
                serverPhotoIDs.splice(index, 1);
            }
            this.setState({
                maximumPhotosCount: this.state.maximumPhotosCount + 1,
                localPhotoIDs: localPhotoIDs,
                serverPhotoIDs: serverPhotoIDs
            });
            this.props.onPhotosUpdate({ serverPhotoIDs: this.state.serverPhotoIDs, oldPhotosName: this.state.oldPhotosName });
        }
    }

    // on hover image
    onHoverImage = e => {
        let id = e.target.id.match(/(\d+)/)[0];
        let crossID = 'cross'.concat(id.toString());
        document.getElementById(crossID).style.display = 'block';
    }

    // on blur image
    onHoverLeave = e => {
        let id = e.target.id.match(/(\d+)/)[0];
        let crossID = 'cross'.concat(id.toString());
        document.getElementById(crossID).style.display = 'none';
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.uploadStatus.payload && this.props.uploadStatus.payload.done === 'onProgress') {
            let id = this.props.uploadStatus.payload.id;
            let progressBarID = 'progressBar'.concat(id.toString());
            let progressValueID = 'progressValue'.concat(id.toString());

            let currentProgress = this.props.uploadStatus.payload.progress;
            document.getElementById(progressBarID).style.visibility = 'visible';
            document.getElementById(progressValueID).style.width = currentProgress.toString().concat('%');
            if(currentProgress === 100) {
                let id = this.props.uploadStatus.payload.id;
                let imageID = 'newImage'.concat(id.toString());
                document.getElementById(imageID).style.display = 'block';
                document.getElementById(imageID).src = loadingPhoto;
            }
        }
        else if (this.props.uploadStatus.payload && this.props.uploadStatus.payload.done === 'yes') {
            this.props.uploadStatus.payload.done = ''
            let payload = this.props.uploadStatus.payload;
            if (payload) {
                if (payload.status === 'success') {
                    let id = payload.clientPhotoID;
                    let localPhotoIDs = this.state.localPhotoIDs;
                    let tempServerPhotoIDs = this.state.serverPhotoIDs;
                    let newServerPhotoID = payload.tempPhotoID;

                    if (!localPhotoIDs.includes(id) || !tempServerPhotoIDs.includes(newServerPhotoID)) {
                        let imageID = 'newImage'.concat(id.toString());
                        let progressBarID = 'progressBar'.concat(id.toString());
                        document.getElementById(progressBarID).style.visibility = 'hidden';
                        document.getElementById(imageID).style.display = 'block';
                        document.getElementById(imageID).src = payload.localPhotoUrl;
                        if (!localPhotoIDs.includes(id)) {
                            localPhotoIDs.push(id);
                            this.setState({
                                localPhotoIDs: localPhotoIDs
                            });
                        }
                        if (!tempServerPhotoIDs.includes(newServerPhotoID)) {
                            tempServerPhotoIDs.push(newServerPhotoID);
                            this.setState({
                                serverPhotoIDs: tempServerPhotoIDs
                            });
                        }
                        this.props.onPhotosUpdate({ serverPhotoIDs: this.state.serverPhotoIDs, oldPhotosName: this.state.oldPhotosName });
                    }
                }
                else if (payload.status === 'failure') {
                    let em = this.props.uploadStatus.payload.errorMessage;
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

                    let id = this.props.uploadStatus.payload.id;
                    let imageID = 'newImage'.concat(id.toString());
                    document.getElementById(imageID).src = exclamation;

                    let serverMsgID = 'serverMessage'.concat(id.toString());
                    document.getElementById(serverMsgID).style.visibility = 'visible';
                    document.getElementById(serverMsgID).innerHTML = errorMessage.concat(' This image can not be uploaded');

                    let deletedIDs = this.state.deletedIDs;
                    if (!deletedIDs.includes(id)) {
                        deletedIDs.push(id);
                        this.setState({
                            maximumPhotosCount: this.state.maximumPhotosCount + 1,
                            deletedIDs: deletedIDs
                        });
                    }
                }
            }

        }

    }

    onAddingImage = event => {
        if (event.target.files[0]) {
            let newFile = event.target.files[0];
            let ext = newFile.name.split('.')[1].toLowerCase();
            if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
                this.setState({
                    errorMessage: 'Images with extensions .jpg, .jpeg or, .png are only acceptable'
                });
                document.getElementById('errorMessage').style.display = 'block';
                return;
            }
            document.getElementById('errorMessage').style.display = 'none';

            let numberOfPhotos = this.state.uploadedCount + 1;
            this.setState({
                uploadedCount: numberOfPhotos
            })
            let containerID = 'container'.concat(numberOfPhotos.toString());
            document.getElementById(containerID).style.display = 'inline-block';

            let serverImageObject = {
                myPhoto: event.target.files[0],
                localPhotoUrl: URL.createObjectURL(event.target.files[0]),
                clientPhotoID: numberOfPhotos,
                type: this.props.type
            }
            document.getElementById('addImage').value = '';
            this.props.createShopPhotoProgress(serverImageObject);
        }

    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.oldPhotos && this.props.oldPhotos.length !== nextProps.oldPhotos.length) {
            this.setState({ oldPhotosName: nextProps.oldPhotos });
            this.pushExistingPhotos(nextProps);
        }
    }

    pushExistingPhotos({ oldPhotos }) {
        for (let i = 0; i < oldPhotos.length; i++) {
            let containerID = 'container'.concat((i + 1).toString());
            document.getElementById(containerID).style.display = 'inline-block';
            document.getElementById(containerID).setAttribute('data-name', oldPhotos[i]);
            let progressBarID = 'progressBar'.concat((i + 1).toString());
            document.getElementById(progressBarID).style.visibility = 'hidden';
            let imageID = 'newImage'.concat((i + 1).toString());
            document.getElementById(imageID).style.display = 'block';
            if(this.props.oldPhotosFrom && (this.props.oldPhotosFrom === "demo-ad")) {
                document.getElementById(imageID).src = bucketUrl + "photos/demoPhotos/photo-320/" + oldPhotos[i].replace("#","%23");
            }
            else {
                document.getElementById(imageID).src = bucketUrl + "photos/photo-320/" + oldPhotos[i].replace("#","%23");
            }
        }
        this.setState({ uploadedCount: oldPhotos.length });
        this.props.onPhotosUpdate({ serverPhotoIDs: this.state.serverPhotoIDs, oldPhotosName: oldPhotos });
    }

    render() {
        let containers = [];
        for (let i = 1; i <= this.state.maximumPhotosCount; i++) {
            let imageID = 'newImage'.concat(i.toString());
            let containerID = 'container'.concat(i.toString());
            let progressBarID = 'progressBar'.concat(i.toString());
            let progressValueID = 'progressValue'.concat(i.toString());
            let crossID = 'cross'.concat(i.toString());
            let serverMsgID = 'serverMessage'.concat(i.toString());
            containers.push(
                <div key={i} id={containerID} className='mr1' style={{ display: 'none', height: '230px', width: '220px', marginRight: '10px' }}>
                    <div style={{ height: '200px', width: '220px' }} className='shadow-1' onMouseOver={this.onHoverImage} onMouseLeave={this.onHoverLeave}>
                        <img id={imageID} className='ba b--silver pa2' src={noPhoto} alt='imageAlt' height='200' width='220' style={{ position: 'relative', top: '0px', right: '0px', zIndex: 1, transition: '0.4s' }}
                            onMouseOver={() => { document.getElementById(imageID).style.opacity = 0.4 }}
                            onMouseLeave={() => { document.getElementById(imageID).style.opacity = 1 }} />
                        <img id={crossID} className='br-100 grow' src={cross} alt='cross' height='22' width='22' style={{ display: 'none', position: 'relative', top: '-196px', right: '-196px', zIndex: 3 }}
                            onClick={this.onCrossClick}
                            onMouseOver={() => { document.getElementById(imageID).style.opacity = 0.4 }}
                            onMouseLeave={() => { document.getElementById(imageID).style.opacity = 1 }} />
                    </div>
                    <div id={progressBarID} className="progress" style={{ width: '220px', height: '10px' }}>
                        <div id={progressValueID} className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style={{ width: '0%', height: '10px' }}>
                        </div>
                    </div>
                    <p id={serverMsgID} className='red small bg-white' style={{ visibility: 'hidden', width: '200px' }}>Internal Server Error. This image can not be uploaded.</p>
                </div>
            );
        }

        return (
            <React.Fragment>
                <label className="label">Photos (optional)</label>
                <div
                    id='errorMessage'
                    className='bg-black-90 o-80 br2 white-80'
                    style={{
                        width: '380px',
                        transition: '0.3s',
                        display: 'none'
                    }}
                >
                    <img id='' className=' dim bg-white-90' src={cross2} alt='cross' height='15' width='15' style={{ position: 'relative', bottom: '0px', left: '359px', zIndex: 3 }}
                        onClick={() => { document.getElementById('errorMessage').style.display = 'none' }}
                    />
                    <p className='pa3 pt0'>{this.state.errorMessage}</p>

                </div>
                {containers}
                {(this.state.uploadedCount < this.state.maximumPhotosCount) ?
                    <div style={{ display: 'inline-block', height: '230px', width: '220px' }} className="cursor-pointer">
                        <label style={{ display: 'block' }}>
                            <input id='addImage' style={{ display: 'none' }} className="" type="file" accept="image/*" onChange={this.onAddingImage} />
                            <img src={plus} className="ba b--silver pointer b--dashed grow pa2" alt="Choose File" height='200' width='220' style={{ border: 'dotted' }} /></label>
                        <div className="progress" style={{ width: '220px', height: '2px', visibility: 'hidden' }}>
                            <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style={{ width: '0%', height: '2px' }}>
                            </div>
                        </div>
                        <p className='red small bg-white' style={{ visibility: 'hidden', width: '200px' }}>Internal Server Error. This image can not be uploaded.</p>
                    </div>
                    : ''
                }
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        uploadStatus: state.imageReducer
    }
}

export default connect(mapStateToProps, { createShopPhotoProgress })(PhotosUpload);