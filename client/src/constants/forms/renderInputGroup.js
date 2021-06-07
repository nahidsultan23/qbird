import React from 'react'
import renderErrorClass from './renderErrorClass';

const renderInputGroup = ({ input, meta, type, label, placeholder, maxLength, readOnly, disabled, groupText }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="input-group mb-3">
                <input {...input} className={renderErrorClass(meta)} placeholder={placeholder} type={type} maxLength={maxLength} autoComplete="off" readOnly={readOnly} disabled={disabled} />
                <div className="input-group-append">
                    <span className="input-group-text" id="basic-addon2">{groupText}</span>
                </div>
                {meta.touched && meta.error && <div className="invalid-feedback">{meta.error}</div>}
            </div>
        </div>
    );
}
export default renderInputGroup;

