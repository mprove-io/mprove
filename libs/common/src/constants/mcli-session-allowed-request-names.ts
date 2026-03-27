import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

export const MCLI_SESSION_ALLOWED_REQUEST_NAMES: ToBackendRequestInfoNameEnum[] =
  [
    ToBackendRequestInfoNameEnum.ToBackendGetChart, // get-query
    ToBackendRequestInfoNameEnum.ToBackendGetCharts, // get-state, run
    ToBackendRequestInfoNameEnum.ToBackendGetDashboard, // get-query
    ToBackendRequestInfoNameEnum.ToBackendGetDashboards, // get-state, run
    ToBackendRequestInfoNameEnum.ToBackendGetModels, // get-state
    ToBackendRequestInfoNameEnum.ToBackendGetProject, // get-query, run
    ToBackendRequestInfoNameEnum.ToBackendGetQueries, // run
    ToBackendRequestInfoNameEnum.ToBackendGetRepo, // get-query, get-state, run
    ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo, // get-query
    ToBackendRequestInfoNameEnum.ToBackendGetState, // get-state
    ToBackendRequestInfoNameEnum.ToBackendGetReport, // get-query
    ToBackendRequestInfoNameEnum.ToBackendGetReports, // get-state
    ToBackendRequestInfoNameEnum.ToBackendRun, // run
    ToBackendRequestInfoNameEnum.ToBackendRunQueries, // run
    ToBackendRequestInfoNameEnum.ToBackendSyncRepo, // sync
    ToBackendRequestInfoNameEnum.ToBackendValidateFiles // validate
  ];
