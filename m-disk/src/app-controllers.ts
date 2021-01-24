import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.CreateOrganizationController,
  controllers.DeleteOrganizationController,
  controllers.IsOrganizationExistController,

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
  controllers.RevertRepoToProductionController,

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
