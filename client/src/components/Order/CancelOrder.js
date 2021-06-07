import React from 'react'
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import Modal from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import Spinner from '../Common/Spinner';
import renderTextarea from '../../constants/forms/renderTextarea';
import { maxLength500 } from '../../constants/forms/fieldLevelValidation';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';

class CancelOrder extends React.Component {

    onCancelOrder = (formValues) => {
        this.props.onCancelOrder(formValues);
    }

    onClose = () => {
        const { reset } = this.props;
        reset();
        this.props.onClose();
    }

    render() {
        const { handleSubmit, isCancellingOrder, errorMessage } = this.props;
        return (
            <Modal
                title="Cancel Order"
                visible={true}
                onClose={this.onClose}
                closable={true}
                animation="slide-fade"
                maskAnimation="fade"
            >
                <form className="create-ad-form" onSubmit={handleSubmit(this.onCancelOrder)}>
                    <Field type="text" name="reason" component={renderTextarea} label="Reason" placeholder="Please specify a reason" validate={[maxLength500]} maxLength="500" rows={5} cols={10} />
                    <button className="btn btn-danger" key="save" type="submit"><Spinner isLoading={isCancellingOrder} /> &nbsp;Cancel Now</button>
                    <button type="button" className="btn btn-default" key="close" onClick={this.onClose}>Close</button>
                    {!isCancellingOrder && <span className="text-danger">{errorMessage}</span>}
                </form>
            </Modal>
        )
    }
}

CancelOrder = reduxForm({
    form: 'order-cancel',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(CancelOrder);

const mapStateToProps = (state) => {
    return {
        isCancellingOrder: createLoadingSelector(['CANCEL_ORDER'])(state)
    }
}

export default connect(mapStateToProps)(CancelOrder);