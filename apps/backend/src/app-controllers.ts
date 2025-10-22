import { GetAvatarBigController } from './controllers/avatars/get-avatar-big/get-avatar-big.controller';
import { SetAvatarController } from './controllers/avatars/set-avatar/set-avatar.controller';
import { CreateBranchController } from './controllers/branches/create-branch/create-branch.controller';
import { DeleteBranchController } from './controllers/branches/delete-branch/delete-branch.controller';
import { GetBranchesListController } from './controllers/branches/get-branches-list/get-branches-list.controller';
import { IsBranchExistController } from './controllers/branches/is-branch-exist/is-branch-exist.controller';
import { MoveCatalogNodeController } from './controllers/catalogs/move-catalog-node/move-catalog-node.controller';
import { RenameCatalogNodeController } from './controllers/catalogs/rename-catalog-node/rename-catalog-node.controller';
import { CreateDraftChartController } from './controllers/charts/create-draft-chart/create-draft-chart.controller';
import { DeleteChartController } from './controllers/charts/delete-chart/delete-chart.controller';
import { DeleteDraftChartsController } from './controllers/charts/delete-draft-charts/delete-draft-charts.controller';
import { EditDraftChartController } from './controllers/charts/edit-draft-chart/edit-draft-chart.controller';
import { GetChartController } from './controllers/charts/get-chart/get-chart.controller';
import { GetChartsController } from './controllers/charts/get-charts/get-charts.controller';
import { SaveCreateChartController } from './controllers/charts/save-create-chart/save-create-chart.controller';
import { SaveModifyChartController } from './controllers/charts/save-modify-chart/save-modify-chart.controller';
import { CheckController } from './controllers/check/check/check.controller';
import { CreateConnectionController } from './controllers/connections/create-connection/create-connection.controller';
import { DeleteConnectionController } from './controllers/connections/delete-connection/delete-connection.controller';
import { EditConnectionController } from './controllers/connections/edit-connection/edit-connection.controller';
import { GetConnectionsController } from './controllers/connections/get-connections/get-connections.controller';
import { CreateDraftDashboardController } from './controllers/dashboards/create-draft-dashboard/create-draft-dashboard.controller';
import { DeleteDashboardController } from './controllers/dashboards/delete-dashboard/delete-dashboard.controller';
import { DeleteDraftDashboardsController } from './controllers/dashboards/delete-draft-dashboards/delete-draft-dashboards.controller';
import { EditDraftDashboardController } from './controllers/dashboards/edit-draft-dashboard/edit-draft-dashboard.controller';
import { GetDashboardController } from './controllers/dashboards/get-dashboard/get-dashboard.controller';
import { GetDashboardsController } from './controllers/dashboards/get-dashboards/get-dashboards.controller';
import { SaveCreateDashboardController } from './controllers/dashboards/save-create-dashboard/save-create-dashboard.controller';
import { SaveModifyDashboardController } from './controllers/dashboards/save-modify-dashboard/save-modify-dashboard.controller';
import { CreateEnvUserController } from './controllers/envs/create-env-user/create-env-user.controller';
import { CreateEnvVarController } from './controllers/envs/create-env-var/create-env-var.controller';
import { CreateEnvController } from './controllers/envs/create-env/create-env.controller';
import { DeleteEnvUserController } from './controllers/envs/delete-env-user/delete-env-user.controller';
import { DeleteEnvVarController } from './controllers/envs/delete-env-var/delete-env-var.controller';
import { DeleteEnvController } from './controllers/envs/delete-env/delete-env.controller';
import { EditEnvFallbacksController } from './controllers/envs/edit-env-fallbacks/edit-env-fallbacks.controller';
import { EditEnvVarController } from './controllers/envs/edit-env-var/edit-env-var.controller';
import { GetEnvsListController } from './controllers/envs/get-envs-list/get-envs-list.controller';
import { GetEnvsController } from './controllers/envs/get-envs/get-envs.controller';
import { CreateFileController } from './controllers/files/create-file/create-file.controller';
import { DeleteFileController } from './controllers/files/delete-file/delete-file.controller';
import { GetFileController } from './controllers/files/get-file/get-file.controller';
import { SaveFileController } from './controllers/files/save-file/save-file.controller';
import { ValidateFilesController } from './controllers/files/validate-files/validate-files.controller';
import { CreateFolderController } from './controllers/folders/create-folder/create-folder.controller';
import { DeleteFolderController } from './controllers/folders/delete-folder/delete-folder.controller';
import { CreateTempMconfigAndQueryController } from './controllers/mconfigs/create-temp-mconfig-and-query/create-temp-mconfig-and-query.controller';
import { DuplicateMconfigAndQueryController } from './controllers/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query.controller';
import { GroupMetricByDimensionController } from './controllers/mconfigs/group-metric-by-dimension/group-metric-by-dimension.controller';
import { CreateMemberController } from './controllers/members/create-member/create-member.controller';
import { DeleteMemberController } from './controllers/members/delete-member/delete-member.controller';
import { EditMemberController } from './controllers/members/edit-member/edit-member.controller';
import { GetMembersListController } from './controllers/members/get-members-list/get-members-list.controller';
import { GetMembersController } from './controllers/members/get-members/get-members.controller';
import { GetModelController } from './controllers/models/get-model/get-model.controller';
import { GetModelsController } from './controllers/models/get-models/get-models.controller';
import { GetNavController } from './controllers/nav/get-nav/get-nav.controller';
import { GetOrgUsersController } from './controllers/org-users/get-org-users/get-org-users.controller';
import { CreateOrgController } from './controllers/orgs/create-org/create-org.controller';
import { DeleteOrgController } from './controllers/orgs/delete-org/delete-org.controller';
import { GetOrgController } from './controllers/orgs/get-org/get-org.controller';
import { GetOrgsListController } from './controllers/orgs/get-orgs-list/get-orgs-list.controller';
import { IsOrgExistController } from './controllers/orgs/is-org-exist/is-org-exist.controller';
import { SetOrgInfoController } from './controllers/orgs/set-org-info/set-org-info.controller';
import { SetOrgOwnerController } from './controllers/orgs/set-org-owner/set-org-owner.controller';
import { CreateProjectController } from './controllers/projects/create-project/create-project.controller';
import { DeleteProjectController } from './controllers/projects/delete-project/delete-project.controller';
import { GenerateProjectRemoteKeyController } from './controllers/projects/generate-project-remote-key/generate-project-remote-key.controller';
import { GetProjectController } from './controllers/projects/get-project/get-project.controller';
import { GetProjectsListController } from './controllers/projects/get-projects-list/get-projects-list.controller';
import { IsProjectExistController } from './controllers/projects/is-project-exist/is-project-exist.controller';
import { SetProjectInfoController } from './controllers/projects/set-project-info/set-project-info.controller';
import { CancelQueriesController } from './controllers/queries/cancel-queries/cancel-queries.controller';
import { GetQueriesController } from './controllers/queries/get-queries/get-queries.controller';
import { GetQueryController } from './controllers/queries/get-query/get-query.controller';
import { RunQueriesDryController } from './controllers/queries/run-queries-dry/run-queries-dry.controller';
import { RunQueriesController } from './controllers/queries/run-queries/run-queries.controller';
import { CreateDraftReportController } from './controllers/reports/create-draft-report/create-draft-report.controller';
import { DeleteDraftReportsController } from './controllers/reports/delete-draft-reports/delete-draft-reports.controller';
import { DeleteReportController } from './controllers/reports/delete-report/delete-report.controller';
import { EditDraftReportController } from './controllers/reports/edit-draft-report/edit-draft-report.controller';
import { GetReportController } from './controllers/reports/get-report/get-report.controller';
import { GetReportsController } from './controllers/reports/get-reports/get-reports.controller';
import { SaveCreateReportController } from './controllers/reports/save-create-report/save-create-report.controller';
import { SaveModifyReportController } from './controllers/reports/save-modify-report/save-modify-report.controller';
import { CommitRepoController } from './controllers/repos/commit-repo/commit-repo.controller';
import { GetRepoController } from './controllers/repos/get-repo/get-repo.controller';
import { MergeRepoController } from './controllers/repos/merge-repo/merge-repo.controller';
import { PullRepoController } from './controllers/repos/pull-repo/pull-repo.controller';
import { PushRepoController } from './controllers/repos/push-repo/push-repo.controller';
import { RevertRepoToLastCommitController } from './controllers/repos/revert-repo-to-last-commit/revert-repo-to-last-commit.controller';
import { RevertRepoToRemoteController } from './controllers/repos/revert-repo-to-remote/revert-repo-to-remote.controller';
import { SyncRepoController } from './controllers/repos/sync-repo/sync-repo.controller';
import { SpecialRebuildStructsController } from './controllers/special/special-rebuild-structs/special-rebuild-structs.controller';
import { GetStructController } from './controllers/structs/get-struct/get-struct.controller';
import { GetSuggestFieldsController } from './controllers/suggest-fields/get-suggest-fields/get-suggest-fields.controller';
import { DeleteRecordsController } from './controllers/test-routes/delete-records/delete-records.controller';
import { GetRebuildStructController } from './controllers/test-routes/get-rebuild-struct/get-rebuild-struct.controller';
import { SeedRecordsController } from './controllers/test-routes/seed-records/seed-records.controller';
import { CompleteUserRegistrationController } from './controllers/users/complete-user-registration/complete-user-registration.controller';
import { ConfirmUserEmailController } from './controllers/users/confirm-user-email/confirm-user-email.controller';
import { DeleteUserController } from './controllers/users/delete-user/delete-user.controller';
import { GetUserProfileController } from './controllers/users/get-user-profile/get-user-profile.controller';
import { LoginUserController } from './controllers/users/login-user/login-user.controller';
import { LogoutUserController } from './controllers/users/logout-user/logout-user.controller';
import { RegisterUserController } from './controllers/users/register-user/register-user.controller';
import { ResendUserEmailController } from './controllers/users/resend-user-email/resend-user-email.controller';
import { ResetUserPasswordController } from './controllers/users/reset-user-password/reset-user-password.controller';
import { SetUserNameController } from './controllers/users/set-user-name/set-user-name.controller';
import { SetUserUiController } from './controllers/users/set-user-ui/set-user-ui.controller';
import { UpdateUserPasswordController } from './controllers/users/update-user-password/update-user-password.controller';

