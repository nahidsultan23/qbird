import React from 'react'
import renderErrorClass from './renderErrorClass';

const renderTextarea = ({ input, meta, label, placeholder, maxLength, rows, cols, readOnly, disabled }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <textarea {...input} className={renderErrorClass(meta)} placeholder={placeholder} maxLength={maxLength}
                rows={rows} cols={cols} readOnly={readOnly} disabled={disabled} />
            {meta.touched && meta.error && <div className="invalid-feedback">{meta.error}</div>}
        </div>
    );
}
export default renderTextarea;