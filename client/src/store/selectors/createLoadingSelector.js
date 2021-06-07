export const createLoadingSelector = (actions) => (state) => {
    return actions.some(action => state.loading[action]);
};
