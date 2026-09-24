import { dirname } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskFromPathIsNotExistError } from '#common/zod/disk/errors/disk-from-path-is-not-exist-error';
import type { DiskToPathAlreadyExistError } from '#common/zod/disk/errors/disk-to-path-already-exist-error';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskMoveCatalogNodeOutput } from '#common/zod/disk/routes/catalogs/move-catalog-node/move-catalog-node-response';
import type { ProjectLt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { movePath } from '#disk/functions/disk/move-path/move-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import { validatePathUnderDir } from '#node-common/functions-result/validate-path-under-dir';

@Injectable()
export class MoveCatalogNodeService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fromNodeId: string;
    toNodeId: string;
  }): Promise<ToDiskResponseResultForOperation<'moveCatalogNode'>> {
    let { baseProject, repoId, branch, fromNodeId, toNodeId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let repoDir: string = `${orgPath}/${orgId}/${projectId}/${repoId}`;

    let fromPath: string = `${repoDir}/${fromNodeId.substring(projectId.length + 1)}`;

    let toPath: string = `${repoDir}/${toNodeId.substring(projectId.length + 1)}`;

    let toParentPath: string = dirname(toPath);

    let moveCatalogNodeResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoDir: repoDir,
        fromPath: fromPath,
        toPath: toPath,
        toParentPath: toParentPath,
        branch: branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.fromPath,
          allowedDir: v.repoDir
        })
      ),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.toPath,
          allowedDir: v.repoDir
        })
      ),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.toParentPath,
          allowedDir: v.repoDir
        })
      ),
      Result.bind(
        'keyDir',
        (
          v
        ): Result.ResultAsync<
          string,
          DiskCheckRestoreOrgProjectRepoBranchError
        > =>
          checkRestoreOrgProjectRepoBranch({
            remoteType: v.remoteType,
            orgId: v.orgId,
            orgPath: v.orgPath,
            projectId: v.projectId,
            projectLt: v.projectLt,
            repoId: v.repoId,
            branchId: v.branch
          })
      ),
      Result.bind(
        'git',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.repoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.projectLt.gitUrl,
            privateKeyEncrypted: v.projectLt.privateKeyEncrypted,
            publicKey: v.projectLt.publicKey,
            passPhrase: v.projectLt.passPhrase
          })
      ),
      Result.andThrough(v =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchName: v.branch,
          git: v.git,
          isFetch: false
        })
      ),
      Result.bind(
        'isFromPathExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.fromPath })
      ),
      Result.andThrough(
        (v): Result.Result<void, DiskFromPathIsNotExistError> =>
          v.isFromPathExist === false
            ? Result.fail({ code: 'DISK_FROM_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind(
        'isToPathExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.toPath })
      ),
      Result.andThrough(
        (v): Result.Result<void, DiskToPathAlreadyExistError> =>
          v.isToPathExist === true
            ? Result.fail({ code: 'DISK_TO_PATH_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(v => ensureDir({ dir: v.toParentPath })),
      Result.andThrough(v =>
        movePath({
          sourcePath: v.fromPath,
          destinationPath: v.toPath
        })
      ),
      Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
      Result.bind(
        'itemStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            git: v.git,
            isFetch: true,
            isCheckConflicts: true
          })
      ),
      Result.bind(
        'itemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            readFiles: true,
            isRootMproveDir: false
          })
      ),
      Result.map(
        (v): ToDiskMoveCatalogNodeOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.itemStatus.repoStatus,
            repoError: v.itemStatus.repoError,
            currentBranchId: v.itemStatus.currentBranch,
            conflicts: v.itemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.itemStatus.changesToCommit,
            changesToPush: v.itemStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return moveCatalogNodeResult;
  }
}
