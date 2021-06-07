import React from 'react';
import { Link } from 'react-router-dom';

const NoContentFound = () => {
    return (
        <section className="error-area ptb-60">
            <div className="container">
                <div className="error-content">
                    <h3>Content Unavailable</h3>
                    <p>The content you are looking for might have been removed, had its name changed or, is temporarily unavailable.</p>

                    <Link to={'/'} className="btn btn-light">Go to Home</Link>
                </div>
            </div>
        </section>
    )
}
export default NoContentFound;