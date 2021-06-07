import React from 'react'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux';

import history from '../../history';
import { srs } from '../../services/srs';
import { createLoadingSelector } from '../../store/selectors/createLoadingSelector';

class SearchForm extends React.Component {

    onSubmit = (formValues) => {
        formValues.searchString = formValues.searchString ? formValues.searchString : "";
        history.push(this.getUrl(formValues));
        this.props.change("searchString", "");
        this.props.change("category", "");
        srs.emitEvent(formValues);
    }

    getUrl = ({ category, searchString }) => {
        let url = "/search-result?searchFor=ads";
        if(category) {
            url = url + `&category=${category}`;
        }
        if (searchString && searchString !== "")
            url += `&searchString=${searchString}`;
        return url;
    }

    render() {
        const { categories, handleSubmit, submitting, formValues, isFiltering } = this.props;
        return (
            <div>
                <form onSubmit={handleSubmit(this.onSubmit)}>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <Field name="category" component="select" className="form-control form-control-sm search-form-select nav-category" title={formValues && formValues.category}>
                                <option value="">All</option>
                                {categories.map((category, index) => {
                                    return <option key={category.categoryName} value={category.categoryName}>{category.categoryName}</option>
                                })}
                            </Field>
                        </div>
                        <Field type="text" name="searchString" component="input" className="form-control form-control-sm nav-search-box" placeholder="Search" aria-label="Search" autoComplete="off" />
                        <button className="search-button nav-search-btn" type="submit" disabled={submitting || isFiltering}><i className="fas fa-search"></i></button>
                    </div>
                </form>
            </div>
        )
    }
}
SearchForm = reduxForm({
    form: 'search-form',
    initialValues: {
        country: 'Bangladesh',
        language: 'English',
        category: ''
    },
    onSubmitFail: (errors) => {
        if(errors && document.querySelector(`[name="${Object.keys(errors)[0]}"]`)) {
            document.querySelector(`[name="${Object.keys(errors)[0]}"]`).focus();
        }
    }
})(SearchForm);
const mapStateToProps = (state) => {
    return {
        isFiltering: createLoadingSelector(['SEARCH_RESULT_ADS'])(state)
    }
}
export default connect(mapStateToProps)(SearchForm);