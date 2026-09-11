import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskFileIsNotExistError } from '#common/zod/disk/errors/disk-file-is-not-exist-error';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskDeleteFileOutput } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { validatePathUnderDirWrapped } from '#disk/functions/disk/validate-path-under-dir-wrapped';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { commit } from '#disk/functions/git/commit';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { pushToRemote } from '#disk/functions/git/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class DeleteFileService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    userAlias: string;
  }): Promise<ToDiskResultFor<'ToDiskDeleteFile'>> {
    let { baseProject, repoId, branch, fileNodeId, userAlias } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let relativeFilePath: string = fileNodeId.substring(projectId.length + 1);

    let deleteFileResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${relativeFilePath}`
      }),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.filePath,
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
      Result.bind('isFileExist', item => isPathExist({ path: item.filePath })),
      Result.andThrough(
        (item): Result.Result<void, DiskFileIsNotExistError> =>
          item.isFileExist === false
            ? Result.fail({ code: 'DISK_FILE_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item => removePath({ path: item.filePath })),
      Result.andThrough(item => addChangesToStage({ repoDir: item.repoDir })),
      Result.andThrough(item =>
        item.repoId === PROD_REPO_ID
          ? commit({
              repoDir: item.repoDir,
              userAlias: userAlias,
              commitMessage: `Deleted file ${relativeFilePath}`
            })
          : Result.succeed()
      ),
      Result.andThrough(item =>
        item.repoId === PROD_REPO_ID
          ? pushToRemote({
              projectId: item.projectId,
              projectDir: item.projectDir,
              repoId: item.repoId,
              repoDir: item.repoDir,
              branch: branch,
              git: item.git,
              isFetch: true
            })
          : Result.succeed()
      ),
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
        (item): ToDiskDeleteFileOutput => ({
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
          deletedFileNodeId: fileNodeId,
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      )
    );

    return deleteFileResult;
  }
}
