import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';
import * as types from '@app/types/_index';

const initialState: api.Query[] = [];

export function queriesReducer(
  state = initialState,
  action: types.QueriesActions
): api.Query[] {
  switch (action.type) {
    case actionTypes.UPDATE_QUERIES_STATE: {
      let newState = [...state];

      action.payload.forEach(cv => {
        let index = newState.findIndex(query => query.query_id === cv.query_id);

        if (index >= 0) {
          if (cv.server_ts > newState[index].server_ts) {
            newState = [
              ...newState.slice(0, index),
              cv,
              ...newState.slice(index + 1)
            ];
          }
        } else {
          newState.push(cv);
        }
      });

      return newState;
    }

    case actionTypes.RESET_QUERIES_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_QUERIES_STATE: {
      return state;
    }

    case actionTypes.FILTER_QUERIES_STATE: {
      let newState = state.filter(
        query =>
          action.payload.query_ids.indexOf(query.query_id) > -1 ||
          query.is_pdt === true // query component sets live query without pdt deps
      );

      return newState;
    }

    default: {
      return state;
    }
  }
}
