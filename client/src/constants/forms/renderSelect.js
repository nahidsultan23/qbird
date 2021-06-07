import React from 'react'
import renderErrorClass from './renderErrorClass';

const renderSelect = ({ input, meta, type, label, children, defaulValue, disabled, tabIndex }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <select {...input} className={renderErrorClass(meta)} type={type} disabled={disabled ? 'disable' : ''} tabIndex={tabIndex}>
                {children}
            </select>
            {meta.touched && meta.error && <div className="invalid-feedback">{meta.error}</div>}
        </div>);
};

export default renderSelect;