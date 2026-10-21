import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToDiskDeleteFileOutput } from '#common/types/disk/routes/files/delete-file/delete-file-output';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { commit } from '#disk/functions/git/commit/commit';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { pushToRemote } from '#disk/functions/git/push-to-remote/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

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
  }): Promise<DiskResultForOperation<'deleteFile'>> {
    let { baseProject, fileNodeId } = item;

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
        repoId: item.repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${item.repoId}`,
        filePath: `${orgPath}/${orgId}/${projectId}/${item.repoId}/${relativeFilePath}`,
        fileNodeId: item.fileNodeId,
        relativeFilePath: relativeFilePath,
        userAlias: item.userAlias,
        branch: item.branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.filePath,
          allowedDir: v.repoDir
        })
      ),
      Result.bind('keyDir', v =>
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
      Result.bind('git', v =>
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
      Result.bind('isFileExist', v => isPathExist({ path: v.filePath })),
      Result.andThrough(v =>
        v.isFileExist === false
          ? Result.fail({ code: 'DISK_FILE_IS_NOT_EXIST' })
          : Result.succeed()
      ),
      Result.andThrough(v => removePath({ path: v.filePath })),
      Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
      Result.andThrough(v =>
        v.repoId === PROD_REPO_ID
          ? commit({
              repoDir: v.repoDir,
              userAlias: v.userAlias,
              commitMessage: `Deleted file ${v.relativeFilePath}`
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.repoId === PROD_REPO_ID
          ? pushToRemote({
              projectId: v.projectId,
              projectDir: v.projectDir,
              repoId: v.repoId,
              repoDir: v.repoDir,
              branch: v.branch,
              git: v.git,
              isFetch: true
            })
          : Result.succeed()
      ),
      Result.bind('repoStatus', v =>
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
      Result.bind('itemCatalog', v =>
        getNodesAndFiles({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (v): ToDiskDeleteFileOutput => ({
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
          deletedFileNodeId: v.fileNodeId,
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return deleteFileResult;
  }
}