export const appControllers = [
  GetAvatarBigController,
  SetAvatarController,

  CreateBranchController,
  DeleteBranchController,
  GetBranchesListController,
  IsBranchExistController,

  MoveCatalogNodeController,
  RenameCatalogNodeController,

  CreateConnectionController,
  DeleteConnectionController,
  EditConnectionController,
  GetConnectionsController,

  CreateFileController,
  DeleteFileController,
  GetFileController,
  SaveFileController,
  ValidateFilesController,

  CreateFolderController,
  DeleteFolderController,

  DuplicateMconfigAndQueryController,
  GroupMetricByDimensionController,
  CreateTempMconfigAndQueryController,

  CreateMemberController,
  DeleteMemberController,
  EditMemberController,
  GetMembersController,
  GetMembersListController,

  GetSuggestFieldsController,

  GetModelController,
  GetModelsController,

  GetNavController,

  GetOrgUsersController,

  CreateOrgController,
  DeleteOrgController,
  GetOrgController,
  GetOrgsListController,
  IsOrgExistController,
  SetOrgInfoController,
  SetOrgOwnerController,

  CreateProjectController,
  DeleteProjectController,
  GenerateProjectRemoteKeyController,
  GetProjectController,
  GetProjectsListController,
  IsProjectExistController,
  SetProjectInfoController,

  CreateEnvController,
  CreateEnvVarController,
  CreateEnvUserController,
  DeleteEnvController,
  DeleteEnvVarController,
  DeleteEnvUserController,
  EditEnvVarController,
  GetEnvsController,
  GetEnvsListController,
  EditEnvFallbacksController,

  CancelQueriesController,
  GetQueriesController,
  GetQueryController,
  RunQueriesController,
  RunQueriesDryController,

  DeleteRecordsController,
  GetRebuildStructController,
  SeedRecordsController,

  CommitRepoController,
  GetRepoController,
  MergeRepoController,
  PullRepoController,
  PushRepoController,
  RevertRepoToLastCommitController,
  RevertRepoToRemoteController,
  SyncRepoController,

  SpecialRebuildStructsController,

  GetStructController,

  ConfirmUserEmailController,
  CompleteUserRegistrationController,
  DeleteUserController,
  GetUserProfileController,
  LoginUserController,
  LogoutUserController,
  RegisterUserController,
  ResendUserEmailController,
  ResetUserPasswordController,
  SetUserNameController,
  SetUserUiController,
  UpdateUserPasswordController,

  CreateDraftChartController,
  DeleteChartController,
  DeleteDraftChartsController,
  EditDraftChartController,
  GetChartController,
  GetChartsController,
  SaveCreateChartController,
  SaveModifyChartController,

  CreateDraftDashboardController,
  DeleteDashboardController,
  DeleteDraftDashboardsController,
  EditDraftDashboardController,
  GetDashboardController,
  GetDashboardsController,
  SaveCreateDashboardController,
  SaveModifyDashboardController,

  CreateDraftReportController,
  DeleteReportController,
  DeleteDraftReportsController,
  EditDraftReportController,
  GetReportController,
  GetReportsController,
  SaveCreateReportController,
  SaveModifyReportController,

  CheckController
];
