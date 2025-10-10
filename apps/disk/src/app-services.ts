import { CreateOrgService } from './controllers/01-orgs/create-org/create-org.service';
import { DeleteOrgService } from './controllers/01-orgs/delete-org/delete-org.service';
import { IsOrgExistService } from './controllers/01-orgs/is-org-exist/is-org-exist.service';
import { CreateProjectService } from './controllers/02-projects/create-project/create-project.service';
import { DeleteProjectService } from './controllers/02-projects/delete-project/delete-project.service';
import { IsProjectExistService } from './controllers/02-projects/is-project-exist/is-project-exist.service';
import { CommitRepoService } from './controllers/03-repos/commit-repo/commit-repo.service';
import { CreateDevRepoService } from './controllers/03-repos/create-dev-repo/create-dev-repo.service';
import { DeleteDevRepoService } from './controllers/03-repos/delete-dev-repo/delete-dev-repo.service';
import { MergeRepoService } from './controllers/03-repos/merge-repo/merge-repo.service';
import { PullRepoService } from './controllers/03-repos/pull-repo/pull-repo.service';
import { PushRepoService } from './controllers/03-repos/push-repo/push-repo.service';
import { RevertRepoToLastCommitService } from './controllers/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit.service';
import { RevertRepoToRemoteService } from './controllers/03-repos/revert-repo-to-remote/revert-repo-to-remote.service';
import { SyncRepoService } from './controllers/03-repos/sync-repo/sync-repo.service';
import { GetCatalogFilesService } from './controllers/04-catalogs/get-catalog-files/get-catalog-files.service';
import { GetCatalogNodesService } from './controllers/04-catalogs/get-catalog-nodes/get-catalog-nodes.service';
import { MoveCatalogNodeService } from './controllers/04-catalogs/move-catalog-node/move-catalog-node.service';
import { RenameCatalogNodeService } from './controllers/04-catalogs/rename-catalog-node/rename-catalog-node.service';
import { CreateBranchService } from './controllers/05-branches/create-branch/create-branch.service';
import { DeleteBranchService } from './controllers/05-branches/delete-branch/delete-branch.service';
import { IsBranchExistService } from './controllers/05-branches/is-branch-exist/is-branch-exist.service';
import { CreateFolderService } from './controllers/06-folders/create-folder/create-folder.service';
import { DeleteFolderService } from './controllers/06-folders/delete-folder/delete-folder.service';
import { CreateFileService } from './controllers/07-files/create-file/create-file.service';
import { DeleteFileService } from './controllers/07-files/delete-file/delete-file.service';
import { GetFileService } from './controllers/07-files/get-file/get-file.service';
import { SaveFileService } from './controllers/07-files/save-file/save-file.service';
import { SeedProjectService } from './controllers/08-seed/seed-project/seed-project.service';
import { ConsumerService } from './services/consumer.service';
import { DiskTabService } from './services/disk-tab.service';
import { MessageService } from './services/message.service';

export const appServices = [
  DiskTabService,
  ConsumerService,
  MessageService,

  CreateOrgService,
  DeleteOrgService,
  IsOrgExistService,

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
  RevertRepoToRemoteService,
  SyncRepoService,

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
