import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as types from 'src/app/types/_index';

const initialState: api.Model[] = [];

export function modelsReducer(state = initialState, action: types.ModelsActions): api.Model[] {

  switch (action.type) {

    case actionTypes.UPDATE_MODELS_STATE: {
      let newState = [...state];

      action.payload.forEach((cv) => {
        let index = newState.findIndex((model) =>
          model.project_id === cv.project_id &&
          model.repo_id === cv.repo_id &&
          model.model_id === cv.model_id
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

    case actionTypes.RESET_MODELS_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_MODELS_STATE: {

      let newState = state.filter(model =>
        model.project_id !== action.payload.project_id ||
        model.repo_id !== action.payload.repo_id ||
        model.struct_id === action.payload.struct_id
      );

      return newState;
    }

    default: {
      return state;
    }

  }
}
