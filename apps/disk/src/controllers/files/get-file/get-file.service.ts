import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetFileContentError } from '#common/zod/disk/function-errors/disk-get-file-content-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskGetFileOutput } from '#common/zod/disk/routes/files/get-file/get-file-response';
import type { ProjectLt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getFileContent } from '#disk/controllers/files/get-file/get-file-content/get-file-content';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getBaseCommitFileContent } from '#disk/functions/git/get-base-commit-file-content/get-base-commit-file-content';
import { getLastCommitFileContent } from '#disk/functions/git/get-last-commit-file-content/get-last-commit-file-content';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

@Injectable()
export class GetFileService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    fileNodeId: string;
    builderLeft: BuilderLeftEnum;
  }): Promise<ToDiskResponseResultForOperation<'getFile'>> {
    let { baseProject, repoId, branch, fileNodeId, builderLeft } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId } = baseProject;

    let filePathRelative: string = fileNodeId.substring(projectId.length + 1);

    let getFileResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        remoteType: baseProject.remoteType,
        projectLt: projectLt,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        branch: branch,
        builderLeft: builderLeft,
        filePathRelative: filePathRelative,
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${filePathRelative}`,
        orgPath: orgPath
      }),
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
      Result.bind(
        'isExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.filePath })
      ),
      Result.andThrough(v =>
        v.isExist === false && v.builderLeft === BuilderLeftEnum.Tree
          ? Result.fail({ code: 'DISK_FILE_IS_NOT_EXIST' })
          : Result.succeed()
      ),
      Result.bind(
        'content',
        async (v): Result.ResultAsync<string, DiskGetFileContentError> =>
          v.isExist === false
            ? Result.succeed('')
            : getFileContent({
                filePath: v.filePath
              })
      ),
      Result.bind(
        'originalContent',
        async (v): Result.ResultAsync<string, never> => {
          if (v.builderLeft === BuilderLeftEnum.ChangesToCommit) {
            return getLastCommitFileContent({
              repoDir: v.repoDir,
              filePathRelative: v.filePathRelative
            });
          }

          if (v.builderLeft === BuilderLeftEnum.ChangesToPush) {
            return getBaseCommitFileContent({
              repoDir: v.repoDir,
              filePathRelative: v.filePathRelative
            });
          }

          return Result.succeed('');
        }
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
            isFetch: false,
            isCheckConflicts: false
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
        (v): ToDiskGetFileOutput => ({
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
          originalContent: v.originalContent,
          content: v.content,
          isExist: v.isExist
        })
      )
    );

    return getFileResult;
  }
}
