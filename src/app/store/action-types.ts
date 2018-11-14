import { MyError } from 'app/models/my-error';

/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

let typeCache: { [label: string]: boolean } = {};

function ngrxType<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new MyError({
      name: `Action type is not unique`,
      message: `type is ${label}`
    });

    // throw new Error(`Action type "${label}" is not unique"`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}

// APP

export const RESET_STATE = ngrxType('[App] Reset State');

export const GET_STATE = ngrxType('[App] Get State');
export const GET_STATE_SUCCESS = ngrxType('[App] Get State Success');
export const GET_STATE_FAIL = ngrxType('[App] Get State Fail');

export const PROCESS_STRUCTS = ngrxType('[App] Process Structs');
export const UPDATE_STATE = ngrxType('[App] Update State');

// DASHBOARDS

export const UPDATE_DASHBOARDS_STATE = ngrxType(
  '[Dashboards] Update Dashboards State'
);
export const RESET_DASHBOARDS_STATE = ngrxType(
  '[Dashboards] Reset Dashboards State'
);
export const CLEAN_DASHBOARDS_STATE = ngrxType(
  '[Dashboards] Clean Dashboards State'
);

// ERRORS

export const UPDATE_ERRORS_STATE = ngrxType('[Errors] Update Errors State');
export const RESET_ERRORS_STATE = ngrxType('[Errors] Reset Errors State');
export const CLEAN_ERRORS_STATE = ngrxType('[Errors] Clean Errors State');

// FILES

export const UPDATE_FILES_STATE = ngrxType('[Files] Update Files State');
export const RESET_FILES_STATE = ngrxType('[Files] Reset Files State');

export const CREATE_FILE = ngrxType('[Files] Create File');
export const CREATE_FILE_SUCCESS = ngrxType('[Files] Create File Success');
export const CREATE_FILE_FAIL = ngrxType('[Files] Create File Fail');

export const SAVE_FILE = ngrxType('[Files] Save File');
export const SAVE_FILE_SUCCESS = ngrxType('[Files] Save File Success');
export const SAVE_FILE_FAIL = ngrxType('[Files] Save File Fail');

export const DELETE_FILE = ngrxType('[Files] Delete File');
export const DELETE_FILE_SUCCESS = ngrxType('[Files] Delete File Success');
export const DELETE_FILE_FAIL = ngrxType('[Files] Delete File Fail');

export const MOVE_FILE = ngrxType('[Files] Move File');
export const MOVE_FILE_SUCCESS = ngrxType('[Files] Move File Success');
export const MOVE_FILE_FAIL = ngrxType('[Files] Move File Fail');

// FOLDERS

export const CREATE_FOLDER = ngrxType('[Folders] Create Folder');
export const CREATE_FOLDER_SUCCESS = ngrxType(
  '[Folders] Create Folder Success'
);
export const CREATE_FOLDER_FAIL = ngrxType('[Folders] Create Folder Fail');

export const DELETE_FOLDER = ngrxType('[Folders] Delete Folder');
export const DELETE_FOLDER_SUCCESS = ngrxType(
  '[Folders] Delete Folder Success'
);
export const DELETE_FOLDER_FAIL = ngrxType('[Folders] Delete Folder Fail');

export const RENAME_FOLDER = ngrxType('[Folders] Rename Folder');
export const RENAME_FOLDER_SUCCESS = ngrxType(
  '[Folders] Rename Folder Success'
);
export const RENAME_FOLDER_FAIL = ngrxType('[Folders] Rename Folder Fail');

// LAYOUT

