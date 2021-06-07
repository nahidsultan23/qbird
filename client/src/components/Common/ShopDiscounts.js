import React from 'react'
import { Field } from 'redux-form';

import renderSelect from '../../constants/forms/renderSelect';
import renderInput from '../../constants/forms/renderInput';
import renderInputGroup from '../../constants/forms/renderInputGroup';
import { number, zeroPositive, nonZeroPositive, maxValue100 } from '../../constants/forms/fieldLevelValidation';
import { twoDecimalPoints, thousandSeparators } from '../../services/common';

class ShopDiscounts extends React.Component {

    state = {
        discounts: [],
        errorMessage: null,
        maximumOptions: 50
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.state.discounts && nextProps.discounts && this.state.discounts.length !== nextProps.discounts.length) {
            this.setState({ discounts: nextProps.discounts })
        }
    }

    addAnotherDiscount = () => {
        this.setState({ errorMessage: '' });
        const { discountOn, discountType, discount, discountUnit, minOrder, minOrderUnit, maxOrder, maxOrderUnit, maxAmount, maxAmountUnit } = this.props.formValues;
        const pCount = this.state.discounts.length;
        if (discountOn && discountType && discount) {
            if (pCount >= this.state.maximumOptions) {
                this.setState({ errorMessage: `You can add maximum ${this.state.maximumOptions} Discounts` });
            } else {
                if((discountType === "Percentage") && (discount > 100)) {
                    this.setState({ errorMessage: `Discount cannot be bigger than 100%` });
                }
                else {
                    let newDiscounts = this.state.discounts;
                    newDiscounts.push({
                        discountOn: discountOn,
                        discountType: discountType,
                        discount: discount,
                        discountUnit: discountUnit,
                        minOrder: minOrder,
                        minOrderUnit: minOrderUnit,
                        maxOrder: maxOrder,
                        maxOrderUnit: maxOrderUnit,
                        maxAmount: (discountType === "Percentage") ? maxAmount : undefined,
                        maxAmountUnit: maxAmountUnit
                    });
                    this.setState({ discounts: newDiscounts });
                    this.props.onDiscountsChange(this.state.discounts);
                }
            }
        } else {
            this.setState({ errorMessage: 'Discount on, Discount Type and Discount fields are required' });
        }
    }

    onRemove = (index) => {
        const pCount = this.state.discounts.length;
        if(index < pCount) {
            let changedDiscounts = this.state.discounts;
            changedDiscounts.splice(index, 1);
            this.setState({ discounts: changedDiscounts });
            this.props.onDiscountsChange(changedDiscounts);
        }
    }

    renderList() {
        return this.state.discounts.map((discount, index) => {
            return (
                <React.Fragment key={index}>
                    <div className="row" key={index}>
                        <div className="col-lg-3"></div>
                        <div className="col-lg-9 word-break">
                            <label>Discount on :</label> {discount.discountOn}
                            <i className="fa fa-times-circle cursor-pointer color-red" style={{ marginLeft: '10px' }} onClick={() => this.onRemove(index)}></i>
                            <div style={{ marginLeft: '20px' }}>
                                <label>Discount Type :</label> {discount.discountType}
                                <br />
                                <label>Discount :</label> {thousandSeparators(twoDecimalPoints(discount.discount))}{(discount.discountType === "Percentage") ? "%" : " " + discount.discountUnit}
                                <br />
                                {discount.minOrder ? <span><label>Minimum Order Amount :</label> {thousandSeparators(twoDecimalPoints(discount.minOrder))} {discount.minOrderUnit}<br /></span> : ""}
                                {discount.maxOrder ? <span><label>Maximum Order Amount :</label> {thousandSeparators(twoDecimalPoints(discount.maxOrder))} {discount.maxOrderUnit}<br /></span> : ""}
                                {discount.maxAmount ? <span><label>Maximum Discount Amount :</label> {thousandSeparators(twoDecimalPoints(discount.maxAmount))} {discount.maxAmountUnit}<br /></span> : ""}
                                <br />
                            </div>
                        </div>
                        <br />
                    </div>
                </React.Fragment >
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                <label className="label">Discounts (optional)</label>
                {this.props.discountsError && <span className="text-danger word-break">{this.props.discountsError}</span>}
                <div style={{ border: '1px dotted', padding: '10px', marginBottom: '15px' }}>
                    {this.renderList()}
                    <Field type="select" name="discountOn" component={renderSelect} label="Discount on">
                        <option key="shipping-charge" value="Shipping Charge">Shipping Charge</option>
                        <option key="subtotal" value="Subtotal">Subtotal</option>
                        <option key="total" value="Total">Total</option>
                    </Field>
                    <Field type="select" name="discountType" component={renderSelect} label="Discount Type">
                        <option key="percentage" value="Percentage">Percentage</option>
                        <option key="amount" value="Amount">Amount</option>
                    </Field>
                    <div className="row">
                        <div className="col-lg-6">
                            {this.props.formValues && (this.props.formValues.discountType === "Percentage") ? <Field type="text" name="discount" placeholder="Enter Discount" component={renderInputGroup} label="Discount" groupText={'%'} validate={[number, nonZeroPositive, maxValue100]}  maxLength="5" /> : <Field type="text" name="discount" component={renderInput} placeholder="Enter Discount" label="Discount" validate={[number, nonZeroPositive]} maxLength="18" />}
                        </div>
                        {this.props.formValues && (this.props.formValues.discountType === "Amount") && <div className="col-lg-6">
                            <Field type="select" name="discountUnit" component={renderSelect} label="Unit">
                                {
                                    this.props.priceUnits && this.props.priceUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>}
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <Field type="text" name="minOrder" component={renderInput} placeholder="Enter Minimum Order Amount" label="Minimum Order Amount (optional)" validate={[number, zeroPositive]} maxLength="18" />
                        </div>
                        <div className="col-lg-6">
                            <Field type="select" name="minOrderUnit" component={renderSelect} label="Unit">
                                {
                                    this.props.priceUnits && this.props.priceUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <Field type="text" name="maxOrder" component={renderInput} placeholder="Enter Maximum Order Amount" label="Maximum Order Amount (optional)" validate={[number, nonZeroPositive]} maxLength="18" />
                        </div>
                        <div className="col-lg-6">
                            <Field type="select" name="maxOrderUnit" component={renderSelect} label="Unit">
                                {
                                    this.props.priceUnits && this.props.priceUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>
                    </div>
                    {this.props.formValues && (this.props.formValues.discountType === "Percentage") && <div className="row">
                        <div className="col-lg-6">
                            <Field type="text" name="maxAmount" component={renderInput} placeholder="Enter Maximum Discount Amount" label="Maximum Discount Amount (optional)" validate={[number, nonZeroPositive]} maxLength="18" />
                        </div>
                        <div className="col-lg-6">
                            <Field type="select" name="maxAmountUnit" component={renderSelect} label="Unit">
                                {
                                    this.props.priceUnits && this.props.priceUnits.map((pu, i) => {
                                        return <option key={i} value={pu}>{pu}</option>
                                    })
                                }
                            </Field>
                        </div>
                    </div>}
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="col-lg-6">
                            <button type="button" className="btn btn=sm btn-primary" onClick={this.addAnotherDiscount}>Add Discount</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-3">
                        </div>
                        <div className="text-danger-div word-break" style={{ width: "100%", textAlign: 'center' }}>
                            {this.state.errorMessage && <span className="text-danger">{this.state.errorMessage}</span>}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default ShopDiscounts;