import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

export const MCLI_USER_ALLOWED_REQUEST_NAMES: ToBackendRequestInfoNameEnum[] = [
  ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas, // get-schemas
  ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample, // get-sample
  ToBackendRequestInfoNameEnum.ToBackendSyncRepo, // sync
  ToBackendRequestInfoNameEnum.ToBackendValidateFiles, // validate
  ToBackendRequestInfoNameEnum.ToBackendGetState, // get-state
  ToBackendRequestInfoNameEnum.ToBackendGetModel, // get-model
  ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo, // get-query
  ToBackendRequestInfoNameEnum.ToBackendRun, // run
  // git
  ToBackendRequestInfoNameEnum.ToBackendGetBranchesList, // get-branches
  ToBackendRequestInfoNameEnum.ToBackendCreateBranch, // create-branch
  ToBackendRequestInfoNameEnum.ToBackendDeleteBranch, // delete-branch
  ToBackendRequestInfoNameEnum.ToBackendMergeRepo, // merge
  ToBackendRequestInfoNameEnum.ToBackendCommitRepo, // commit
  ToBackendRequestInfoNameEnum.ToBackendPullRepo, // pull
  ToBackendRequestInfoNameEnum.ToBackendPushRepo, // push
  ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit, // revert
  ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote, // revert
  // other
  ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth // set-codex-auth
];
