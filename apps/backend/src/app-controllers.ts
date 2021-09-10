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
  controllers.GetDashboardsListController,
  controllers.ModifyDashboardController,

  controllers.CreateFileController,
  controllers.DeleteFileController,
  controllers.GetFileController,
  controllers.SaveFileController,

  controllers.CreateFolderController,
  controllers.DeleteFolderController,

  controllers.CreateTempMconfigController,
  controllers.CreateTempMconfigAndQueryController,
  controllers.GetMconfigController,

  controllers.CreateMemberController,
  controllers.DeleteMemberController,
  controllers.EditMemberController,
  controllers.GetMembersController,

  controllers.GetModelController,
  controllers.GetModelsListController,

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
  controllers.GetProjectController,
  controllers.GetProjectsListController,
  controllers.IsProjectExistController,
  controllers.SetProjectInfoController,

  controllers.CancelQueriesController,
  controllers.GetQueryController,
  controllers.RunQueriesController,
  controllers.RunQueriesDryController,

  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.CommitRepoController,
  controllers.GetRepoController,
  controllers.MergeRepoController,
  controllers.PullRepoController,
  controllers.PushRepoController,
  controllers.RevertRepoToLastCommitController,
  controllers.RevertRepoToProductionController,

  controllers.RebuildStructSpecialController,

  controllers.ConfirmUserEmailController,
  controllers.DeleteUserController,
  controllers.GetUserProfileController,
  controllers.LoginUserController,
  controllers.LogoutUserController,
  controllers.RegisterUserController,
  controllers.ResendUserEmailController,
  controllers.ResetUserPasswordController,
  controllers.SetUserNameController,
  controllers.SetUserTimezoneController,
  controllers.UpdateUserPasswordController,

  controllers.GetViewsController,

  controllers.CreateVizController,
  controllers.DeleteVizController,
  controllers.GetVizsController,
  controllers.ModifyVizController,

  controllers.CheckController
];
