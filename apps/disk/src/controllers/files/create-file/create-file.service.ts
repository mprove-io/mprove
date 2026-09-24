import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskFileAlreadyExistError } from '#common/zod/disk/errors/disk-file-already-exist-error';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskCreateFileOutput } from '#common/zod/disk/routes/files/create-file/create-file-response';
import type { ProjectLt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { writeToFile } from '#disk/functions/disk/write-to-file/write-to-file';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { commit } from '#disk/functions/git/commit/commit';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { pushToRemote } from '#disk/functions/git/push-to-remote/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import { validatePathUnderDir } from '#node-common/functions-result/validate-path-under-dir';
import { getContentFromFileName } from './get-content-from-file-name/get-content-from-file-name';

@Injectable()
export class CreateFileService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
    parentNodeId: string;
    fileName: string;
    fileText?: string;
  }): Promise<ToDiskResponseResultForOperation<'createFile'>> {
    let {
      baseProject,
      repoId,
      branch,
      userAlias,
      parentNodeId,
      fileName,
      fileText
    } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let parent: string = parentNodeId.substring(projectId.length + 1);

    parent = parent.length > 0 ? parent + '/' : parent;

    let relativeFilePath: string = parent + '/' + fileName;

    let content: string =
      fileText || getContentFromFileName({ fileName: fileName });

    let createFileResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        parentPath: `${orgPath}/${orgId}/${projectId}/${repoId}/${parent}`,
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${parent}${fileName}`,
        relativeFilePath: relativeFilePath,
        userAlias: userAlias,
        content: content,
        branch: branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.parentPath,
          allowedDir: v.repoDir
        })
      ),
      Result.andThrough(v =>
        validatePathUnderDir({
          fullPath: v.filePath,
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
      Result.andThrough(v => ensureDir({ dir: v.parentPath })),
      Result.bind(
        'isFileExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.filePath })
      ),
      Result.andThrough(
        (v): Result.Result<void, DiskFileAlreadyExistError> =>
          v.isFileExist === true
            ? Result.fail({ code: 'DISK_FILE_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(v =>
        writeToFile({ filePath: v.filePath, content: v.content })
      ),
      Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
      Result.andThrough(v =>
        v.repoId === PROD_REPO_ID
          ? commit({
              repoDir: v.repoDir,
              userAlias: v.userAlias,
              commitMessage: `Created file ${v.relativeFilePath}`
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
        (v): ToDiskCreateFileOutput => ({
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
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return createFileResult;
  }
}
