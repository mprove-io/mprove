import * as actionTypes from '@app/store-actions/action-types';
import * as interfaces from '@app/interfaces/_index';
import * as types from '@app/types/_index';

const initialState: interfaces.WebSocketState = {
  init_id: null,
  is_open: false
};

export function webSocketReducer(
  state = initialState,
  action: types.WebSocketActions
): interfaces.WebSocketState {
  switch (action.type) {
    case actionTypes.UPDATE_WEBSOCKET_INIT_ID: {
      return Object.assign({}, state, { init_id: action.payload });
    }

    case actionTypes.RESET_WEBSOCKET_STATE: {
      return Object.assign({}, initialState);
    }

    case actionTypes.OPEN_WEBSOCKET_SUCCESS: {
      return Object.assign({}, state, { is_open: true });
    }

    case actionTypes.CLOSE_WEBSOCKET_SUCCESS: {
      return Object.assign({}, state, { is_open: false });
    }

    default: {
      return state;
    }
  }
}
