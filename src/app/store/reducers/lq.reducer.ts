import * as actionTypes from 'src/app/store/action-types';
import * as interfaces from 'src/app/interfaces/_index';
import * as types from 'src/app/types/_index';

const initialState: interfaces.LqState = {
  live_queries: [],
  server_ts: 1,
};

export function lqReducer(state = initialState, action: types.LiveQueriesActions): interfaces.LqState {
  switch (action.type) {
    case actionTypes.SET_LIVE_QUERIES_SUCCESS: {
      if (action.payload.server_ts > state.server_ts) {
        return Object.assign({}, state, action.payload);
      } else {
        return state;
      }
    }
    default: {
      return state;
    }
  }
}
