import * as enums from 'app/enums/_index';

export const printerConfig = {
  [enums.busEnum[enums.busEnum.AUTH_CAN_ACTIVATE]]: true,
  [enums.busEnum[enums.busEnum.BQ_CAN_ACTIVATE]]: true,
  [enums.busEnum[enums.busEnum.CHART_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.DASHBOARD_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.PDT_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.VALIDATION_SERVICE]]: true,
  [enums.busEnum[enums.busEnum.FILE_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.TO_PROFILE_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.MODE_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.MCONFIG_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.MODEL_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.PROJECT_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.QUERY_SELECTED_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.STATE_RESOLVER]]: true,
  [enums.busEnum[enums.busEnum.STATE_RESOLVER_JWT]]: false,

  [enums.busEnum[enums.busEnum.AUTH_SERVICE]]: true,
  [enums.busEnum[enums.busEnum.MY_HTTP_SERVICE]]: true,
  [enums.busEnum[enums.busEnum.WATCH_AUTHENTICATION_SERVICE]]: true,
  [enums.busEnum[enums.busEnum.WATCH_WEBSOCKET_SERVICE]]: true,

  [enums.busEnum[enums.busEnum.APP_EFFECTS]]: true,
  [enums.busEnum[enums.busEnum.WEBSOCKET_EFFECTS]]: true,

  [enums.busEnum[enums.busEnum.CREATE_FILE_SUCCESS_EFFECT]]: true,

  [enums.busEnum[enums.busEnum.UPDATE_DASHBOARDS_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_FILES_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_MCONFIGS_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_MODELS_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_PROJECTS_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_QUERIES_EFFECT]]: true,
  [enums.busEnum[enums.busEnum.UPDATE_REPOS_EFFECT]]: true,

  [enums.busEnum[enums.busEnum.SPACE_COMPONENT_TOGGLE]]: true,
  [enums.busEnum[enums.busEnum.LOAD_COMPONENT]]: true,
  [enums.busEnum[enums.busEnum.CATALOG_TREE_COMPONENT]]: false,

  [enums.busEnum[enums.busEnum.ACTIVATE_EVENT]]: false,
  [enums.busEnum[enums.busEnum.DEACTIVATE_EVENT]]: false,
  [enums.busEnum[enums.busEnum.CAN_DEACTIVATE_CHECK]]: false
};
