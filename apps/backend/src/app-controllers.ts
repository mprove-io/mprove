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

  controllers.CreateDashboardController,
  controllers.CreateTempDashboardController,
  controllers.DeleteDashboardController,
  controllers.GetDashboardController,
  controllers.GetDashboardsController,
  controllers.ModifyDashboardController,

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

  controllers.GetMetricsController,

  controllers.GetSuggestFieldsController,

  controllers.GetReportController,
  controllers.CreateDraftReportController,
  controllers.EditDraftReportController,
  controllers.DeleteDraftReportsController,
  controllers.DeleteReportController,
  controllers.SaveCreateReportController,
  controllers.SaveModifyReportController,

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
  controllers.DeleteEnvController,
  controllers.GetEnvsController,
  controllers.GetEnvsListController,

  controllers.CreateEvController,
  controllers.EditEvController,
  controllers.DeleteEvController,
  controllers.GetEvsController,

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
  controllers.SetUserTimezoneController,
  controllers.UpdateUserPasswordController,

  controllers.GetViewsController,

  controllers.CreateChartController,
  controllers.DeleteChartController,
  controllers.GetChartsController,
  controllers.GetChartController,
  controllers.ModifyChartController,

  controllers.CheckController
];
