import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import { zToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import { zToDiskCreateOrgResponse } from '#common/zod/to-disk/01-orgs/create-org/create-org-response';
import type { ToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-request';
import { zToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-request';
import type { ToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import { zToDiskDeleteOrgResponse } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-response';
import type { ToDiskIsOrgExistRequest } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-request';
import { zToDiskIsOrgExistRequest } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-request';
import type { ToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import { zToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import type { ToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import { zToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import type { ToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import { zToDiskCreateProjectResponse } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import type { ToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/delete-project/delete-project-request';
import { zToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/delete-project/delete-project-request';
import type { ToDiskDeleteProjectResponse } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import { zToDiskDeleteProjectResponse } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import type { ToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import { zToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import type { ToDiskIsProjectExistResponse } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response';
import { zToDiskIsProjectExistResponse } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response';
import type { ToDiskCommitRepoRequest } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-request';
import { zToDiskCommitRepoRequest } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-request';
import type { ToDiskCommitRepoResponse } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-response';
import { zToDiskCommitRepoResponse } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-response';
import type { ToDiskCreateDevRepoRequest } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request';
import { zToDiskCreateDevRepoRequest } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request';
import type { ToDiskCreateDevRepoResponse } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import { zToDiskCreateDevRepoResponse } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import type { ToDiskDeleteDevRepoRequest } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request';
import { zToDiskDeleteDevRepoRequest } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request';
import type { ToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import { zToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import type { ToDiskMergeRepoRequest } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-request';
import { zToDiskMergeRepoRequest } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-request';
import type { ToDiskMergeRepoResponse } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-response';
import { zToDiskMergeRepoResponse } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-response';
import type { ToDiskPullRepoRequest } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-request';
import { zToDiskPullRepoRequest } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-request';
import type { ToDiskPullRepoResponse } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import { zToDiskPullRepoResponse } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import type { ToDiskPushRepoRequest } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request';
import { zToDiskPushRepoRequest } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request';
import type { ToDiskPushRepoResponse } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import { zToDiskPushRepoResponse } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import type { ToDiskRevertRepoToLastCommitRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import { zToDiskRevertRepoToLastCommitRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import type { ToDiskRevertRepoToLastCommitResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import { zToDiskRevertRepoToLastCommitResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import type { ToDiskRevertRepoToRemoteRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request';
import { zToDiskRevertRepoToRemoteRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request';
import type { ToDiskRevertRepoToRemoteResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import { zToDiskRevertRepoToRemoteResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import type { ToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import { zToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import type { ToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import { zToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import type { ToDiskGetCatalogFilesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-request';
import { zToDiskGetCatalogFilesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-request';
import type { ToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import { zToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import type { ToDiskGetCatalogNodesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request';
import { zToDiskGetCatalogNodesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request';
import type { ToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import { zToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import type { ToDiskMoveCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request';
import { zToDiskMoveCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request';
import type { ToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import { zToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import type { ToDiskRenameCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request';
import { zToDiskRenameCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request';
import type { ToDiskRenameCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import { zToDiskRenameCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import type { ToDiskCreateBranchRequest } from '#common/zod/to-disk/05-branches/create-branch/create-branch-request';
import { zToDiskCreateBranchRequest } from '#common/zod/to-disk/05-branches/create-branch/create-branch-request';
import type { ToDiskCreateBranchResponse } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import { zToDiskCreateBranchResponse } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import type { ToDiskDeleteBranchRequest } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request';
import { zToDiskDeleteBranchRequest } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request';
import type { ToDiskDeleteBranchResponse } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response';
import { zToDiskDeleteBranchResponse } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response';
import type { ToDiskIsBranchExistRequest } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import { zToDiskIsBranchExistRequest } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import type { ToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import { zToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import type { ToDiskCreateFolderRequest } from '#common/zod/to-disk/06-folders/create-folder/create-folder-request';
import { zToDiskCreateFolderRequest } from '#common/zod/to-disk/06-folders/create-folder/create-folder-request';
import type { ToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import { zToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import type { ToDiskDeleteFolderRequest } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request';
import { zToDiskDeleteFolderRequest } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request';
import type { ToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import { zToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import type { ToDiskCreateFileRequest } from '#common/zod/to-disk/07-files/create-file/create-file-request';
import { zToDiskCreateFileRequest } from '#common/zod/to-disk/07-files/create-file/create-file-request';
import type { ToDiskCreateFileResponse } from '#common/zod/to-disk/07-files/create-file/create-file-response';
import { zToDiskCreateFileResponse } from '#common/zod/to-disk/07-files/create-file/create-file-response';
import type { ToDiskDeleteFileRequest } from '#common/zod/to-disk/07-files/delete-file/delete-file-request';
import { zToDiskDeleteFileRequest } from '#common/zod/to-disk/07-files/delete-file/delete-file-request';
import type { ToDiskDeleteFileResponse } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import { zToDiskDeleteFileResponse } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import type { ToDiskGetFileRequest } from '#common/zod/to-disk/07-files/get-file/get-file-request';
import { zToDiskGetFileRequest } from '#common/zod/to-disk/07-files/get-file/get-file-request';
import type { ToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import { zToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import type { ToDiskSaveFileRequest } from '#common/zod/to-disk/07-files/save-file/save-file-request';
import { zToDiskSaveFileRequest } from '#common/zod/to-disk/07-files/save-file/save-file-request';
import type { ToDiskSaveFileResponse } from '#common/zod/to-disk/07-files/save-file/save-file-response';
import { zToDiskSaveFileResponse } from '#common/zod/to-disk/07-files/save-file/save-file-response';
import type { ToDiskSeedProjectRequest } from '#common/zod/to-disk/08-seed/seed-project/seed-project-request';
import { zToDiskSeedProjectRequest } from '#common/zod/to-disk/08-seed/seed-project/seed-project-request';
import type { ToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import { zToDiskSeedProjectResponse } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import type { ToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request';
import { zToDiskCloneTestRepoRequest } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-request';
import type { ToDiskCloneTestRepoResponse } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response';
import { zToDiskCloneTestRepoResponse } from '#common/zod/to-disk/10-test/clone-test-repo/clone-test-repo-response';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';

export type ToDiskOperationRegistry =
  ValidateOperationRegistry<ToDiskOperationRegistrySource>;

type ValidateOperationRegistry<TRegistry extends ToDiskOperationRegistryShape> =
  TRegistry;

type ToDiskOperationRegistryShape = {
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

type ToDiskOperationRegistrySource = {
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

export const zToDiskOperationRegistry = {
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
} satisfies {
  [TOperation in ToDiskOperation]: {
    request: z.ZodType<ToDiskOperationRegistry[TOperation]['request']>;
    response: z.ZodType<ToDiskOperationRegistry[TOperation]['response']>;
  };
};

assertTypesEqual<
  ToDiskOperationRegistry,
  {
    [TOperation in ToDiskOperation]: {
      request: z.infer<
        (typeof zToDiskOperationRegistry)[TOperation]['request']
      >;
      response: z.infer<
        (typeof zToDiskOperationRegistry)[TOperation]['response']
      >;
    };
  }
>({ value: true });
