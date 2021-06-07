import React from 'react'

const renderCheckbox = ({ input, type, label, disabled }) => {
    const { name } = input;
    return (
        <div className="form-group">
            <div className="form-check">
                <input className="form-check-input" {...input} type={type} id={name} disabled={disabled} />
                <label className="form-check-label" style={{ color: '#666666' }} htmlFor={name}>{label}</label>
            </div>
        </div>
    );
}

export default renderCheckbox;

