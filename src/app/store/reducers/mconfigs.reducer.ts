import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as types from 'app/types/_index';

const initialState: api.Mconfig[] = [];

export function mconfigsReducer(state = initialState, action: types.MconfigsActions): api.Mconfig[] {

  switch (action.type) {

    case actionTypes.UPDATE_MCONFIGS_STATE: {

      let newState = [...state];

      action.payload.forEach((cv) => {

        let index = newState.findIndex((mconfig) => mconfig.mconfig_id === cv.mconfig_id);

        if (index >= 0) {

          newState = [
            ...newState.slice(0, index),
            cv,
            ...newState.slice(index + 1)
          ];

        } else {
          newState.push(cv);
        }

      });

      return newState;
    }

    case actionTypes.RESET_MCONFIGS_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_MCONFIGS_STATE: {

      let newState = state.filter(mconfig =>
        mconfig.project_id !== action.payload.project_id ||
        mconfig.repo_id !== action.payload.repo_id ||
        mconfig.struct_id === action.payload.struct_id
      );

      return newState;
    }

    default: {
      return state;
    }

  }
}
