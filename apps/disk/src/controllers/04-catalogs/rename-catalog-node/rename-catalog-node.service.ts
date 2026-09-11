import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskNewPathAlreadyExistError } from '#common/zod/disk/errors/disk-new-path-already-exist-error';
import type { DiskOldPathIsNotExistError } from '#common/zod/disk/errors/disk-old-path-is-not-exist-error';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskRenameCatalogNodeOutput } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { renamePath } from '#disk/functions/disk/rename-path';
import { validatePathUnderDirWrapped } from '#disk/functions/disk/validate-path-under-dir-wrapped';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class RenameCatalogNodeService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    nodeId: string;
    newName: string;
  }): Promise<ToDiskResultFor<'ToDiskRenameCatalogNode'>> {
    let { baseProject, repoId, branch, nodeId, newName } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let projectDir: string = `${orgPath}/${orgId}/${projectId}`;

    let repoDir: string = `${projectDir}/${repoId}`;

    let oldPath: string =
      repoDir + '/' + nodeId.substring(projectId.length + 1);

    let sourceArray: string[] = oldPath.split('/');

    sourceArray.pop();

    let parentPath: string = sourceArray.join('/');

    let newPath: string = parentPath + '/' + newName;

    let renameCatalogNodeResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: projectDir,
        repoDir: repoDir,
        oldPath: oldPath,
        newPath: newPath
      }),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.oldPath,
          allowedDir: item.repoDir
        })
      ),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.newPath,
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
      Result.bind('isOldPathExist', item =>
        isPathExist({ path: item.oldPath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskOldPathIsNotExistError> =>
          item.isOldPathExist === false
            ? Result.fail({ code: 'DISK_OLD_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind('isNewPathExist', item =>
        isPathExist({ path: item.newPath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskNewPathAlreadyExistError> =>
          item.isNewPathExist === true
            ? Result.fail({ code: 'DISK_NEW_PATH_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item =>
        renamePath({ oldPath: item.oldPath, newPath: item.newPath })
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
        (item): ToDiskRenameCatalogNodeOutput => ({
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

    return renameCatalogNodeResult;
  }
}
