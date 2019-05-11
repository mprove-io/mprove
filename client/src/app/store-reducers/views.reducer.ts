import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';
import * as types from '@app/types/_index';

const initialState: api.View[] = [];

export function viewsReducer(
  state = initialState,
  action: types.ViewsActions
): api.View[] {
  switch (action.type) {
    case actionTypes.UPDATE_VIEWS_STATE: {
      let newState = [...state];

      action.payload.forEach(cv => {
        let index = newState.findIndex(
          view =>
            view.project_id === cv.project_id &&
            view.repo_id === cv.repo_id &&
            view.view_id === cv.view_id
        );

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

    case actionTypes.RESET_VIEWS_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_VIEWS_STATE: {
      let newState = state.filter(
        view =>
          view.project_id !== action.payload.project_id ||
          view.repo_id !== action.payload.repo_id ||
          view.struct_id === action.payload.struct_id
      );

      return newState;
    }

    default: {
      return state;
    }
  }
}