export const UPDATE_LAYOUT_PROJECT_ID = ngrxType(
  '[Layout] Update Layout Project Id'
);
export const SET_LAYOUT_MODE_DEV = ngrxType('[Layout] Set Layout Mode Dev');
export const SET_LAYOUT_MODE_PROD = ngrxType('[Layout] Set Layout Mode Prod');
export const SET_LAYOUT_NEED_SAVE_TRUE = ngrxType(
  '[Layout] Set Layout Need Save True'
);
export const SET_LAYOUT_NEED_SAVE_FALSE = ngrxType(
  '[Layout] Set Layout Need Save False'
);
export const UPDATE_LAYOUT_FILE_ID = ngrxType('[Layout] Update Layout File Id');
export const UPDATE_LAYOUT_MCONFIG_ID = ngrxType(
  '[Layout] Update Layout Mconfig Id'
);
export const UPDATE_LAYOUT_MODEL_ID = ngrxType(
  '[Layout] Update Layout Model Id'
);
export const UPDATE_LAYOUT_DASHBOARD_ID = ngrxType(
  '[Layout] Update Layout Dashboard Id'
);
export const UPDATE_LAYOUT_QUERY_ID = ngrxType(
  '[Layout] Update Layout Query Id'
);
export const UPDATE_LAYOUT_CHART_ID = ngrxType(
  '[Layout] Update Layout Chart Id'
);
export const UPDATE_LAYOUT_DRY = ngrxType('[Layout] Update Layout Dry');
export const RESET_LAYOUT_STATE = ngrxType('[Layout] Reset Layout State');
export const UPDATE_LAYOUT_LAST_WS_MSG_TS = ngrxType(
  '[Layout] Update Layout WebSocket Message TimeStamp'
);

// MCONFIGS

export const CREATE_MCONFIG = ngrxType('[Mconfigs] Create Mconfig');
export const CREATE_MCONFIG_SUCCESS = ngrxType(
  '[Mconfigs] Create Mconfig Success'
);
export const CREATE_MCONFIG_FAIL = ngrxType('[Mconfigs] Create Mconfig Fail');

export const UPDATE_MCONFIGS_STATE = ngrxType(
  '[Mconfigs] Update Mconfigs State'
);
export const RESET_MCONFIGS_STATE = ngrxType('[Mconfigs] Reset Mconfigs State');
export const CLEAN_MCONFIGS_STATE = ngrxType('[Mconfigs] Clean Mconfigs State');

// MEMBERS

export const UPDATE_MEMBERS_STATE = ngrxType('[Members] Update Members State');
export const RESET_MEMBERS_STATE = ngrxType('[Members] Reset Members State');

export const CREATE_MEMBER = ngrxType('[Members] Create Member');
export const CREATE_MEMBER_SUCCESS = ngrxType(
  '[Members] Create Member Success'
);
export const CREATE_MEMBER_FAIL = ngrxType('[Members] Create Member Fail');

export const EDIT_MEMBER = ngrxType('[Members] Edit Member');
export const EDIT_MEMBER_SUCCESS = ngrxType('[Members] Edit Member Success');
export const EDIT_MEMBER_FAIL = ngrxType('[Members] Edit Member Fail');

export const DELETE_MEMBER = ngrxType('[Members] Delete Member');
export const DELETE_MEMBER_SUCCESS = ngrxType(
  '[Members] Delete Member Success'
);
export const DELETE_MEMBER_FAIL = ngrxType('[Members] Delete Member Fail');

// MODELS

export const UPDATE_MODELS_STATE = ngrxType('[Models] Update Models State');
export const RESET_MODELS_STATE = ngrxType('[Models] Reset Models State');
export const CLEAN_MODELS_STATE = ngrxType('[Models] Clean Models State');

// MULTI

// see multiGetDashboardMconfigsQueries in code

export const CREATE_DASHBOARD = ngrxType('[Multi] Create Dashboard');
export const CREATE_DASHBOARD_SUCCESS = ngrxType(
  '[Multi] Create Dashboard Success'
);
export const CREATE_DASHBOARD_FAIL = ngrxType('[Multi] Create Dashboard Fail');

export const CREATE_MCONFIG_AND_QUERY = ngrxType(
  '[Multi] Create Mconfig And Query'
);
export const CREATE_MCONFIG_AND_QUERY_SUCCESS = ngrxType(
  '[Multi] Create Mconfig And Query Success'
);
export const CREATE_MCONFIG_AND_QUERY_FAIL = ngrxType(
  '[Multi] Create Mconfig And Query Fail'
);

