import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.Repo[] = [];

export function reposReducer(state = initialState, action: types.ReposActions): api.Repo[] {

  switch (action.type) {

    case actionTypes.UPDATE_REPOS_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((repo) =>
          repo.repo_id === cv.repo_id &&
          repo.project_id === cv.project_id);

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

    case actionTypes.RESET_REPOS_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }

  }
}
