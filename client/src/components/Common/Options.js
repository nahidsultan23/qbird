import React from 'react'
import { Field } from 'redux-form';

import renderSelect from '../../constants/forms/renderSelect';
import renderInput from '../../constants/forms/renderInput';
import { number, maxLength50, zeroPositive } from '../../constants/forms/fieldLevelValidation';
import { twoDecimalPoints, thousandSeparators } from '../../services/common';

class Options extends React.Component {

    state = {
        options: [],
        errorMessage: null,
        maximumParentOptions: 20,
        maximumChildOptions: 20
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.state.options && nextProps.options && this.state.options.length !== nextProps.options.length) {
            this.setState({ options: nextProps.options })
        }
    }

    addAnotherOption = () => {
        this.setState({ errorMessage: '' });
        const { extraPrice, extraPriceUnit, extraWeight, extraWeightUnit, option, optionType, optionName } = this.props.formValues;
        const pCount = this.state.options.length;
        if (extraPrice && extraPrice.trim() && extraPriceUnit && extraWeight && extraWeight.trim() && extraWeightUnit && option && option.trim() && optionName && optionName.trim()) {
            let pIndex = this.state.options.findIndex(p => p.optionName.toLowerCase() === optionName.toLowerCase());
            // creating new option if not exist
            if (pIndex === -1) {
                if (pCount >= this.state.maximumParentOptions) {
                    this.setState({ errorMessage: `You can add maximum ${this.state.maximumParentOptions} Options` });
                } else {
                    let newOptions = this.state.options;
                    newOptions.push({ optionName: optionName, optionType: optionType, options: [{ option, extraPrice, extraPriceUnit, extraWeight, extraWeightUnit }] });
                    this.setState({ options: newOptions });
                    this.props.onOptionsChange(this.state.options);
                }
            } else {
                // adding in option if already not exist in that option
                let pIndex = this.state.options.findIndex(p => p.optionName.toLowerCase() === optionName.toLowerCase());
                if (pIndex > -1) {
                    const cCount = this.state.options[pIndex].options.length;
                    let cIndex = this.state.options[pIndex].options.findIndex(c => c.option.toLowerCase() === option.toLowerCase());
                    if (cCount >= this.state.maximumChildOptions) {
                        this.setState({ errorMessage: `You can add maximum ${this.state.maximumChildOptions} Options in ${optionName}` });
                        return;
                    }
                    if (cIndex > -1) {
                        this.setState({ errorMessage: `${option} already exists in ${optionName}` });
                        return;
                    }
                    let newOptions = this.state.options;
                    newOptions[pIndex].options.push({ option, extraPrice, extraPriceUnit, extraWeight, extraWeightUnit });
                    this.setState({ options: newOptions });
                    this.props.onOptionsChange(this.state.options);
                }
            }
        } else {
            this.setState({ errorMessage: 'All fields are required' });
        }
    }

    renderOptions = (parent, options) => {
        return options.map((option, index) => {
            return (
                <React.Fragment key={option.option + index}>
                    <div key={option.option + index} style={{ marginLeft: '20px' }}>
                        <label>Option :</label> {option.option}
                        <i className="fa fa-times-circle cursor-pointer color-red" style={{ marginLeft: '10px' }} onClick={() => this.onRemove(parent, option.option)}></i>
                        <br />
                        <label>Extra Price :</label> {thousandSeparators(twoDecimalPoints(option.extraPrice)) + ' ' + option.extraPriceUnit}
                        <br />
                        <label>Extra Weight :</label> {thousandSeparators(twoDecimalPoints(option.extraWeight)) + ' ' + option.extraWeightUnit}
                        <br />
                        <br />
                    </div>
                </React.Fragment>
            );
        });
    }

    onRemove = (parent, name) => {
        if (parent === '') {
            let changedOptions = this.state.options.filter(o => o.optionName.toLowerCase() !== name.toLowerCase())
            this.setState({ options: changedOptions });
            this.props.onOptionsChange(changedOptions);
        }
        else {
            let childCount = this.state.options.find(o => o.optionName.toLowerCase() === parent.toLowerCase()).options.length;
            if (childCount === 1)
                this.onRemove('', parent);
            else {
                let index = this.state.options.findIndex(o => o.optionName.toLowerCase() === parent.toLowerCase());
                let newParent = this.state.options.find(o => o.optionName.toLowerCase() === parent.toLowerCase());
                let newChildOptions = newParent.options.filter(oc => oc.option.toLowerCase() !== name.toLowerCase());
                newParent.options = newChildOptions;
                this.state.options.splice(index, 1, newParent);
                this.setState({ options: [...this.state.options] });
                this.props.onOptionsChange(this.state.options);
            }
        }
    }

    renderList() {
        return this.state.options.map((option) => {
            return (
                <React.Fragment key={option.optionName}>
                    <div className="row" key={option.optionName}>
                        <div className="col-lg-3"></div>
                        <div className="col-lg-9 word-break">
                            <label>Option Name :</label> <u>{option.optionName}</u>
                            <i className="fa fa-times-circle cursor-pointer color-red" style={{ marginLeft: '10px' }} onClick={() => this.onRemove('', option.optionName)}></i>
                            <br />
                            <label>Type :</label> {option.optionType}
                            {option && option.options && this.renderOptions(option.optionName, option.options)}
                        </div>
                    </div>
                </React.Fragment >
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                <label className="label">Options (optional)</label>
                {this.props.optionsError && <span className="text-danger word-break">{this.props.optionsError}</span>}
                <div style={{ border: '1px dotted', padding: '10px', marginBottom: '15px' }}>
                    {this.renderList()}
                    <div className="row">
                        <div className="col-lg-3">
                            <label className="label" style={{ lineHeight: '4' }}>Option Name</label>
                        </div>
                        <div className="col-lg-9">
                            <Field type="text" name="optionName" component={renderInput} placeholder="Enter Option Name" validate={[maxLength50]} maxLength="50" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                            <label className="label" style={{ lineHeight: '4' }}>Type</label>
                        </div>
                        <div className="col-lg-3">
                            <Field type="select" name="optionType" component={renderSelect} tabIndex="-1">
                                <option key="mandatory" value="Mandatory">Mandatory</option>
                                <option key="optional" value="Optional">Optional</option>
                            </Field>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-3">
                            <label className="label" style={{ lineHeight: '4' }}>Option</label>
                        </div>
                        <div className="col-lg-9">
                            <Field type="text" name="option" component={renderInput} placeholder="Enter Option" validate={[maxLength50]} maxLength="50" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                            <label className="label" style={{ lineHeight: '4' }}>Extra Price</label>
                        </div>
                        <div className="col-lg-4">
                            <Field type="text" name="extraPrice" component={renderInput} placeholder="Enter Price" validate={[number, zeroPositive]} maxLength="17" />
                        </div>
                        <div className="col-lg-5">
                            <Field type="select" name="extraPriceUnit" component={renderSelect} tabIndex="-1">
                                {
                                    this.props.priceUnits && this.props.priceUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                            <label className="label" style={{ lineHeight: '4' }}>Extra Weight</label>
                        </div>
                        <div className="col-lg-4">
                            <Field type="text" name="extraWeight" component={renderInput} placeholder="Enter Weight" validate={[number, zeroPositive]} maxLength="17" />
                        </div>
                        <div className="col-lg-5">
                            <Field type="select" name="extraWeightUnit" component={renderSelect} tabIndex="-1">
                                {
                                    this.props.weightUnits && this.props.weightUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="col-lg-6">
                            <button type="button" className="btn btn=sm btn-primary" onClick={this.addAnotherOption}>Add Option</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="col-lg-6 text-danger-div word-break" style={{ width: "100%", textAlign: 'center' }}>
                            {this.state.errorMessage && <span className="text-danger">{this.state.errorMessage}</span>}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default Options;