export enum busEnum {
  VALIDATION_SERVICE = <any>'ValidationService:',

  AUTH_CAN_ACTIVATE = <any>'AuthCanActivate:',
  BQ_CAN_ACTIVATE = <any>'BqCanActivate:',
  CHART_SELECTED_RESOLVER = <any>'ChartSelectedResolver:',
  DASHBOARD_SELECTED_RESOLVER = <any>'DashboardSelectedResolver:',
  PDT_RESOLVER = <any>'PDTResolver:',
  TEAM_RESOLVER = <any>'TeamResolver:',
  SETTINGS_RESOLVER = <any>'SettingsResolver:',
  BILLING_RESOLVER = <any>'BillingResolver:',
  FILE_SELECTED_RESOLVER = <any>'FileSelectedResolver:',
  TO_PROFILE_RESOLVER = <any>'ToProfileResolver:',
  MODE_RESOLVER = <any>'ModeResolver:',
  MCONFIG_SELECTED_RESOLVER = <any>'MconfigSelectedResolver:',
  MODEL_SELECTED_RESOLVER = <any>'ModelSelectedResolver:',
  PROJECT_SELECTED_RESOLVER = <any>'ProjectSelectedResolver:',
  QUERY_SELECTED_RESOLVER = <any>'QuerySelectedResolver:',
  STATE_RESOLVER = <any>'StateResolver:',
  STATE_RESOLVER_JWT = <any>'StateResolverJWT:',

  AUTH_SERVICE = <any>'AuthService:',
  MY_HTTP_SERVICE = <any>'MyHttpService:',
  WATCH_AUTHENTICATION_SERVICE = <any>'WatchAuthenticationService:',
  WATCH_WEBSOCKET_SERVICE = <any>'WatchWebsocketService:',

  APP_EFFECTS = <any>'AppEffects:',
  WEBSOCKET_EFFECTS = <any>'WebsocketEffects:',

  UPDATE_DASHBOARDS_EFFECT = <any>'UpdateDashboardsEffect:',
  CREATE_FILE_SUCCESS_EFFECT = <any>'CreateFileSuccessEffect:',
  UPDATE_FILES_EFFECT = <any>'UpdateFilesEffect:',
  UPDATE_MCONFIGS_EFFECT = <any>'UpdateMconfigsEffect:',
  UPDATE_MODELS_EFFECT = <any>'UpdateModelsEffect:',
  UPDATE_PROJECTS_EFFECT = <any>'UpdateProjectsEffect:',
  UPDATE_QUERIES_EFFECT = <any>'UpdateQueriesEffect:',
  UPDATE_REPOS_EFFECT = <any>'UpdateReposEffect:',

  SPACE_COMPONENT_TOGGLE = <any>'SpaceComponentToggle:',
  LOAD_COMPONENT = <any>'LoadComponent:',
  CATALOG_TREE_COMPONENT = <any>'CatalogTreeComponent:',

  ACTIVATE_EVENT = <any>'ActivateEvent:',
  DEACTIVATE_EVENT = <any>'DeactivateEvent:',
  CAN_DEACTIVATE_CHECK = <any>'CanDeactivateCheck:'
}
