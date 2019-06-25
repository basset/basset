const createReducer = (intialState, handlers) => (
  state = intialState,
  action,
) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type](state, action)
    : state;

export default createReducer;
