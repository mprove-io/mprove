import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.SwError[] = [];

export function errorsReducer(state = initialState, action: types.ErrorsActions): api.SwError[] {

  switch (action.type) {

    case actionTypes.UPDATE_ERRORS_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((error) => error.error_id === cv.error_id);

        if (index >= 0) {

          if (cv.server_ts > newState[index].server_ts) {
            newState = [
              ...newState.slice(0, index),
              cv,
              ...newState.slice(index + 1)];
          }

        } else {
          newState.push(cv);
        }

      });

      return newState;
    }

    case actionTypes.RESET_ERRORS_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_ERRORS_STATE: {

      let newState = state.filter(error =>
        error.project_id !== action.payload.project_id ||
        error.repo_id !== action.payload.repo_id ||
        error.struct_id === action.payload.struct_id
      );

      return newState;
    }

    default: {
      return state;
    }

  }
}
