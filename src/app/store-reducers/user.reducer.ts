import * as actionTypes from '@app/store-actions/action-types';
import * as interfaces from '@app/interfaces/_index';
import * as types from '@app/types/_index';

const initialState: interfaces.UserState = {
  user_id: undefined,
  user_track_id: undefined,
  alias: undefined,
  first_name: undefined,
  last_name: undefined,
  picture_url_small: undefined,
  picture_url_big: undefined,
  timezone: undefined,
  status: undefined,
  deleted: undefined,
  dash_theme: undefined,
  file_theme: undefined,
  main_theme: undefined,
  sql_theme: undefined,
  server_ts: null,

  loading: false,
  loaded: false
};

export function userReducer(
  state = initialState,
  action: types.UserActions
): interfaces.UserState {
  switch (action.type) {
    case actionTypes.UPDATE_USER_STATE: {
      if (action.payload.server_ts > state.server_ts) {
        return Object.assign({}, state, action.payload, { loaded: true });
      } else {
        return state;
      }
    }

    case actionTypes.RESET_USER_STATE: {
      return Object.assign({}, initialState);
    }

    default: {
      return state;
    }
  }
}
