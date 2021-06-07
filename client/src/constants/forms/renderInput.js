import React from 'react'
import renderErrorClass from './renderErrorClass';

const renderInput = ({ input, meta, type, label, placeholder, maxLength, readOnly, disabled }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input {...input} className={renderErrorClass(meta)} placeholder={placeholder} type={type} maxLength={maxLength} autoComplete="off" readOnly={readOnly} disabled={disabled} />
            {meta.touched && meta.error && <div className="invalid-feedback">{meta.error}</div>}
        </div>
    );
}
export default renderInput;