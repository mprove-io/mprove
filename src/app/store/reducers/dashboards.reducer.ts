import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as types from '@app/types/_index';

const initialState: api.Dashboard[] = [];

export function dashboardsReducer(
  state = initialState,
  action: types.DashboardsActions
): api.Dashboard[] {
  switch (action.type) {
    case actionTypes.UPDATE_DASHBOARDS_STATE: {
      let newState = [...state];

      action.payload.forEach(cv => {
        let index = newState.findIndex(
          dashboard =>
            dashboard.project_id === cv.project_id &&
            dashboard.repo_id === cv.repo_id &&
            dashboard.dashboard_id === cv.dashboard_id
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

    case actionTypes.RESET_DASHBOARDS_STATE: {
      return [...initialState];
    }

    case actionTypes.CLEAN_DASHBOARDS_STATE: {
      let newState = state.filter(
        dashboard =>
          dashboard.project_id !== action.payload.project_id ||
          dashboard.repo_id !== action.payload.repo_id ||
          dashboard.struct_id === action.payload.struct_id
      );

      return newState;
    }

    default: {
      return state;
    }
  }
}
