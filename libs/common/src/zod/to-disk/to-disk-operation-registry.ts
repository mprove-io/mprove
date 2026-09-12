import { z } from 'zod';
import { zToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import { zToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import { zToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-request';
import { zToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import { zToDiskIsOrgExistRequest } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-request';
import { zToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import { zToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import { zToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import { zToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/delete-project/delete-project-request';
import { zToDiskDeleteProjectResponse } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import { zToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import { zToDiskIsProjectExistResponse } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response';
import { zToDiskCommitRepoRequest } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-request';
import { zToDiskCommitRepoResponse } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-response';
import { zToDiskCreateDevRepoRequest } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request';
import { zToDiskCreateDevRepoResponse } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import { zToDiskDeleteDevRepoRequest } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request';
import { zToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import { zToDiskMergeRepoRequest } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-request';
import { zToDiskMergeRepoResponse } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-response';
import { zToDiskPullRepoRequest } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-request';
import { zToDiskPullRepoResponse } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import { zToDiskPushRepoRequest } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request';
import { zToDiskPushRepoResponse } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import { zToDiskRevertRepoToLastCommitRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import { zToDiskRevertRepoToLastCommitResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import { zToDiskRevertRepoToRemoteRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request';
import { zToDiskRevertRepoToRemoteResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import { zToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import { zToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import { zToDiskGetCatalogFilesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-request';
import { zToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import { zToDiskGetCatalogNodesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request';
import { zToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import { zToDiskMoveCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request';
import { zToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import { zToDiskRenameCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request';
import { zToDiskRenameCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import { zToDiskCreateBranchRequest } from '#common/zod/to-disk/05-branches/create-branch/create-branch-request';
import { zToDiskCreateBranchResponse } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import { zToDiskDeleteBranchRequest } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request';
import { zToDiskDeleteBranchResponse } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response';
import { zToDiskIsBranchExistRequest } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import { zToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import { zToDiskCreateFolderRequest } from '#common/zod/to-disk/06-folders/create-folder/create-folder-request';
import { zToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import { zToDiskDeleteFolderRequest } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request';
import { zToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import { zToDiskCreateFileRequest } from '#common/zod/to-disk/07-files/create-file/create-file-request';
import { zToDiskCreateFileResponse } from '#common/zod/to-disk/07-files/create-file/create-file-response';
import { zToDiskDeleteFileRequest } from '#common/zod/to-disk/07-files/delete-file/delete-file-request';
import { zToDiskDeleteFileResponse } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import { zToDiskGetFileRequest } from '#common/zod/to-disk/07-files/get-file/get-file-request';
import { zToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import { zToDiskSaveFileRequest } from '#common/zod/to-disk/07-files/save-file/save-file-request';
import { zToDiskSaveFileResponse } from '#common/zod/to-disk/07-files/save-file/save-file-response';
import { zToDiskSeedProjectRequest } from '#common/zod/to-disk/08-seed/seed-project/seed-project-request';
import { zToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import { zToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request';
import { zToDiskCloneTestRepoResponse } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/zod/to-disk/to-disk-request-for-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export const toDiskOperationRegistry: {
  [TOperation in ToDiskOperation]: {
    request: z.ZodType<ToDiskRequestForOperation<TOperation>>;
    response: z.ZodType<ToDiskResponseForOperation<TOperation>>;
  };
} = {
  createOrg: {
    request: zToDiskCreateOrgRequest,
    response: zToDiskCreateOrgResponse
  },
  deleteOrg: {
    request: zToDiskDeleteOrgRequest,
    response: zToDiskDeleteOrgResponse
  },
  isOrgExist: {
    request: zToDiskIsOrgExistRequest,
    response: zToDiskIsOrgExistResponse
  },
  createProject: {
    request: zToDiskCreateProjectRequest,
    response: zToDiskCreateProjectResponse
  },
  deleteProject: {
    request: zToDiskDeleteProjectRequest,
    response: zToDiskDeleteProjectResponse
  },
  isProjectExist: {
    request: zToDiskIsProjectExistRequest,
    response: zToDiskIsProjectExistResponse
  },
  commitRepo: {
    request: zToDiskCommitRepoRequest,
    response: zToDiskCommitRepoResponse
  },
  createDevRepo: {
    request: zToDiskCreateDevRepoRequest,
    response: zToDiskCreateDevRepoResponse
  },
  deleteDevRepo: {
    request: zToDiskDeleteDevRepoRequest,
    response: zToDiskDeleteDevRepoResponse
  },
  mergeRepo: {
    request: zToDiskMergeRepoRequest,
    response: zToDiskMergeRepoResponse
  },
  pullRepo: {
    request: zToDiskPullRepoRequest,
    response: zToDiskPullRepoResponse
  },
  pushRepo: {
    request: zToDiskPushRepoRequest,
    response: zToDiskPushRepoResponse
  },
  revertRepoToLastCommit: {
    request: zToDiskRevertRepoToLastCommitRequest,
    response: zToDiskRevertRepoToLastCommitResponse
  },
  revertRepoToRemote: {
    request: zToDiskRevertRepoToRemoteRequest,
    response: zToDiskRevertRepoToRemoteResponse
  },
  syncRepo: {
    request: zToDiskSyncRepoRequest,
    response: zToDiskSyncRepoResponse
  },
  getCatalogFiles: {
    request: zToDiskGetCatalogFilesRequest,
    response: zToDiskGetCatalogFilesResponse
  },
  getCatalogNodes: {
    request: zToDiskGetCatalogNodesRequest,
    response: zToDiskGetCatalogNodesResponse
  },
  moveCatalogNode: {
    request: zToDiskMoveCatalogNodeRequest,
    response: zToDiskMoveCatalogNodeResponse
  },
  renameCatalogNode: {
    request: zToDiskRenameCatalogNodeRequest,
    response: zToDiskRenameCatalogNodeResponse
  },
  createBranch: {
    request: zToDiskCreateBranchRequest,
    response: zToDiskCreateBranchResponse
  },
  deleteBranch: {
    request: zToDiskDeleteBranchRequest,
    response: zToDiskDeleteBranchResponse
  },
  isBranchExist: {
    request: zToDiskIsBranchExistRequest,
    response: zToDiskIsBranchExistResponse
  },
  createFolder: {
    request: zToDiskCreateFolderRequest,
    response: zToDiskCreateFolderResponse
  },
  deleteFolder: {
    request: zToDiskDeleteFolderRequest,
    response: zToDiskDeleteFolderResponse
  },
  createFile: {
    request: zToDiskCreateFileRequest,
    response: zToDiskCreateFileResponse
  },
  deleteFile: {
    request: zToDiskDeleteFileRequest,
    response: zToDiskDeleteFileResponse
  },
  getFile: {
    request: zToDiskGetFileRequest,
    response: zToDiskGetFileResponse
  },
  saveFile: {
    request: zToDiskSaveFileRequest,
    response: zToDiskSaveFileResponse
  },
  seedProject: {
    request: zToDiskSeedProjectRequest,
    response: zToDiskSeedProjectResponse
  },
  cloneTestRepo: {
    request: zToDiskCloneTestRepoRequest,
    response: zToDiskCloneTestRepoResponse
  }
};
