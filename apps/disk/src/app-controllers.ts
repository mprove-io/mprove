import { CreateOrgController } from './controllers/01-orgs/create-org/create-org.controller';
import { DeleteOrgController } from './controllers/01-orgs/delete-org/delete-org.controller';
import { IsOrgExistController } from './controllers/01-orgs/is-org-exist/is-org-exist.controller';
import { CreateProjectController } from './controllers/02-projects/create-project/create-project.controller';
import { DeleteProjectController } from './controllers/02-projects/delete-project/delete-project.controller';
import { IsProjectExistController } from './controllers/02-projects/is-project-exist/is-project-exist.controller';
import { CommitRepoController } from './controllers/03-repos/commit-repo/commit-repo.controller';
import { CreateDevRepoController } from './controllers/03-repos/create-dev-repo/create-dev-repo.controller';
import { DeleteDevRepoController } from './controllers/03-repos/delete-dev-repo/delete-dev-repo.controller';
import { MergeRepoController } from './controllers/03-repos/merge-repo/merge-repo.controller';
import { PullRepoController } from './controllers/03-repos/pull-repo/pull-repo.controller';
import { PushRepoController } from './controllers/03-repos/push-repo/push-repo.controller';
import { RevertRepoToLastCommitController } from './controllers/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit.controller';
import { RevertRepoToRemoteController } from './controllers/03-repos/revert-repo-to-remote/revert-repo-to-remote.controller';
import { GetCatalogFilesController } from './controllers/04-catalogs/get-catalog-files/get-catalog-files.controller';
import { GetCatalogNodesController } from './controllers/04-catalogs/get-catalog-nodes/get-catalog-nodes.controller';
import { MoveCatalogNodeController } from './controllers/04-catalogs/move-catalog-node/move-catalog-node.controller';
import { RenameCatalogNodeController } from './controllers/04-catalogs/rename-catalog-node/rename-catalog-node.controller';
import { CreateBranchController } from './controllers/05-branches/create-branch/create-branch.controller';
import { DeleteBranchController } from './controllers/05-branches/delete-branch/delete-branch.controller';
import { IsBranchExistController } from './controllers/05-branches/is-branch-exist/is-branch-exist.controller';
import { CreateFolderController } from './controllers/06-folders/create-folder/create-folder.controller';
import { DeleteFolderController } from './controllers/06-folders/delete-folder/delete-folder.controller';
import { CreateFileController } from './controllers/07-files/create-file/create-file.controller';
import { DeleteFileController } from './controllers/07-files/delete-file/delete-file.controller';
import { GetFileController } from './controllers/07-files/get-file/get-file.controller';
import { SaveFileController } from './controllers/07-files/save-file/save-file.controller';
import { SeedProjectController } from './controllers/08-seed/seed-project/seed-project.controller';

export const appControllers = [
  CreateOrgController,
  DeleteOrgController,
  IsOrgExistController,

  CreateProjectController,
  DeleteProjectController,
  IsProjectExistController,

  CommitRepoController,
  CreateDevRepoController,
  DeleteDevRepoController,
  MergeRepoController,
  PullRepoController,
  PushRepoController,
  RevertRepoToLastCommitController,
  RevertRepoToRemoteController,

  GetCatalogFilesController,
  GetCatalogNodesController,
  MoveCatalogNodeController,
  RenameCatalogNodeController,

  CreateBranchController,
  DeleteBranchController,
  IsBranchExistController,

  CreateFolderController,
  DeleteFolderController,

  CreateFileController,
  DeleteFileController,
  GetFileController,
  SaveFileController,

  SeedProjectController
];
