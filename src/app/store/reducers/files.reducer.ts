import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.CatalogFile[] = [];

export function filesReducer(state = initialState, action: types.FilesActions): api.CatalogFile[] {

  switch (action.type) {

    case actionTypes.UPDATE_FILES_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((file) =>
          file.project_id === cv.project_id &&
          file.repo_id === cv.repo_id &&
          file.file_id === cv.file_id
        );

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

    case actionTypes.RESET_FILES_STATE: {
      return [...initialState];
    }

    default: {
      return state;
    }

  }
}
