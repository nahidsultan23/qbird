import React from 'react'
import { Field } from 'redux-form';

import renderInput from '../../constants/forms/renderInput';
import { maxLength100 } from '../../constants/forms/fieldLevelValidation';

class Specifications extends React.Component {

    state = {
        specifications: [],
        errorMessage: null,
        maximumSpecifications: 100
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.state.specifications && nextProps.specifications && this.state.specifications.length !== nextProps.specifications.length) {
            this.setState({ specifications: nextProps.specifications })
        }
    }

    addAnotherSpecification = () => {
        this.setState({ errorMessage: '' });
        const { specificationName, specification } = this.props.formValues;
        const pCount = this.state.specifications.length;
        if (specificationName && specificationName.trim() && specification && specification.trim()) {
            let pIndex = this.state.specifications.findIndex(p => p.specificationName === specificationName);
            if (pIndex === -1) {
                if (pCount >= this.state.maximumSpecifications) {
                    this.setState({ errorMessage: `You can add maximum ${this.state.maximumSpecifications} Specifications` });
                } else {
                    let newSpecifications = this.state.specifications;
                    newSpecifications.push({ 
                        specificationName: specificationName,
                        specification: specification
                    });
                    this.setState({ specifications: newSpecifications });
                    this.props.onSpecificationsChange(this.state.specifications);
                }
            } else {
                this.setState({ errorMessage: `${specificationName} already exists` });
                return;
            }
        } else {
            this.setState({ errorMessage: 'Both fields are required' });
        }
    }

    onRemove = (name) => {
        let changedSpecifications = this.state.specifications.filter(o => o.specificationName !== name);
        this.setState({ specifications: changedSpecifications });
        this.props.onSpecificationsChange(changedSpecifications);
    }

    renderSpecifications = (specifications) => {
        return specifications.map((specification, index) => {
            return (
                <React.Fragment key={specification.specificationName + index}>
                    <div key={specification.specificationName + index} style={{ marginLeft: '20px' }} className="word-break">
                        <label>{specification.specificationName} :</label> {specification.specification}
                        <i className="fa fa-times-circle cursor-pointer color-red" style={{ marginLeft: '10px' }} onClick={() => this.onRemove(specification.specificationName)}></i>
                        <br />
                    </div>
                </React.Fragment>
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                <label className="label">Other Specifications (optional)</label>
                {this.props.specificationsError && <span className="text-danger word-break">{this.props.specificationsError}</span>}
                <div style={{ border: '1px dotted', padding: '10px', marginBottom: '15px' }}>
                    {this.state.specifications.length ? <div className="specifications-div">
                        {this.renderSpecifications(this.state.specifications)}
                    </div> : ''}
                    <div className="row">
                        <div className="col-lg-6">
                            <Field type="text" name="specificationName" label="Specification Name" component={renderInput} placeholder="Enter Specification Name" validate={[maxLength100]} maxLength="100" />
                        </div>
                        <div className="col-lg-6">
                            <Field type="text" name="specification" label="Specification" component={renderInput} placeholder="Enter Specification" validate={[maxLength100]} maxLength="100" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="col-lg-6">
                            <button type="button" className="btn btn=sm btn-primary" onClick={this.addAnotherSpecification}>Add Specification</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="col-lg-6 text-danger-div word-break" style={{ textAlign: 'center' }}>
                            {this.state.errorMessage && <span className="text-danger">{this.state.errorMessage}</span>}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default Specifications;