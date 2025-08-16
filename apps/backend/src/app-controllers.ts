import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.GetAvatarBigController,
  controllers.SetAvatarController,

  controllers.CreateBranchController,
  controllers.DeleteBranchController,
  controllers.GetBranchesListController,
  controllers.IsBranchExistController,

  controllers.MoveCatalogNodeController,
  controllers.RenameCatalogNodeController,

  controllers.CreateConnectionController,
  controllers.DeleteConnectionController,
  controllers.EditConnectionController,
  controllers.GetConnectionsController,

  controllers.CreateFileController,
  controllers.DeleteFileController,
  controllers.GetFileController,
  controllers.SaveFileController,
  controllers.ValidateFilesController,

  controllers.CreateFolderController,
  controllers.DeleteFolderController,

  controllers.CreateTempMconfigController,
  controllers.CreateTempMconfigAndQueryController,
  controllers.DuplicateMconfigAndQueryController,
  controllers.GetMconfigController,

  controllers.CreateMemberController,
  controllers.DeleteMemberController,
  controllers.EditMemberController,
  controllers.GetMembersController,
  controllers.GetMembersListController,

  controllers.GetSuggestFieldsController,

  controllers.GetModelController,
  controllers.GetModelsController,

  controllers.GetNavController,

  controllers.GetOrgUsersController,

  controllers.CreateOrgController,
  controllers.DeleteOrgController,
  controllers.GetOrgController,
  controllers.GetOrgsListController,
  controllers.IsOrgExistController,
  controllers.SetOrgInfoController,
  controllers.SetOrgOwnerController,

  controllers.CreateProjectController,
  controllers.DeleteProjectController,
  controllers.GenerateProjectRemoteKeyController,
  controllers.GetProjectController,
  controllers.GetProjectsListController,
  controllers.IsProjectExistController,
  controllers.SetProjectInfoController,

  controllers.CreateEnvController,
  controllers.CreateEnvVarController,
  controllers.CreateEnvUserController,
  controllers.DeleteEnvController,
  controllers.DeleteEnvVarController,
  controllers.DeleteEnvUserController,
  controllers.EditEnvVarController,
  controllers.GetEnvsController,
  controllers.GetEnvsListController,
  controllers.EditEnvFallbacksController,

  controllers.CancelQueriesController,
  controllers.GetQueriesController,
  controllers.GetQueryController,
  controllers.RunQueriesController,
  controllers.RunQueriesDryController,

  controllers.DeleteRecordsController,
  controllers.GetRebuildStructController,
  controllers.SeedRecordsController,

  controllers.CommitRepoController,
  controllers.GetRepoController,
  controllers.MergeRepoController,
  controllers.PullRepoController,
  controllers.PushRepoController,
  controllers.RevertRepoToLastCommitController,
  controllers.RevertRepoToRemoteController,
  controllers.SyncRepoController,

  controllers.SpecialRebuildStructsController,

  controllers.GetStructController,

  controllers.ConfirmUserEmailController,
  controllers.CompleteUserRegistrationController,
  controllers.DeleteUserController,
  controllers.GetUserProfileController,
  controllers.LoginUserController,
  controllers.LogoutUserController,
  controllers.RegisterUserController,
  controllers.ResendUserEmailController,
  controllers.ResetUserPasswordController,
  controllers.SetUserNameController,
  controllers.SetUserUiController,
  controllers.UpdateUserPasswordController,

  controllers.CreateDraftChartController,
  controllers.DeleteChartController,
  controllers.DeleteDraftChartsController,
  controllers.EditDraftChartController,
  controllers.GetChartController,
  controllers.GetChartsController,
  controllers.SaveCreateChartController,
  controllers.SaveModifyChartController,

  controllers.CreateDraftDashboardController,
  controllers.DeleteDashboardController,
  controllers.DeleteDraftDashboardsController,
  controllers.EditDraftDashboardController,
  controllers.GetDashboardController,
  controllers.GetDashboardsController,
  controllers.SaveCreateDashboardController,
  controllers.SaveModifyDashboardController,

  controllers.CreateDraftReportController,
  controllers.DeleteReportController,
  controllers.DeleteDraftReportsController,
  controllers.EditDraftReportController,
  controllers.GetReportController,
  controllers.GetReportsController,
  controllers.SaveCreateReportController,
  controllers.SaveModifyReportController,

  controllers.CheckController
];
