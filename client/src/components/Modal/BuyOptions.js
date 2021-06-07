import React from 'react'
import { reduxForm, Field } from 'redux-form';

import { twoDecimalPoints, thousandSeparators } from '../../services/common';


class BuyOptions extends React.Component {

    prepareOption = (option, price, weight) => {
        let preparedOption = option;
        if(price > 0) {
            preparedOption = preparedOption + ", Extra Price: ৳" + price;
        }

        if(weight > 0) {
            preparedOption = preparedOption + ", Extra Weight: " + weight + " kg";
        }
        return preparedOption;
    }

    submit = (formValues) => {
        let selectedOptions = [];
        const { options } = this.props;
        options.forEach((item) => {
            if(item.optionType === 'Mandatory') {
                if (!formValues[`${item._id}_select`]) {
                    selectedOptions.push({ optionName: item.optionName, option: item.options[0].option });
                } else {
                    selectedOptions.push({ optionName: item.optionName, option: item.options.find(o => o._id === formValues[`${item._id}_select`]).option });
                }
            }
            else if (formValues[`${item._id}_checkbox`] === true) {
                if (!formValues[`${item._id}_select`]) {
                    selectedOptions.push({ optionName: item.optionName, option: item.options[0].option });
                } else {
                    selectedOptions.push({ optionName: item.optionName, option: item.options.find(o => o._id === formValues[`${item._id}_select`]).option });
                }
            }
            return;
        });
        this.props.onOptionsSubmitted({ options: selectedOptions });
        const { reset } = this.props;
        reset();
    }

    loop = options => {
        return options.map(item => {
            return (
                <div className="form-group row" key={`${item._id}_item`}>
                    <div className="col-sm-3 col-form-label">
                        <div className="form-check">
                            {(item.optionType === 'Mandatory') ? <Field type="checkbox" checked name={`${item._id}_checkbox`} id={item._id} className="form-check-input" component="input" />
                            : <Field type="checkbox" name={`${item._id}_checkbox`} id={item._id} className="form-check-input" component="input" />}
                            <label htmlFor={item._id} className="form-check-label word-break">{item.optionName}</label>
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <Field name={`${item._id}_select`} className="form-control" component="select">
                            {item.options.map((childItem) => {
                               return <option key={childItem._id} value={childItem._id}>{this.prepareOption(childItem.option, thousandSeparators(twoDecimalPoints(childItem.extraPrice)), thousandSeparators(twoDecimalPoints(childItem.extraWeightInKg)))}</option>
                            })}
                        </Field>
                    </div>
                </div>
            );
        });
    }

    render() {
        const { options, handleSubmit } = this.props;
        return (
            <form onSubmit={handleSubmit(this.submit)}>
                {options ? this.loop(options) : 'Loading'}
                <button type="submit" className="btn btn-light pull-right" onClick={this.onProceed}>Proceed</button>
                <div className="clearfix"></div>
            </form>
        );
    }
}
BuyOptions = reduxForm({
    form: 'options-form',
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(BuyOptions)
export default BuyOptions;
