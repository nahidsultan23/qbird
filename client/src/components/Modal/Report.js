import React from 'react'
import { reduxForm, Field } from 'redux-form';

import renderInput from '../../constants/forms/renderInput';
import renderSelect from '../../constants/forms/renderSelect';
import renderTextarea from '../../constants/forms/renderTextarea';
import { required, maxLength200, maxLength2000 } from '../../constants/forms/fieldLevelValidation';
import Spinner from '../Common/Spinner';

class Report extends React.Component {

    state = {
        subject: 'Fraudulence',
        otherSubject: '',
        comment: ''
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    submit = () => {
        const { subject, otherSubject, comment } = this.state;
        this.props.onReportSubmitted(subject, otherSubject, comment);
    }

    render() {
        const { handleSubmit, isSubmittingReport, reportError } = this.props;
        return (
            <form className="create-ad-form" onSubmit={handleSubmit(this.submit)}>
                <Field type="select" name="subject" component={renderSelect} label="Subject" onChange={this.handleChange}>
                    <option key="Fraudulence" value="Fraudulence">Fraudulence</option>
                    <option key="Inappropriate Content" value="Inappropriate Content">Inappropriate Content</option>
                    <option key="Illegal Content" value="Illegal Content">Illegal Content</option>
                    <option key="Erotic Content" value="Erotic Content">Erotic Content</option>
                    <option key="Other" value="Other">Other</option>
                </Field>
                {this.state.subject === 'Other' &&
                    <Field type="text" name="otherSubject" component={renderInput} placeholder="Specify a Subject" validate={[required, maxLength200]} maxLength="200" onChange={this.handleChange} />}
                <Field type="text" name="comment" component={renderTextarea} placeholder="Enter your comment" label="Comment (if you have any)" validate={[maxLength2000]} maxLength="2000" rows={7} cols={10} onChange={this.handleChange} />
                <button type="submit" className="btn btn-light pull-right"><Spinner isLoading={isSubmittingReport} /> &nbsp;Submit</button>
                {reportError && !isSubmittingReport && <span className="text-danger">{reportError}</span>}
                <div className="clearfix"></div>
            </form>
        );
    }
}
Report = reduxForm({
    form: 'report-form',
    initialValues: {
        subject: "Fraudulence"
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(Report)
export default Report;