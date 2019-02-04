import { ActionReducer } from '@ngrx/store';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';

export function segmentMetaReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return (state, action) => {
    if (action.type === actionTypes.CHANGE_ROUTER_URL) {
      // analytics.track(action.type, {
      //   url: (<ChangeRouterUrlAction>action).payload
      // });
      analytics.page();
    } else if (action.type === actionTypes.GET_STATE_SUCCESS) {
      analytics.track(action.type);
      let user = (<actions.GetStateSuccessAction>action).payload.state.user;
      analytics.identify(user.user_track_id, {
        name: `${user.first_name} ${user.last_name}`,
        email: user.user_id
      });
    } else if (action.type === actionTypes.UPDATE_LAYOUT_FILE_ID) {
      analytics.track(action.type, {
        file_id: `${(<actions.UpdateLayoutFileIdAction>action).payload}`
      });
    } else if (action.type === actionTypes.UPDATE_LAYOUT_MODEL_ID) {
      analytics.track(action.type, {
        model_id: `${(<actions.UpdateLayoutModelIdAction>action).payload}`
      });
    } else if (action.type === actionTypes.UPDATE_LAYOUT_DASHBOARD_ID) {
      analytics.track(action.type, {
        dashboard_id: `${
          (<actions.UpdateLayoutDashboardIdAction>action).payload
        }`
      });
    } else if (
      [
        actionTypes.GET_STATE,

        actionTypes.CREATE_FILE,
        actionTypes.SAVE_FILE,
        actionTypes.DELETE_FILE,
        actionTypes.MOVE_FILE,

        actionTypes.CREATE_FOLDER,
        actionTypes.DELETE_FOLDER,
        actionTypes.RENAME_FOLDER,

        actionTypes.SET_LAYOUT_MODE_DEV,
        actionTypes.SET_LAYOUT_MODE_PROD,
        actionTypes.SET_LAYOUT_NEED_SAVE_TRUE,
        actionTypes.SET_LAYOUT_NEED_SAVE_FALSE,

        actionTypes.CREATE_MCONFIG,
        actionTypes.CREATE_MEMBER,
        actionTypes.EDIT_MEMBER,
        actionTypes.DELETE_MEMBER,

        actionTypes.CREATE_DASHBOARD,
        actionTypes.CREATE_MCONFIG_AND_QUERY,
        actionTypes.CREATE_PROJECT,

        actionTypes.SET_PROJECT_CREDENTIALS,
        actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT,
        actionTypes.SET_PROJECT_WEEK_START,
        actionTypes.SET_PROJECT_TIMEZONE,

        actionTypes.DELETE_PROJECT,

        actionTypes.CANCEL_QUERIES,
        actionTypes.RUN_QUERIES,

        actionTypes.SET_USER_NAME,
        actionTypes.SET_USER_THEMES,
        actionTypes.SET_USER_TIMEZONE,
        actionTypes.SET_USER_PICTURE,

        actionTypes.COMMIT_REPO,
        actionTypes.PULL_REPO,
        actionTypes.PUSH_REPO,
        actionTypes.REGENERATE_REPO_REMOTE_PUBLIC_KEY,
        actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK,
        actionTypes.REVERT_REPO_TO_PRODUCTION,
        actionTypes.REVERT_REPO_TO_LAST_COMMIT,
        actionTypes.SET_REPO_REMOTE_URL,

        actionTypes.CANCEL_SUBSCRIPTIONS,
        actionTypes.SWITCH_ANALYTICS_SUBSCRIPTION_PLAN
      ].indexOf(action.type) > -1
    ) {
      analytics.track(action.type);
    }

    return reducer(state, action);
  };
}
