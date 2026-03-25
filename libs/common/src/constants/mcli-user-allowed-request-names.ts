import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

export const MCLI_USER_ALLOWED_REQUEST_NAMES: ToBackendRequestInfoNameEnum[] = [
  ToBackendRequestInfoNameEnum.ToBackendCommitRepo, // commit
  ToBackendRequestInfoNameEnum.ToBackendCreateBranch, // create-branch
  ToBackendRequestInfoNameEnum.ToBackendDeleteBranch, // delete-branch
  ToBackendRequestInfoNameEnum.ToBackendGetBranchesList, // get-branches
  ToBackendRequestInfoNameEnum.ToBackendGetChart, // get-query
  ToBackendRequestInfoNameEnum.ToBackendGetCharts, // get-state, run
  ToBackendRequestInfoNameEnum.ToBackendGetDashboard, // get-query
  ToBackendRequestInfoNameEnum.ToBackendGetDashboards, // get-state, run
  ToBackendRequestInfoNameEnum.ToBackendGetModels, // get-state
  ToBackendRequestInfoNameEnum.ToBackendGetProject, // get-query, run
  ToBackendRequestInfoNameEnum.ToBackendGetQueries, // run
  ToBackendRequestInfoNameEnum.ToBackendGetRepo, // get-query, get-state, run
  ToBackendRequestInfoNameEnum.ToBackendGetState, // get-state
  ToBackendRequestInfoNameEnum.ToBackendGetReport, // get-query
  ToBackendRequestInfoNameEnum.ToBackendGetReports, // get-state
  ToBackendRequestInfoNameEnum.ToBackendMergeRepo, // merge
  ToBackendRequestInfoNameEnum.ToBackendPullRepo, // pull
  ToBackendRequestInfoNameEnum.ToBackendPushRepo, // push
  ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit, // revert
  ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote, // revert
  ToBackendRequestInfoNameEnum.ToBackendRunQueries, // run
  ToBackendRequestInfoNameEnum.ToBackendSyncRepo, // sync
  ToBackendRequestInfoNameEnum.ToBackendValidateFiles // validate
];
