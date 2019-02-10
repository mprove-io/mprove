import * as actionTypes from '@app/store-action-types/index';
import * as interfaces from '@app/interfaces/_index';
import * as types from '@app/types/_index';

const initialState: interfaces.LqState = {
  live_queries: [],
  server_ts: 1
};

export function lqReducer(
  state = initialState,
  action: types.LiveQueriesActions
): interfaces.LqState {
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
