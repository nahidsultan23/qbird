// history is a seperate package in react router dom.
// no need to install
// automatically installed with react router dom
const createHistory = require("history").createBrowserHistory;

// history object created
export default createHistory();
// now make sure to use the plain router rather than browser router