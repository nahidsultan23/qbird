const renderErrorClass = ({ touched, error }) => {
    let className = 'form-control';
    if (touched && error)
        className = `${className} is-invalid`;
    return className;
};

export default renderErrorClass;