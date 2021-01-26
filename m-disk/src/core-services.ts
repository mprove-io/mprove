import { CreateOrganizationService } from './services/01-organizations/create-organization.service';
import { DeleteOrganizationService } from './services/01-organizations/delete-organization.service';
import { IsOrganizationExistService } from './services/01-organizations/is-organization-exist.service';
import { CreateProjectService } from './services/02-projects/create-project.service';
import { DeleteProjectService } from './services/02-projects/delete-project.service';
import { IsProjectExistService } from './services/02-projects/is-project-exist.service';
import { CommitRepoService } from './services/03-repos/commit-repo.service';
import { CreateDevRepoService } from './services/03-repos/create-dev-repo.service';
import { DeleteDevRepoService } from './services/03-repos/delete-dev-repo.service';
import { MergeRepoService } from './services/03-repos/merge-repo.service';
import { PullRepoService } from './services/03-repos/pull-repo.service';
import { PushRepoService } from './services/03-repos/push-repo.service';
import { RevertRepoToLastCommitService } from './services/03-repos/revert-repo-to-last-commit.service';
import { RevertRepoToProductionService } from './services/03-repos/revert-repo-to-production.service';
import { GetCatalogFilesService } from './services/04-catalogs/get-catalog-files.service';
import { GetCatalogNodesService } from './services/04-catalogs/get-catalog-nodes.service';
import { MoveCatalogNodeService } from './services/04-catalogs/move-catalog-node.service';
import { RenameCatalogNodeService } from './services/04-catalogs/rename-catalog-node.service';
import { CreateBranchService } from './services/05-branches/create-branch.service';
import { DeleteBranchService } from './services/05-branches/delete-branch.service';
import { IsBranchExistService } from './services/05-branches/is-branch-exist.service';
import { CreateFolderService } from './services/06-folders/create-folder.service';
import { DeleteFolderService } from './services/06-folders/delete-folder.service';
import { CreateFileService } from './services/07-files/create-file.service';
import { DeleteFileService } from './services/07-files/delete-file.service';
import { GetFileService } from './services/07-files/get-file.service';
import { SaveFileService } from './services/07-files/save-file.service';
import { SeedProjectService } from './services/08-seed/seed-project.service';
import { MessageService } from './services/message.service';

export const coreServices = [
  MessageService,

  CreateOrganizationService,
  DeleteOrganizationService,
  IsOrganizationExistService,

  CreateProjectService,
  DeleteProjectService,
  IsProjectExistService,

  CommitRepoService,
  CreateDevRepoService,
  DeleteDevRepoService,
  MergeRepoService,
  PullRepoService,
  PushRepoService,
  RevertRepoToLastCommitService,
  RevertRepoToProductionService,

  GetCatalogFilesService,
  GetCatalogNodesService,
  MoveCatalogNodeService,
  RenameCatalogNodeService,

  CreateBranchService,
  DeleteBranchService,
  IsBranchExistService,

  CreateFolderService,
  DeleteFolderService,

  CreateFileService,
  DeleteFileService,
  GetFileService,
  SaveFileService,

  SeedProjectService
];
