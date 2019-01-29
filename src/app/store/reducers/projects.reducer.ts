import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';
import * as types from '@app/types/_index';

const initialState: api.Project[] = [];

export function projectsReducer(
  state = initialState,
  action: types.ProjectsActions
): api.Project[] {
  switch (action.type) {
    case actionTypes.UPDATE_PROJECTS_STATE: {
      let newState = [...state];

      action.payload.forEach(cv => {
        let index = newState.findIndex(
          project => project.project_id === cv.project_id
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

    case actionTypes.REMOVE_PROJECT: {
      let newState = [...state];

      let index = newState.findIndex(
        project => project.project_id === action.payload
      );

      if (index >= 0) {
        newState = [...newState.slice(0, index), ...newState.slice(index + 1)];
      }

      return newState;
    }

    case actionTypes.RESET_PROJECTS_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }
  }
}
