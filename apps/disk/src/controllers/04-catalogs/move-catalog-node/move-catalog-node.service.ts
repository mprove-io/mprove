import { dirname } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskFromPathIsNotExistError } from '#common/zod/disk/errors/disk-from-path-is-not-exist-error';
import type { DiskToPathAlreadyExistError } from '#common/zod/disk/errors/disk-to-path-already-exist-error';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskMoveCatalogNodeOutput } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { movePath } from '#disk/functions/disk/move-path';
import { validatePathUnderDirWrapped } from '#disk/functions/disk/validate-path-under-dir-wrapped';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

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
  }): Promise<ToDiskResultFor<'ToDiskMoveCatalogNode'>> {
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
        toParentPath: toParentPath
      }),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.fromPath,
          allowedDir: item.repoDir
        })
      ),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.toPath,
          allowedDir: item.repoDir
        })
      ),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.toParentPath,
          allowedDir: item.repoDir
        })
      ),
      Result.bind('keyDir', item =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: item.orgId,
          orgPath: orgPath,
          projectId: item.projectId,
          projectLt: projectLt,
          repoId: item.repoId,
          branchId: branch
        })
      ),
      Result.bind('git', item =>
        createGit({
          repoDir: item.repoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: projectLt.gitUrl,
          privateKeyEncrypted: projectLt.privateKeyEncrypted,
          publicKey: projectLt.publicKey,
          passPhrase: projectLt.passPhrase
        })
      ),
      Result.andThrough(item =>
        checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: branch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.bind('isFromPathExist', item =>
        isPathExist({ path: item.fromPath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskFromPathIsNotExistError> =>
          item.isFromPathExist === false
            ? Result.fail({ code: 'DISK_FROM_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind('isToPathExist', item => isPathExist({ path: item.toPath })),
      Result.andThrough(
        (item): Result.Result<void, DiskToPathAlreadyExistError> =>
          item.isToPathExist === true
            ? Result.fail({ code: 'DISK_TO_PATH_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item => ensureDir({ dir: item.toParentPath })),
      Result.andThrough(item =>
        movePath({
          sourcePath: item.fromPath,
          destinationPath: item.toPath
        })
      ),
      Result.andThrough(item => addChangesToStage({ repoDir: item.repoDir })),
      Result.bind('itemStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: true
        })
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskMoveCatalogNodeOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.itemStatus.repoStatus,
            repoError: item.itemStatus.repoError,
            currentBranchId: item.itemStatus.currentBranch,
            conflicts: item.itemStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.itemStatus.changesToCommit,
            changesToPush: item.itemStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      )
    );

    return moveCatalogNodeResult;
  }
}
