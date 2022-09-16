import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.CreateOrgController,
  controllers.DeleteOrgController,
  controllers.IsOrgExistController,

  controllers.CreateProjectController,
  controllers.DeleteProjectController,
  controllers.IsProjectExistController,

  controllers.CommitRepoController,
  controllers.CreateDevRepoController,
  controllers.DeleteDevRepoController,
  controllers.MergeRepoController,
  controllers.PullRepoController,
  controllers.PushRepoController,
  controllers.RevertRepoToLastCommitController,
  controllers.RevertRepoToRemoteController,

  controllers.GetCatalogFilesController,
  controllers.GetCatalogNodesController,
  controllers.MoveCatalogNodeController,
  controllers.RenameCatalogNodeController,

  controllers.CreateBranchController,
  controllers.DeleteBranchController,
  controllers.IsBranchExistController,

  controllers.CreateFolderController,
  controllers.DeleteFolderController,

  controllers.CreateFileController,
  controllers.DeleteFileController,
  controllers.GetFileController,
  controllers.SaveFileController,

  controllers.SeedProjectController
];
