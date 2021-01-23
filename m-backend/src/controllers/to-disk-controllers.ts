import { ToDiskCreateOrganizationController } from './to-disk/1_organizations/to-disk-create-organization.controller';
import { ToDiskDeleteOrganizationController } from './to-disk/1_organizations/to-disk-delete-organization.controller';
import { ToDiskIsOrganizationExistController } from './to-disk/1_organizations/to-disk-is-organization-exist.controller';
import { ToDiskCreateProjectController } from './to-disk/2_projects/to-disk-create-project.controller';
import { ToDiskDeleteProjectController } from './to-disk/2_projects/to-disk-delete-project.controller';
import { ToDiskIsProjectExistController } from './to-disk/2_projects/to-disk-is-project-exist.controller';
import { ToDiskCommitRepoController } from './to-disk/3_repos/to-disk-commit-repo.controller';
import { ToDiskCreateDevRepoController } from './to-disk/3_repos/to-disk-create-dev-repo.controller';
import { ToDiskDeleteDevRepoController } from './to-disk/3_repos/to-disk-delete-dev-repo.controller';
import { ToDiskMergeRepoController } from './to-disk/3_repos/to-disk-merge-repo.controller';
import { ToDiskPullRepoController } from './to-disk/3_repos/to-disk-pull-repo.controller';
import { ToDiskPushRepoController } from './to-disk/3_repos/to-disk-push-repo.controller';
import { ToDiskRevertRepoToLastCommitController } from './to-disk/3_repos/to-disk-revert-repo-to-last-commit.controller';
import { ToDiskRevertRepoToProductionController } from './to-disk/3_repos/to-disk-revert-repo-to-production.controller';
import { ToDiskGetCatalogFilesController } from './to-disk/4_catalogs/to-disk-get-catalog-files.controller';
import { ToDiskGetCatalogNodesController } from './to-disk/4_catalogs/to-disk-get-catalog-nodes.controller';
import { ToDiskMoveCatalogNodeController } from './to-disk/4_catalogs/to-disk-move-catalog-node.controller';
import { ToDiskRenameCatalogNodeController } from './to-disk/4_catalogs/to-disk-rename-catalog-node.controller';
import { ToDiskCreateBranchController } from './to-disk/5_branches/to-disk-create-branch.controller';
import { ToDiskDeleteBranchController } from './to-disk/5_branches/to-disk-delete-branch.controller';
import { ToDiskIsBranchExistController } from './to-disk/5_branches/to-disk-is-branch-exist.controller';
import { ToDiskCreateFolderController } from './to-disk/6_folders/to-disk-create-folder.controller';
import { ToDiskDeleteFolderController } from './to-disk/6_folders/to-disk-delete-folder.controller';
import { ToDiskCreateFileController } from './to-disk/7_files/to-disk-create-file.controller';
import { ToDiskDeleteFileController } from './to-disk/7_files/to-disk-delete-file.controller';
import { ToDiskGetFileController } from './to-disk/7_files/to-disk-get-file.controller';
import { ToDiskSaveFileController } from './to-disk/7_files/to-disk-save-file.controller';
import { ToDiskSeedProjectController } from './to-disk/8_seed/to-disk-seed-project.controller';

export const toDiskControllers = [
  // Organization
  ToDiskCreateOrganizationController,
  ToDiskDeleteOrganizationController,
  ToDiskIsOrganizationExistController,
  // Project
  ToDiskCreateProjectController,
  ToDiskDeleteProjectController,
  ToDiskIsProjectExistController,
  // Repo
  ToDiskCommitRepoController,
  ToDiskCreateDevRepoController,
  ToDiskDeleteDevRepoController,
  ToDiskMergeRepoController,
  ToDiskPullRepoController,
  ToDiskPushRepoController,
  ToDiskRevertRepoToLastCommitController,
  ToDiskRevertRepoToProductionController,
  // Catalog
  ToDiskGetCatalogFilesController,
  ToDiskGetCatalogNodesController,
  ToDiskMoveCatalogNodeController,
  ToDiskRenameCatalogNodeController,
  // Branch
  ToDiskCreateBranchController,
  ToDiskDeleteBranchController,
  ToDiskIsBranchExistController,
  // Folder
  ToDiskCreateFolderController,
  ToDiskDeleteFolderController,
  // File
  ToDiskCreateFileController,
  ToDiskDeleteFileController,
  ToDiskGetFileController,
  ToDiskSaveFileController,
  // Project
  ToDiskSeedProjectController
];
