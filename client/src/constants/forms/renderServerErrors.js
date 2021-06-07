import { SubmissionError } from 'redux-form';

const renderServerErrors = ({ errorMessage }) => {
    if (errorMessage && errorMessage !== null && errorMessage !== undefined) {
        Object.keys(errorMessage).forEach((key) => {
            if (key !== 'fatalError' && errorMessage[key] !== null && errorMessage[key] !== undefined && errorMessage[key].trim() !== '') {
                throw new SubmissionError({
                    [key]: errorMessage[key],
                    _error: 'Errors returned from server.'
                });
            }
        });
    }
};

export default renderServerErrors;