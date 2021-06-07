import React from 'react'

const Spinner = ({ isLoading }) => {
    if (isLoading)
        return <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    else
        return <React.Fragment></React.Fragment>
}

export default Spinner;