import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import type { ToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-request';
import type { ToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import type { ToDiskIsOrgExistRequest } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-request';
import type { ToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import type { ToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import type { ToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import type { ToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/delete-project/delete-project-request';
import type { ToDiskDeleteProjectResponse } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import type { ToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import type { ToDiskIsProjectExistResponse } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response';
import type { ToDiskCommitRepoRequest } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-request';
import type { ToDiskCommitRepoResponse } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-response';
import type { ToDiskCreateDevRepoRequest } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request';
import type { ToDiskCreateDevRepoResponse } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import type { ToDiskDeleteDevRepoRequest } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request';
import type { ToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import type { ToDiskMergeRepoRequest } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-request';
import type { ToDiskMergeRepoResponse } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-response';
import type { ToDiskPullRepoRequest } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-request';
import type { ToDiskPullRepoResponse } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import type { ToDiskPushRepoRequest } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request';
import type { ToDiskPushRepoResponse } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import type { ToDiskRevertRepoToLastCommitRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import type { ToDiskRevertRepoToLastCommitResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import type { ToDiskRevertRepoToRemoteRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request';
import type { ToDiskRevertRepoToRemoteResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import type { ToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import type { ToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import type { ToDiskGetCatalogFilesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-request';
import type { ToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import type { ToDiskGetCatalogNodesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request';
import type { ToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import type { ToDiskMoveCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request';
import type { ToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import type { ToDiskRenameCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request';
import type { ToDiskRenameCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import type { ToDiskCreateBranchRequest } from '#common/zod/to-disk/05-branches/create-branch/create-branch-request';
import type { ToDiskCreateBranchResponse } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import type { ToDiskDeleteBranchRequest } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request';
import type { ToDiskDeleteBranchResponse } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response';
import type { ToDiskIsBranchExistRequest } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import type { ToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import type { ToDiskCreateFolderRequest } from '#common/zod/to-disk/06-folders/create-folder/create-folder-request';
import type { ToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import type { ToDiskDeleteFolderRequest } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request';
import type { ToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import type { ToDiskCreateFileRequest } from '#common/zod/to-disk/07-files/create-file/create-file-request';
import type { ToDiskCreateFileResponse } from '#common/zod/to-disk/07-files/create-file/create-file-response';
import type { ToDiskDeleteFileRequest } from '#common/zod/to-disk/07-files/delete-file/delete-file-request';
import type { ToDiskDeleteFileResponse } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import type { ToDiskGetFileRequest } from '#common/zod/to-disk/07-files/get-file/get-file-request';
import type { ToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import type { ToDiskSaveFileRequest } from '#common/zod/to-disk/07-files/save-file/save-file-request';
import type { ToDiskSaveFileResponse } from '#common/zod/to-disk/07-files/save-file/save-file-response';
import type { ToDiskSeedProjectRequest } from '#common/zod/to-disk/08-seed/seed-project/seed-project-request';
import type { ToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import type { ToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request';
import type { ToDiskCloneTestRepoResponse } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';

type ToDiskOperationContractMap = {
  createOrg: {
    request: ToDiskCreateOrgRequest;
    response: ToDiskCreateOrgResponse;
  };
  deleteOrg: {
    request: ToDiskDeleteOrgRequest;
    response: ToDiskDeleteOrgResponse;
  };
  isOrgExist: {
    request: ToDiskIsOrgExistRequest;
    response: ToDiskIsOrgExistResponse;
  };
  createProject: {
    request: ToDiskCreateProjectRequest;
    response: ToDiskCreateProjectResponse;
  };
  deleteProject: {
    request: ToDiskDeleteProjectRequest;
    response: ToDiskDeleteProjectResponse;
  };
  isProjectExist: {
    request: ToDiskIsProjectExistRequest;
    response: ToDiskIsProjectExistResponse;
  };
  commitRepo: {
    request: ToDiskCommitRepoRequest;
    response: ToDiskCommitRepoResponse;
  };
  createDevRepo: {
    request: ToDiskCreateDevRepoRequest;
    response: ToDiskCreateDevRepoResponse;
  };
  deleteDevRepo: {
    request: ToDiskDeleteDevRepoRequest;
    response: ToDiskDeleteDevRepoResponse;
  };
  mergeRepo: {
    request: ToDiskMergeRepoRequest;
    response: ToDiskMergeRepoResponse;
  };
  pullRepo: {
    request: ToDiskPullRepoRequest;
    response: ToDiskPullRepoResponse;
  };
  pushRepo: {
    request: ToDiskPushRepoRequest;
    response: ToDiskPushRepoResponse;
  };
  revertRepoToLastCommit: {
    request: ToDiskRevertRepoToLastCommitRequest;
    response: ToDiskRevertRepoToLastCommitResponse;
  };
  revertRepoToRemote: {
    request: ToDiskRevertRepoToRemoteRequest;
    response: ToDiskRevertRepoToRemoteResponse;
  };
  syncRepo: {
    request: ToDiskSyncRepoRequest;
    response: ToDiskSyncRepoResponse;
  };
  getCatalogFiles: {
    request: ToDiskGetCatalogFilesRequest;
    response: ToDiskGetCatalogFilesResponse;
  };
  getCatalogNodes: {
    request: ToDiskGetCatalogNodesRequest;
    response: ToDiskGetCatalogNodesResponse;
  };
  moveCatalogNode: {
    request: ToDiskMoveCatalogNodeRequest;
    response: ToDiskMoveCatalogNodeResponse;
  };
  renameCatalogNode: {
    request: ToDiskRenameCatalogNodeRequest;
    response: ToDiskRenameCatalogNodeResponse;
  };
  createBranch: {
    request: ToDiskCreateBranchRequest;
    response: ToDiskCreateBranchResponse;
  };
  deleteBranch: {
    request: ToDiskDeleteBranchRequest;
    response: ToDiskDeleteBranchResponse;
  };
  isBranchExist: {
    request: ToDiskIsBranchExistRequest;
    response: ToDiskIsBranchExistResponse;
  };
  createFolder: {
    request: ToDiskCreateFolderRequest;
    response: ToDiskCreateFolderResponse;
  };
  deleteFolder: {
    request: ToDiskDeleteFolderRequest;
    response: ToDiskDeleteFolderResponse;
  };
  createFile: {
    request: ToDiskCreateFileRequest;
    response: ToDiskCreateFileResponse;
  };
  deleteFile: {
    request: ToDiskDeleteFileRequest;
    response: ToDiskDeleteFileResponse;
  };
  getFile: { request: ToDiskGetFileRequest; response: ToDiskGetFileResponse };
  saveFile: {
    request: ToDiskSaveFileRequest;
    response: ToDiskSaveFileResponse;
  };
  seedProject: {
    request: ToDiskSeedProjectRequest;
    response: ToDiskSeedProjectResponse;
  };
  cloneTestRepo: {
    request: ToDiskCloneTestRepoRequest;
    response: ToDiskCloneTestRepoResponse;
  };
};

type ToDiskOperationContractShape = {
  [TOperation in ToDiskOperation]: {
    request: { operation: TOperation; traceId: string; input: unknown };
    response: {
      operation: TOperation;
      method: string;
      duration: number;
      traceId: string;
      result: unknown;
    };
  };
};

type ValidateOperationContract<TContract extends ToDiskOperationContractShape> =
  TContract;

export type ToDiskOperationContract =
  ValidateOperationContract<ToDiskOperationContractMap>;