export const SET_LIVE_QUERIES = ngrxType('[Multi] Set Live Queries');
export const SET_LIVE_QUERIES_SUCCESS = ngrxType(
  '[Multi] Set Live Queries Success'
);
export const SET_LIVE_QUERIES_FAIL = ngrxType('[Multi] Set Live Queries Fail');

// PAYMENTS

export const UPDATE_PAYMENTS_STATE = ngrxType(
  '[Payments] Update Payments State'
);
export const RESET_PAYMENTS_STATE = ngrxType('[Payments] Reset Payments State');

// PROJECTS

export const UPDATE_PROJECTS_STATE = ngrxType(
  '[Projects] Update Projects State'
);
export const REMOVE_PROJECT = ngrxType('[Projects] Remove Project');
export const RESET_PROJECTS_STATE = ngrxType('[Projects] Reset Projects State');

export const CREATE_PROJECT = ngrxType('[Projects] Create Project');
export const CREATE_PROJECT_SUCCESS = ngrxType(
  '[Projects] Create Project Success'
);
export const CREATE_PROJECT_FAIL = ngrxType('[Projects] Create Project Fail');

export const SET_PROJECT_CREDENTIALS = ngrxType(
  '[Projects] Set Project Credentials'
);
export const SET_PROJECT_CREDENTIALS_SUCCESS = ngrxType(
  '[Projects] Set Project Credentials Success'
);
export const SET_PROJECT_CREDENTIALS_FAIL = ngrxType(
  '[Projects] Set Project Credentials Fail'
);

export const SET_PROJECT_QUERY_SIZE_LIMIT = ngrxType(
  '[Projects] Set Project Query Size Limit'
);
export const SET_PROJECT_QUERY_SIZE_LIMIT_SUCCESS = ngrxType(
  '[Projects] Set Project Query Size Limit Success'
);
export const SET_PROJECT_QUERY_SIZE_LIMIT_FAIL = ngrxType(
  '[Projects] Set Project Query Size Limit Fail'
);

export const SET_PROJECT_WEEK_START = ngrxType(
  '[Projects] Set Project Week Start'
);
export const SET_PROJECT_WEEK_START_SUCCESS = ngrxType(
  '[Projects] Set Project Week Start Success'
);
export const SET_PROJECT_WEEK_START_FAIL = ngrxType(
  '[Projects] Set Project Week Start Fail'
);

export const SET_PROJECT_TIMEZONE = ngrxType('[Projects] Set Project Timezone');
export const SET_PROJECT_TIMEZONE_SUCCESS = ngrxType(
  '[Projects] Set Project Timezone Success'
);
export const SET_PROJECT_TIMEZONE_FAIL = ngrxType(
  '[Projects] Set Project Timezone Fail'
);

export const DELETE_PROJECT = ngrxType('[Projects] Delete Project');
export const DELETE_PROJECT_SUCCESS = ngrxType(
  '[Projects] Delete Project Success'
);
export const DELETE_PROJECT_FAIL = ngrxType('[Projects] Delete Project Fail');

// QUERIES

export const UPDATE_QUERIES_STATE = ngrxType('[Queries] Update Queries State');
export const RESET_QUERIES_STATE = ngrxType('[Queries] Reset Queries State');
export const CLEAN_QUERIES_STATE = ngrxType('[Queries] Clean Queries State');
export const FILTER_QUERIES_STATE = ngrxType('[Queries] Filter Queries State');

export const CANCEL_QUERIES = ngrxType('[Queries] Cancel Queries');
export const CANCEL_QUERIES_SUCCESS = ngrxType(
  '[Queries] Cancel Queries Success'
);
export const CANCEL_QUERIES_FAIL = ngrxType('[Queries] Cancel Queries Fail');

