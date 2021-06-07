import React from 'react'
import renderErrorClass from './renderErrorClass';

const renderDimensionInput = ({ input, meta, type, placeholder, maxLength, readOnly, disabled }) => {
    return (
        <input {...input} className={renderErrorClass(meta)} placeholder={placeholder} type={type} maxLength={maxLength} autoComplete="off" readOnly={readOnly} disabled={disabled} />
    );
}
export default renderDimensionInput;