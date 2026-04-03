import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

export const MCLI_USER_ALLOWED_REQUEST_NAMES: ToBackendRequestInfoNameEnum[] = [
  ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList, // get-connections-list
  ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample, // get-sample
  ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas, // get-schemas
  ToBackendRequestInfoNameEnum.ToBackendSyncRepo, // sync
  ToBackendRequestInfoNameEnum.ToBackendValidateFiles, // validate
  ToBackendRequestInfoNameEnum.ToBackendGetState, // get-state
  ToBackendRequestInfoNameEnum.ToBackendGetModel, // get-model
  ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo, // get-query-info
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
  ToBackendRequestInfoNameEnum.ToBackendDownloadSkills, // download-skills
  ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth // set-codex-auth
];
