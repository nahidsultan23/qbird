import React from 'react'
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import { truncate } from '../../services/common';

class Description extends React.Component {

    state = {
        visible: false
    }

    handleOkDescription = () => {
        this.setState({ visible: false });
    }

    onCloseDescription = () => {
        this.setState({ visible: false });
    }

    onReadMore = () => {
        this.setState({ visible: true });
    }

    renderDescription = (description, type) => {
        if (description && (type === 'shop') && description.trim().length > 500)
            return <div className="text-justify word-break whitespace-pre-wrap">{truncate(description, 500)} <button className="cursor-pointer" style={{ color: '#a800ff' }} onClick={this.onReadMore}>Click to see full description</button></div>;
        else if (description && (type === 'ad') && description.trim().length > 200)
            return <div className="text-justify word-break whitespace-pre-wrap">{truncate(description, 200)} <button className="cursor-pointer" style={{ color: '#a800ff' }} onClick={this.onReadMore}>Click to see full description</button></div>;
        else {
            return <div className="text-justify word-break whitespace-pre-wrap">{description}</div>;
        }
    }
    render() {

        const { visible } = this.state;
        const { description, type } = this.props;
        return (
            <React.Fragment>
                {this.renderDescription(description, type)}
                <Modal
                    title="Description"
                    visible={visible}
                    onOk={this.handleOkDescription}
                    onClose={this.onCloseDescription}
                    closable={true}
                >
                    <p className="text-justify word-break whitespace-pre-wrap">{description}</p>
                </Modal>
            </React.Fragment>
        )
    }

}
export default Description;