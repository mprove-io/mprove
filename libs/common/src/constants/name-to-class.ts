import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendArchiveAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-archive-agent-session';
import { ToBackendCreateAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import { ToBackendCreateAgentSseTicketRequest } from '#common/interfaces/to-backend/agent/to-backend-create-agent-sse-ticket';
import { ToBackendDeleteAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-delete-agent-session';
import { ToBackendGetAgentProviderModelsRequest } from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';
import { ToBackendGetAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-get-agent-session';
import { ToBackendGetAgentSessionsListRequest } from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';
import { ToBackendPauseAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-pause-agent-session';
import { ToBackendSendUserMessageToAgentRequest } from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { ToBackendSetAgentSessionTitleRequest } from '#common/interfaces/to-backend/agent/to-backend-set-agent-session-title';
import { ToBackendGetAvatarBigRequest } from '#common/interfaces/to-backend/avatars/to-backend-get-avatar-big';
import { ToBackendSetAvatarRequest } from '#common/interfaces/to-backend/avatars/to-backend-set-avatar';
import { ToBackendCreateBranchRequest } from '#common/interfaces/to-backend/branches/to-backend-create-branch';
import { ToBackendDeleteBranchRequest } from '#common/interfaces/to-backend/branches/to-backend-delete-branch';
import { ToBackendGetBranchesListRequest } from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { ToBackendIsBranchExistRequest } from '#common/interfaces/to-backend/branches/to-backend-is-branch-exist';
import { ToBackendMoveCatalogNodeRequest } from '#common/interfaces/to-backend/catalogs/to-backend-move-catalog-node';
import { ToBackendRenameCatalogNodeRequest } from '#common/interfaces/to-backend/catalogs/to-backend-rename-catalog-node';
import { ToBackendCreateDraftChartRequest } from '#common/interfaces/to-backend/charts/to-backend-create-draft-chart';
import { ToBackendDeleteChartRequest } from '#common/interfaces/to-backend/charts/to-backend-delete-chart';
import { ToBackendDeleteDraftChartsRequest } from '#common/interfaces/to-backend/charts/to-backend-delete-draft-charts';
import { ToBackendEditDraftChartRequest } from '#common/interfaces/to-backend/charts/to-backend-edit-draft-chart';
import { ToBackendGetChartRequest } from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import { ToBackendGetChartsRequest } from '#common/interfaces/to-backend/charts/to-backend-get-charts';
import { ToBackendSaveCreateChartRequest } from '#common/interfaces/to-backend/charts/to-backend-save-create-chart';
import { ToBackendSaveModifyChartRequest } from '#common/interfaces/to-backend/charts/to-backend-save-modify-chart';
import { ToBackendCreateConnectionRequest } from '#common/interfaces/to-backend/connections/to-backend-create-connection';
import { ToBackendDeleteConnectionRequest } from '#common/interfaces/to-backend/connections/to-backend-delete-connection';
import { ToBackendEditConnectionRequest } from '#common/interfaces/to-backend/connections/to-backend-edit-connection';
import { ToBackendGetConnectionsRequest } from '#common/interfaces/to-backend/connections/to-backend-get-connections';
import { ToBackendTestConnectionRequest } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { ToBackendCreateDraftDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-create-draft-dashboard';
import { ToBackendDeleteDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-delete-dashboard';
import { ToBackendDeleteDraftDashboardsRequest } from '#common/interfaces/to-backend/dashboards/to-backend-delete-draft-dashboards';
import { ToBackendEditDraftDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-edit-draft-dashboard';
import { ToBackendGetDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-get-dashboard';
import { ToBackendGetDashboardsRequest } from '#common/interfaces/to-backend/dashboards/to-backend-get-dashboards';
import { ToBackendSaveCreateDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-save-create-dashboard';
import { ToBackendSaveModifyDashboardRequest } from '#common/interfaces/to-backend/dashboards/to-backend-save-modify-dashboard';
import { ToBackendCreateEnvRequest } from '#common/interfaces/to-backend/envs/to-backend-create-env';
import { ToBackendCreateEnvUserRequest } from '#common/interfaces/to-backend/envs/to-backend-create-env-user';
import { ToBackendCreateEnvVarRequest } from '#common/interfaces/to-backend/envs/to-backend-create-env-var';
import { ToBackendDeleteEnvRequest } from '#common/interfaces/to-backend/envs/to-backend-delete-env';
import { ToBackendDeleteEnvUserRequest } from '#common/interfaces/to-backend/envs/to-backend-delete-env-user';
import { ToBackendDeleteEnvVarRequest } from '#common/interfaces/to-backend/envs/to-backend-delete-env-var';
import { ToBackendEditEnvFallbacksRequest } from '#common/interfaces/to-backend/envs/to-backend-edit-env-fallbacks';
import { ToBackendEditEnvVarRequest } from '#common/interfaces/to-backend/envs/to-backend-edit-env-var';
import { ToBackendGetEnvsRequest } from '#common/interfaces/to-backend/envs/to-backend-get-envs';
import { ToBackendGetEnvsListRequest } from '#common/interfaces/to-backend/envs/to-backend-get-envs-list';
import { ToBackendCreateFileRequest } from '#common/interfaces/to-backend/files/to-backend-create-file';
import { ToBackendDeleteFileRequest } from '#common/interfaces/to-backend/files/to-backend-delete-file';
import { ToBackendGetFileRequest } from '#common/interfaces/to-backend/files/to-backend-get-file';
import { ToBackendSaveFileRequest } from '#common/interfaces/to-backend/files/to-backend-save-file';
import { ToBackendValidateFilesRequest } from '#common/interfaces/to-backend/files/to-backend-validate-files';
import { ToBackendCreateFolderRequest } from '#common/interfaces/to-backend/folders/to-backend-create-folder';
import { ToBackendDeleteFolderRequest } from '#common/interfaces/to-backend/folders/to-backend-delete-folder';
import { ToBackendDuplicateMconfigAndQueryRequest } from '#common/interfaces/to-backend/mconfigs/to-backend-duplicate-mconfig-and-query';
import { ToBackendGroupMetricByDimensionRequest } from '#common/interfaces/to-backend/mconfigs/to-backend-group-metric-by-dimension';
import { ToBackendSuggestDimensionValuesRequest } from '#common/interfaces/to-backend/mconfigs/to-backend-suggest-dimension-values';
import { ToBackendCreateMemberRequest } from '#common/interfaces/to-backend/members/to-backend-create-member';
import { ToBackendDeleteMemberRequest } from '#common/interfaces/to-backend/members/to-backend-delete-member';
import { ToBackendEditMemberRequest } from '#common/interfaces/to-backend/members/to-backend-edit-member';
import { ToBackendGetMembersRequest } from '#common/interfaces/to-backend/members/to-backend-get-members';
import { ToBackendGetMembersListRequest } from '#common/interfaces/to-backend/members/to-backend-get-members-list';
import { ToBackendGetModelRequest } from '#common/interfaces/to-backend/models/to-backend-get-model';
import { ToBackendGetModelsRequest } from '#common/interfaces/to-backend/models/to-backend-get-models';
import { ToBackendGetNavRequest } from '#common/interfaces/to-backend/nav/to-backend-get-nav';
import { ToBackendGetOrgUsersRequest } from '#common/interfaces/to-backend/org-users/to-backend-get-org-users';
import { ToBackendCreateOrgRequest } from '#common/interfaces/to-backend/orgs/to-backend-create-org';
import { ToBackendDeleteOrgRequest } from '#common/interfaces/to-backend/orgs/to-backend-delete-org';
import { ToBackendGetOrgRequest } from '#common/interfaces/to-backend/orgs/to-backend-get-org';
import { ToBackendGetOrgsListRequest } from '#common/interfaces/to-backend/orgs/to-backend-get-orgs-list';
import { ToBackendIsOrgExistRequest } from '#common/interfaces/to-backend/orgs/to-backend-is-org-exist';
import { ToBackendSetOrgInfoRequest } from '#common/interfaces/to-backend/orgs/to-backend-set-org-info';
import { ToBackendSetOrgOwnerRequest } from '#common/interfaces/to-backend/orgs/to-backend-set-org-owner';
import { ToBackendCreateProjectRequest } from '#common/interfaces/to-backend/projects/to-backend-create-project';
import { ToBackendDeleteProjectRequest } from '#common/interfaces/to-backend/projects/to-backend-delete-project';
import { ToBackendGenerateProjectRemoteKeyRequest } from '#common/interfaces/to-backend/projects/to-backend-generate-project-remote-key';
import { ToBackendGetProjectRequest } from '#common/interfaces/to-backend/projects/to-backend-get-project';
import { ToBackendGetProjectsListRequest } from '#common/interfaces/to-backend/projects/to-backend-get-projects-list';
import { ToBackendIsProjectExistRequest } from '#common/interfaces/to-backend/projects/to-backend-is-project-exist';
import { ToBackendSetProjectAllowTimezonesRequest } from '#common/interfaces/to-backend/projects/to-backend-set-project-allow-timezones';
import { ToBackendSetProjectInfoRequest } from '#common/interfaces/to-backend/projects/to-backend-set-project-info';
import { ToBackendSetProjectTimezoneRequest } from '#common/interfaces/to-backend/projects/to-backend-set-project-timezone';
import { ToBackendSetProjectWeekStartRequest } from '#common/interfaces/to-backend/projects/to-backend-set-project-week-start';
import { ToBackendCancelQueriesRequest } from '#common/interfaces/to-backend/queries/to-backend-cancel-queries';
import { ToBackendGetQueriesRequest } from '#common/interfaces/to-backend/queries/to-backend-get-queries';
import { ToBackendGetQueryRequest } from '#common/interfaces/to-backend/queries/to-backend-get-query';
import { ToBackendRunQueriesRequest } from '#common/interfaces/to-backend/queries/to-backend-run-queries';
import { ToBackendRunQueriesDryRequest } from '#common/interfaces/to-backend/queries/to-backend-run-queries-dry';
import { ToBackendCreateDraftReportRequest } from '#common/interfaces/to-backend/reports/to-backend-create-draft-report';
import { ToBackendDeleteDraftReportsRequest } from '#common/interfaces/to-backend/reports/to-backend-delete-draft-reports';
import { ToBackendDeleteReportRequest } from '#common/interfaces/to-backend/reports/to-backend-delete-report';
import { ToBackendEditDraftReportRequest } from '#common/interfaces/to-backend/reports/to-backend-edit-draft-report';
import { ToBackendGetReportRequest } from '#common/interfaces/to-backend/reports/to-backend-get-report';
import { ToBackendGetReportsRequest } from '#common/interfaces/to-backend/reports/to-backend-get-reports';
import { ToBackendSaveCreateReportRequest } from '#common/interfaces/to-backend/reports/to-backend-save-create-report';
import { ToBackendSaveModifyReportRequest } from '#common/interfaces/to-backend/reports/to-backend-save-modify-report';
import { ToBackendCommitRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-commit-repo';
import { ToBackendGetRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-get-repo';
import { ToBackendMergeRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-merge-repo';
import { ToBackendPullRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-pull-repo';
import { ToBackendPushRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-push-repo';
import { ToBackendRevertRepoToLastCommitRequest } from '#common/interfaces/to-backend/repos/to-backend-revert-repo-to-last-commit';
import { ToBackendRevertRepoToRemoteRequest } from '#common/interfaces/to-backend/repos/to-backend-revert-repo-to-remote';
import { ToBackendSyncRepoRequest } from '#common/interfaces/to-backend/repos/to-backend-sync-repo';
import { ToBackendSpecialRebuildStructsRequest } from '#common/interfaces/to-backend/special/to-backend-special-rebuild-structs';
import { ToBackendGetStructRequest } from '#common/interfaces/to-backend/structs/to-backend-get-struct';
import { ToBackendGetSuggestFieldsRequest } from '#common/interfaces/to-backend/suggest-fields/to-backend-get-suggest-fields';
import { ToBackendDeleteRecordsRequest } from '#common/interfaces/to-backend/test-routes/to-backend-delete-records';
import { ToBackendGetRebuildStructRequest } from '#common/interfaces/to-backend/test-routes/to-backend-get-rebuild-struct';
import { ToBackendSeedRecordsRequest } from '#common/interfaces/to-backend/test-routes/to-backend-seed-records';
import { ToBackendCompleteUserRegistrationRequest } from '#common/interfaces/to-backend/users/to-backend-complete-user-registration';
import { ToBackendConfirmUserEmailRequest } from '#common/interfaces/to-backend/users/to-backend-confirm-user-email';
import { ToBackendDeleteUserRequest } from '#common/interfaces/to-backend/users/to-backend-delete-user';
import { ToBackendGetUserProfileRequest } from '#common/interfaces/to-backend/users/to-backend-get-user-profile';
import { ToBackendLoginUserRequest } from '#common/interfaces/to-backend/users/to-backend-login-user';
import { ToBackendLogoutUserRequest } from '#common/interfaces/to-backend/users/to-backend-logout-user';
import { ToBackendRegisterUserRequest } from '#common/interfaces/to-backend/users/to-backend-register-user';
import { ToBackendResendUserEmailRequest } from '#common/interfaces/to-backend/users/to-backend-resend-user-email';
import { ToBackendResetUserPasswordRequest } from '#common/interfaces/to-backend/users/to-backend-reset-user-password';
import { ToBackendSetUserNameRequest } from '#common/interfaces/to-backend/users/to-backend-set-user-name';
import { ToBackendSetUserUiRequest } from '#common/interfaces/to-backend/users/to-backend-set-user-ui';
import { ToBackendUpdateUserPasswordRequest } from '#common/interfaces/to-backend/users/to-backend-update-user-password';

export class NoCheckParamsSchema {}

export const nameToClass = {
  // check
  [ToBackendRequestInfoNameEnum.ToBackendCheck]: NoCheckParamsSchema,
  [ToBackendRequestInfoNameEnum.ToBackendCheckSignUp]: NoCheckParamsSchema,
  // telemetry
  [ToBackendRequestInfoNameEnum.ToBackendTelemetryLogs]: NoCheckParamsSchema,
  [ToBackendRequestInfoNameEnum.ToBackendTelemetryMetrics]: NoCheckParamsSchema,
  [ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces]: NoCheckParamsSchema,
  // special
  [ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStructs]:
    ToBackendSpecialRebuildStructsRequest,
  // test-routes
  [ToBackendRequestInfoNameEnum.ToBackendGetRebuildStruct]:
    ToBackendGetRebuildStructRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSeedRecords]:
    ToBackendSeedRecordsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteRecords]:
    ToBackendDeleteRecordsRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration]:
    ToBackendCompleteUserRegistrationRequest,
  [ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail]:
    ToBackendConfirmUserEmailRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetUserProfile]:
    ToBackendGetUserProfileRequest,
  [ToBackendRequestInfoNameEnum.ToBackendLoginUser]: ToBackendLoginUserRequest,
  [ToBackendRequestInfoNameEnum.ToBackendLogoutUser]:
    ToBackendLogoutUserRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRegisterUser]:
    ToBackendRegisterUserRequest,
  [ToBackendRequestInfoNameEnum.ToBackendResendUserEmail]:
    ToBackendResendUserEmailRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetUserName]:
    ToBackendSetUserNameRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetUserUi]: ToBackendSetUserUiRequest,
  [ToBackendRequestInfoNameEnum.ToBackendResetUserPassword]:
    ToBackendResetUserPasswordRequest,
  [ToBackendRequestInfoNameEnum.ToBackendUpdateUserPassword]:
    ToBackendUpdateUserPasswordRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteUser]:
    ToBackendDeleteUserRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCreateOrg]: ToBackendCreateOrgRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetOrgsList]:
    ToBackendGetOrgsListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetOrg]: ToBackendGetOrgRequest,
  [ToBackendRequestInfoNameEnum.ToBackendIsOrgExist]:
    ToBackendIsOrgExistRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo]:
    ToBackendSetOrgInfoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner]:
    ToBackendSetOrgOwnerRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteOrg]: ToBackendDeleteOrgRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey]:
    ToBackendGenerateProjectRemoteKeyRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateProject]:
    ToBackendCreateProjectRequest,
  [ToBackendRequestInfoNameEnum.ToBackendIsProjectExist]:
    ToBackendIsProjectExistRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetProject]:
    ToBackendGetProjectRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetProjectTimezone]:
    ToBackendSetProjectTimezoneRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetProjectWeekStart]:
    ToBackendSetProjectWeekStartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetProjectAllowTimezones]:
    ToBackendSetProjectAllowTimezonesRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetProjectsList]:
    ToBackendGetProjectsListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteProject]:
    ToBackendDeleteProjectRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo]:
    ToBackendSetProjectInfoRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetEnvsList]:
    ToBackendGetEnvsListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetEnvs]: ToBackendGetEnvsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateEnv]: ToBackendCreateEnvRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateEnvVar]:
    ToBackendCreateEnvVarRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateEnvUser]:
    ToBackendCreateEnvUserRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditEnvVar]:
    ToBackendEditEnvVarRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteEnv]: ToBackendDeleteEnvRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteEnvVar]:
    ToBackendDeleteEnvVarRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteEnvUser]:
    ToBackendDeleteEnvUserRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks]:
    ToBackendEditEnvFallbacksRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetMembers]:
    ToBackendGetMembersRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetMembersList]:
    ToBackendGetMembersListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateMember]:
    ToBackendCreateMemberRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditMember]:
    ToBackendEditMemberRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteMember]:
    ToBackendDeleteMemberRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetOrgUsers]:
    ToBackendGetOrgUsersRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetConnections]:
    ToBackendGetConnectionsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateConnection]:
    ToBackendCreateConnectionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteConnection]:
    ToBackendDeleteConnectionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditConnection]:
    ToBackendEditConnectionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendTestConnection]:
    ToBackendTestConnectionRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetBranchesList]:
    ToBackendGetBranchesListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendIsBranchExist]:
    ToBackendIsBranchExistRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateBranch]:
    ToBackendCreateBranchRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteBranch]:
    ToBackendDeleteBranchRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetRepo]: ToBackendGetRepoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCommitRepo]:
    ToBackendCommitRepoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendPushRepo]: ToBackendPushRepoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendPullRepo]: ToBackendPullRepoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit]:
    ToBackendRevertRepoToLastCommitRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote]:
    ToBackendRevertRepoToRemoteRequest,
  [ToBackendRequestInfoNameEnum.ToBackendMergeRepo]: ToBackendMergeRepoRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSyncRepo]: ToBackendSyncRepoRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetStruct]: ToBackendGetStructRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode]:
    ToBackendMoveCatalogNodeRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode]:
    ToBackendRenameCatalogNodeRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCreateFolder]:
    ToBackendCreateFolderRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteFolder]:
    ToBackendDeleteFolderRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetFile]: ToBackendGetFileRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateFile]:
    ToBackendCreateFileRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteFile]:
    ToBackendDeleteFileRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveFile]: ToBackendSaveFileRequest,
  [ToBackendRequestInfoNameEnum.ToBackendValidateFiles]:
    ToBackendValidateFilesRequest,
  //

  [ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields]:
    ToBackendGetSuggestFieldsRequest,

  //
  [ToBackendRequestInfoNameEnum.ToBackendGetModels]: ToBackendGetModelsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetModel]: ToBackendGetModelRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCreateDraftChart]:
    ToBackendCreateDraftChartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteChart]:
    ToBackendDeleteChartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts]:
    ToBackendDeleteDraftChartsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditDraftChart]:
    ToBackendEditDraftChartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetChart]: ToBackendGetChartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetCharts]: ToBackendGetChartsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart]:
    ToBackendSaveCreateChartRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart]:
    ToBackendSaveModifyChartRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCreateDraftDashboard]:
    ToBackendCreateDraftDashboardRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard]:
    ToBackendDeleteDashboardRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteDraftDashboards]:
    ToBackendDeleteDraftDashboardsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard]:
    ToBackendEditDraftDashboardRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetDashboard]:
    ToBackendGetDashboardRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetDashboards]:
    ToBackendGetDashboardsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard]:
    ToBackendSaveCreateDashboardRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard]:
    ToBackendSaveModifyDashboardRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport]:
    ToBackendCreateDraftReportRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteReport]:
    ToBackendDeleteReportRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports]:
    ToBackendDeleteDraftReportsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendEditDraftReport]:
    ToBackendEditDraftReportRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetReport]: ToBackendGetReportRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetReports]:
    ToBackendGetReportsRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport]:
    ToBackendSaveCreateReportRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport]:
    ToBackendSaveModifyReportRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery]:
    ToBackendDuplicateMconfigAndQueryRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGroupMetricByDimension]:
    ToBackendGroupMetricByDimensionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues]:
    ToBackendSuggestDimensionValuesRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetQueries]:
    ToBackendGetQueriesRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetQuery]: ToBackendGetQueryRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRunQueries]:
    ToBackendRunQueriesRequest,
  [ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry]:
    ToBackendRunQueriesDryRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCancelQueries]:
    ToBackendCancelQueriesRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetNav]: ToBackendGetNavRequest,
  //
  [ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig]:
    ToBackendGetAvatarBigRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetAvatar]: ToBackendSetAvatarRequest,
  // agent
  [ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession]:
    ToBackendCreateAgentSessionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent]:
    ToBackendSendUserMessageToAgentRequest,
  [ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession]:
    ToBackendDeleteAgentSessionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendArchiveAgentSession]:
    ToBackendArchiveAgentSessionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendPauseAgentSession]:
    ToBackendPauseAgentSessionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendCreateAgentSseTicket]:
    ToBackendCreateAgentSseTicketRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionsList]:
    ToBackendGetAgentSessionsListRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetAgentSession]:
    ToBackendGetAgentSessionRequest,
  [ToBackendRequestInfoNameEnum.ToBackendSetAgentSessionTitle]:
    ToBackendSetAgentSessionTitleRequest,
  [ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels]:
    ToBackendGetAgentProviderModelsRequest
};
