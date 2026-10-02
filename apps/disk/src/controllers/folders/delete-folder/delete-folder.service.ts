import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { BaseProject } from '#common/types/backend/parts/base-project';
import type { DiskFolderIsNotExistError } from '#common/types/disk/errors/disk-folder-is-not-exist-error';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/types/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/types/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/types/disk/function-errors/disk-get-repo-status-error';
import type { DiskItemCatalog } from '#common/types/disk/parts/disk-item-catalog';
import type { DiskItemStatus } from '#common/types/disk/parts/disk-item-status';
import type { ToDiskDeleteFolderOutput } from '#common/types/disk/routes/folders/delete-folder/delete-folder-output';
import type { ProjectLt } from '#common/types/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

@Injectable()
export class DeleteFolderService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    folderNodeId: string;
  }): Promise<DiskResultForOperation<'deleteFolder'>> {
    let { baseProject, repoId, branch, folderNodeId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let deleteFolderResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        folderAbsolutePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${folderNodeId.substring(projectId.length + 1)}`,
        folderNodeId: folderNodeId,
        branch: branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.folderAbsolutePath,
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
        'isFolderExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.folderAbsolutePath })
      ),
      Result.andThrough(
        (v): Result.Result<void, DiskFolderIsNotExistError> =>
          v.isFolderExist === false
            ? Result.fail({ code: 'DISK_FOLDER_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(v => removePath({ path: v.folderAbsolutePath })),
      Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
      Result.bind(
        'repoStatus',
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
        (v): ToDiskDeleteFolderOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.repoStatus.repoStatus,
            repoError: v.repoStatus.repoError,
            currentBranchId: v.repoStatus.currentBranch,
            conflicts: v.repoStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.repoStatus.changesToCommit,
            changesToPush: v.repoStatus.changesToPush
          },
          deletedFolderNodeId: v.folderNodeId,
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return deleteFolderResult;
  }
}
