import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.RebuildStructSpecialController,

  controllers.ConfirmUserEmailController,
  controllers.GetUserProfileController,
  controllers.LoginUserController,
  controllers.LogoutUserController,
  controllers.RegisterUserController,
  controllers.SetUserNameController,
  controllers.SetUserTimezoneController,
  controllers.ResetUserPasswordController,
  controllers.UpdateUserPasswordController,

  controllers.CreateOrgController,
  controllers.GetOrgsListController,
  controllers.GetOrgController,
  controllers.IsOrgExistController,
  controllers.SetOrgInfoController,
  controllers.SetOrgOwnerController,

  controllers.CreateProjectController,
  controllers.GetProjectController,
  controllers.GetProjectsListController,
  controllers.IsProjectExistController,

  controllers.GetMembersController,
  controllers.CreateMemberController,
  controllers.EditMemberController,
  controllers.DeleteMemberController,

  controllers.GetOrgUsersController,

  controllers.GetConnectionsController,
  controllers.CreateConnectionController,
  controllers.EditConnectionController,

  controllers.GetBranchesListController,
  controllers.IsBranchExistController,
  controllers.CreateBranchController,

  controllers.GetRepoController,
  controllers.CommitRepoController,
  controllers.PushRepoController,
  controllers.PullRepoController,
  controllers.RevertRepoToLastCommitController,
  controllers.RevertRepoToProductionController,
  controllers.MergeRepoController,

  controllers.MoveCatalogNodeController,
  controllers.RenameCatalogNodeController,

  controllers.CreateFolderController,
  controllers.DeleteFolderController,

  controllers.GetFileController,
  controllers.DeleteFileController,
  controllers.CreateFileController,
  controllers.SaveFileController,

  controllers.GetModelsListController,
  controllers.GetModelController,

  controllers.GetViewsController,

  controllers.GetDashboardsListController,
  controllers.GetDashboardController,
  controllers.CreateTempDashboardController,
  controllers.CreateDashboardController,
  controllers.ModifyDashboardController,
  controllers.DeleteDashboardController,

  controllers.GetVizsController,
  controllers.CreateVizController,
  controllers.ModifyVizController,
  controllers.DeleteVizController,

  controllers.GetMconfigController,
  controllers.CreateTempMconfigController,
  controllers.CreateTempMconfigAndQueryController,
  //
  controllers.GetQueryController,
  controllers.RunQueriesController,
  controllers.RunQueriesDryController,
  controllers.CancelQueriesController,
  //
  controllers.GetNavController
];
