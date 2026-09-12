import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskFolderAlreadyExistError } from '#common/zod/disk/errors/disk-folder-already-exist-error';
import type { DiskParentPathIsNotExistError } from '#common/zod/disk/errors/disk-parent-path-is-not-exist-error';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskCreateFolderOutput } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { validatePathUnderDirWrapped } from '#disk/functions/disk/validate-path-under-dir-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class CreateFolderService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    parentNodeId: string;
    folderName: string;
  }): Promise<ToDiskResultForOperation<'createFolder'>> {
    let { baseProject, repoId, branch, parentNodeId, folderName } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let parent: string = parentNodeId.substring(projectId.length + 1);

    parent = parent.length > 0 ? parent + '/' : parent;

    let parentPath: string =
      `${orgPath}/${orgId}/${projectId}/${repoId}/` + parent;

    let folderAbsolutePath: string = parentPath + folderName;

    let createFolderResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        parentPath: parentPath,
        folderAbsolutePath: folderAbsolutePath
      }),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.parentPath,
          allowedDir: item.repoDir
        })
      ),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.folderAbsolutePath,
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
      Result.bind('isParentPathExist', item =>
        isPathExist({ path: item.parentPath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskParentPathIsNotExistError> =>
          item.isParentPathExist === false
            ? Result.fail({ code: 'DISK_PARENT_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind('isFolderExist', item =>
        isPathExist({ path: item.folderAbsolutePath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskFolderAlreadyExistError> =>
          item.isFolderExist === true
            ? Result.fail({ code: 'DISK_FOLDER_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item => ensureDir({ dir: item.folderAbsolutePath })),
      Result.bind('repoStatus', item =>
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
        (item): ToDiskCreateFolderOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            repoError: item.repoStatus.repoError,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      )
    );

    return createFolderResult;
  }
}
