import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.RebuildStructSpecialController,

  controllers.ConfirmUserEmailController,
  controllers.GetUserProfileController,
  controllers.LoginUserController,
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

  controllers.GetOrgUsersController,

  controllers.GetConnectionsController,
  controllers.CreateConnectionController,
  controllers.EditConnectionController,

  controllers.GetBranchesListController,
  controllers.IsBranchExistController,
  controllers.CreateBranchController,

  controllers.GetRepoController,
  controllers.MergeRepoController
];
