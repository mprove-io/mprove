import * as actionTypes from '@app/store-actions/action-types';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as types from '@app/types/_index';
import * as constants from '@app/constants/_index';

const initialState: interfaces.LayoutState = {
  project_id: undefined,
  mode: enums.LayoutModeEnum.Prod,
  file_id: undefined,
  need_save: false,
  mconfig_id: undefined,
  model_id: undefined,
  dashboard_id: undefined,
  query_id: undefined,
  chart_id: undefined,
  dry: undefined,
  last_ws_msg_ts: undefined,
  email_to_verify: undefined,
  email_to_reset_password: undefined
};

export function layoutReducer(
  state = initialState,
  action: types.LayoutActions
): interfaces.LayoutState {
  switch (action.type) {
    case actionTypes.UPDATE_LAYOUT_EMAIL_TO_VERIFY: {
      return Object.assign({}, state, { email_to_verify: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_EMAIL_TO_RESET_PASSWORD: {
      return Object.assign({}, state, {
        email_to_reset_password: action.payload
      });
    }

    case actionTypes.UPDATE_LAYOUT_PROJECT_ID: {
      return Object.assign({}, state, { project_id: action.payload });
    }

    case actionTypes.SET_LAYOUT_MODE_DEV: {
      return Object.assign({}, state, { mode: enums.LayoutModeEnum.Dev });
    }

    case actionTypes.SET_LAYOUT_MODE_PROD: {
      return Object.assign({}, state, { mode: enums.LayoutModeEnum.Prod });
    }

    case actionTypes.SET_LAYOUT_NEED_SAVE_TRUE: {
      return Object.assign({}, state, { need_save: true });
    }

    case actionTypes.SET_LAYOUT_NEED_SAVE_FALSE: {
      return Object.assign({}, state, { need_save: false });
    }

    case actionTypes.UPDATE_LAYOUT_FILE_ID: {
      return Object.assign({}, state, { file_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_MCONFIG_ID: {
      return Object.assign({}, state, { mconfig_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_MODEL_ID: {
      return Object.assign({}, state, { model_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_DASHBOARD_ID: {
      return Object.assign({}, state, { dashboard_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_QUERY_ID: {
      return Object.assign({}, state, { query_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_CHART_ID: {
      return Object.assign({}, state, { chart_id: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_DRY: {
      return Object.assign({}, state, { dry: action.payload });
    }

    case actionTypes.UPDATE_LAYOUT_LAST_WS_MSG_TS: {
      return Object.assign({}, state, { last_ws_msg_ts: action.payload });
    }

    case actionTypes.RESET_LAYOUT_STATE: {
      return Object.assign({}, initialState);
    }

    default: {
      return state;
    }
  }
}