export const RUN_QUERIES = ngrxType('[Queries] Run Queries');
export const RUN_QUERIES_SUCCESS = ngrxType('[Queries] Run Queries Success');
export const RUN_QUERIES_FAIL = ngrxType('[Queries] Run Queries Fail');

export const RUN_QUERIES_DRY = ngrxType('[Queries] Run Queries Dry');
export const RUN_QUERIES_DRY_SUCCESS = ngrxType(
  '[Queries] Run Queries Dry Success'
);
export const RUN_QUERIES_DRY_FAIL = ngrxType('[Queries] Run Queries Dry Fail');

// USER

export const UPDATE_USER_STATE = ngrxType('[User] Update User State');
export const RESET_USER_STATE = ngrxType('[User] Reset User State');

export const LOGOUT_USER = ngrxType('[User] Logout User');
export const LOGOUT_USER_SUCCESS = ngrxType('[User] Logout User Success');
export const LOGOUT_USER_FAIL = ngrxType('[User] Logout User Fail');

export const SET_USER_NAME = ngrxType('[User] Set User Name');
export const SET_USER_NAME_SUCCESS = ngrxType('[User] Set User Name Success');
export const SET_USER_NAME_FAIL = ngrxType('[User] Set User Name Fail');

export const SET_USER_TIMEZONE = ngrxType('[User] Set User Timezone');
export const SET_USER_TIMEZONE_SUCCESS = ngrxType(
  '[User] Set User Timezone Success'
);
export const SET_USER_TIMEZONE_FAIL = ngrxType('[User] Set User Timezone Fail');

export const SET_USER_PICTURE = ngrxType('[User] Set User Picture');
export const SET_USER_PICTURE_SUCCESS = ngrxType(
  '[User] Set User Picture Success'
);
export const SET_USER_PICTURE_FAIL = ngrxType('[User] Set User Picture Fail');
// REPOS

export const UPDATE_REPOS_STATE = ngrxType('[Repos] Update Repos State');
export const RESET_REPOS_STATE = ngrxType('[Repos] Reset Repos State');

export const COMMIT_REPO = ngrxType('[Repos] Commit Repo');
export const COMMIT_REPO_SUCCESS = ngrxType('[Repos] Commit Repo Success');
export const COMMIT_REPO_FAIL = ngrxType('[Repos] Commit Repo Fail');

export const PULL_REPO = ngrxType('[Repos] Pull Repo');
export const PULL_REPO_SUCCESS = ngrxType('[Repos] Pull Repo Success');
export const PULL_REPO_FAIL = ngrxType('[Repos] Pull Repo Fail');

export const PUSH_REPO = ngrxType('[Repos] Push Repo');
export const PUSH_REPO_SUCCESS = ngrxType('[Repos] Push Repo Success');
export const PUSH_REPO_FAIL = ngrxType('[Repos] Push Repo Fail');

export const REGENERATE_REPO_REMOTE_PUBLIC_KEY = ngrxType(
  '[Repos] Regenerate Repo Remote Public Key'
);
export const REGENERATE_REPO_REMOTE_PUBLIC_KEY_SUCCESS = ngrxType(
  '[Repos] Regenerate Repo Remote Public Key Success'
);
export const REGENERATE_REPO_REMOTE_PUBLIC_KEY_FAIL = ngrxType(
  '[Repos] Regenerate Repo Remote Public Key Fail'
);

export const REGENERATE_REPO_REMOTE_WEBHOOK = ngrxType(
  '[Repos] Regenerate Repo Remote Webhook'
);
export const REGENERATE_REPO_REMOTE_WEBHOOK_SUCCESS = ngrxType(
  '[Repos] Regenerate Repo Remote Webhook Success'
);
export const REGENERATE_REPO_REMOTE_WEBHOOK_FAIL = ngrxType(
  '[Repos] Regenerate Repo Remote Webhook Fail'
);

