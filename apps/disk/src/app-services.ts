import { CloneTestRepoService } from './controllers/09-test/clone-test-repo/clone-test-repo.service';
import { CreateBranchService } from './controllers/branches/create-branch/create-branch.service';
import { DeleteBranchService } from './controllers/branches/delete-branch/delete-branch.service';
import { IsBranchExistService } from './controllers/branches/is-branch-exist/is-branch-exist.service';
import { GetCatalogFilesService } from './controllers/catalogs/get-catalog-files/get-catalog-files.service';
import { GetCatalogNodesService } from './controllers/catalogs/get-catalog-nodes/get-catalog-nodes.service';
import { MoveCatalogNodeService } from './controllers/catalogs/move-catalog-node/move-catalog-node.service';
import { RenameCatalogNodeService } from './controllers/catalogs/rename-catalog-node/rename-catalog-node.service';
import { CreateFileService } from './controllers/files/create-file/create-file.service';
import { DeleteFileService } from './controllers/files/delete-file/delete-file.service';
import { GetFileService } from './controllers/files/get-file/get-file.service';
import { SaveFileService } from './controllers/files/save-file/save-file.service';
import { CreateFolderService } from './controllers/folders/create-folder/create-folder.service';
import { DeleteFolderService } from './controllers/folders/delete-folder/delete-folder.service';
import { CreateOrgService } from './controllers/orgs/create-org/create-org.service';
import { DeleteOrgService } from './controllers/orgs/delete-org/delete-org.service';
import { IsOrgExistService } from './controllers/orgs/is-org-exist/is-org-exist.service';
import { CreateProjectService } from './controllers/projects/create-project/create-project.service';
import { DeleteProjectService } from './controllers/projects/delete-project/delete-project.service';
import { IsProjectExistService } from './controllers/projects/is-project-exist/is-project-exist.service';
import { CommitRepoService } from './controllers/repos/commit-repo/commit-repo.service';
import { CreateDevRepoService } from './controllers/repos/create-dev-repo/create-dev-repo.service';
import { DeleteDevRepoService } from './controllers/repos/delete-dev-repo/delete-dev-repo.service';
import { MergeRepoService } from './controllers/repos/merge-repo/merge-repo.service';
import { PullRepoService } from './controllers/repos/pull-repo/pull-repo.service';
import { PushRepoService } from './controllers/repos/push-repo/push-repo.service';
import { RevertRepoToLastCommitService } from './controllers/repos/revert-repo-to-last-commit/revert-repo-to-last-commit.service';
import { RevertRepoToRemoteService } from './controllers/repos/revert-repo-to-remote/revert-repo-to-remote.service';
import { SyncRepoService } from './controllers/repos/sync-repo/sync-repo.service';
import { SeedProjectService } from './controllers/seed/seed-project/seed-project.service';
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

  SeedProjectService,

  CloneTestRepoService
];
