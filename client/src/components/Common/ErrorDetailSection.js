import React from 'react';
import { Link } from 'react-router-dom';

const ErrorDetailSection = (props) => {
    return (
        <section className="error-area ptb-60">
            <div className="container">
                <div className="error-content">
                    <h3>{props.title ? props.title : "Fatal Error"}</h3>
                    <p>{props.errorMessage}</p>

                    {(props.page === 'Home') ? <a href="/" className="btn btn-light">Refresh Home</a> :
                    <Link to={'/'} className="btn btn-light">Go to Home</Link>}
                </div>
            </div>
        </section>
    )
}
export default ErrorDetailSection;