export const REVERT_REPO_TO_PRODUCTION = ngrxType(
  '[Repos] Revert Repo To Production'
);
export const REVERT_REPO_TO_PRODUCTION_SUCCESS = ngrxType(
  '[Repos] Revert Repo To Production Success'
);
export const REVERT_REPO_TO_PRODUCTION_FAIL = ngrxType(
  '[Repos] Revert Repo To Production Fail'
);

export const REVERT_REPO_TO_LAST_COMMIT = ngrxType(
  '[Repos] Revert Repo To Last Commit'
);
export const REVERT_REPO_TO_LAST_COMMIT_SUCCESS = ngrxType(
  '[Repos] Revert Repo To Last Commit Success'
);
export const REVERT_REPO_TO_LAST_COMMIT_FAIL = ngrxType(
  '[Repos] Revert Repo To Last Commit Fail'
);

export const SET_REPO_REMOTE_URL = ngrxType('[Repos] Set Repo Remote Url');
export const SET_REPO_REMOTE_URL_SUCCESS = ngrxType(
  '[Repos] Set Repo Remote Url Success'
);
export const SET_REPO_REMOTE_URL_FAIL = ngrxType(
  '[Repos] Set Repo Remote Url Fail'
);

// ROUTER

export const CHANGE_ROUTER_URL = ngrxType('[Router] Change Router URL');

// SUBSCRIPTIONS

export const UPDATE_SUBSCRIPTIONS_STATE = ngrxType(
  '[Subscriptions] Update Subscriptions State'
);
export const RESET_SUBSCRIPTIONS_STATE = ngrxType(
  '[Subscriptions] Reset Subscriptions State'
);

export const CANCEL_SUBSCRIPTIONS = ngrxType(
  '[Subscriptions] Cancel Subscriptions'
);
export const CANCEL_SUBSCRIPTIONS_SUCCESS = ngrxType(
  '[Subscriptions] Cancel Subscriptions Success'
);
export const CANCEL_SUBSCRIPTIONS_FAIL = ngrxType(
  '[Subscriptions] Cancel Subscriptions Fail'
);

export const SWITCH_ANALYTICS_SUBSCRIPTION_PLAN = ngrxType(
  '[Subscriptions] Switch Analytics Subscription Plan'
);
export const SWITCH_ANALYTICS_SUBSCRIPTION_PLAN_SUCCESS = ngrxType(
  '[Subscriptions] Switch Analytics Subscription Plan Success'
);
export const SWITCH_ANALYTICS_SUBSCRIPTION_PLAN_FAIL = ngrxType(
  '[Subscriptions] Switch Analytics Subscription Plan Fail'
);

// WEBSOCKET

export const RESTART_WEBSOCKET = ngrxType('[Websocket] Restart Websocket');

export const OPEN_WEBSOCKET = ngrxType('[Websocket] Open Websocket');
export const OPEN_WEBSOCKET_SUCCESS = ngrxType(
  '[Websocket] Open Websocket Success'
);

export const CLOSE_WEBSOCKET = ngrxType('[Websocket] Close Websocket');
export const CLOSE_WEBSOCKET_SUCCESS = ngrxType(
  '[Websocket] Close Websocket Success'
);

export const UPDATE_WEBSOCKET_INIT_ID = ngrxType(
  '[Websocket] Update Websocket Init Id'
);
export const RESET_WEBSOCKET_STATE = ngrxType(
  '[Websocket] Reset Websocket State'
);

export const STATE_RECEIVED = ngrxType('[Websocket] State Received');
export const PING_RECEIVED = ngrxType('[Websocket] Ping Received');

export const CONFIRM = ngrxType('[Websocket] Confirm');
export const CONFIRM_SUCCESS = ngrxType('[Websocket] Confirm Success');
export const CONFIRM_FAIL = ngrxType('[Websocket] Confirm Fail');

export const PONG = ngrxType('[Websocket] Pong');
export const PONG_SUCCESS = ngrxType('[Websocket] Pong Success');
export const PONG_FAIL = ngrxType('[Websocket] Pong Fail');

// OTHER
export const LOCK_SHOW_FAIL = ngrxType('[Other] Lock Show Fail');
