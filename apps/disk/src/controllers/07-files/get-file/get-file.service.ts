import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskGetFileResponsePayload } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { readFileCheckSizeWrapped } from '#disk/functions/disk/read-file-check-size-wrapped';
import { validatePathUnderDirWrapped } from '#disk/functions/disk/validate-path-under-dir-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getBaseCommitFileContent } from '#disk/functions/git/get-base-commit-file-content';
import { getLastCommitFileContent } from '#disk/functions/git/get-last-commit-file-content';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

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
  }): Promise<ToDiskResultFor<'ToDiskGetFile'>> {
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
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${filePathRelative}`
      }),
      Result.andThrough(item =>
        validatePathUnderDirWrapped({
          fullPath: item.filePath,
          allowedDir: item.repoDir
        })
      ),
      Result.bind('keyDir', item =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: item.remoteType,
          orgId: item.orgId,
          orgPath: orgPath,
          projectId: item.projectId,
          projectLt: item.projectLt,
          repoId: item.repoId,
          branchId: item.branch
        })
      ),
      Result.bind('git', item =>
        createGit({
          repoDir: item.repoDir,
          remoteType: item.remoteType,
          keyDir: item.keyDir,
          gitUrl: item.projectLt.gitUrl,
          privateKeyEncrypted: item.projectLt.privateKeyEncrypted,
          publicKey: item.projectLt.publicKey,
          passPhrase: item.projectLt.passPhrase
        })
      ),
      Result.andThrough(item =>
        checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: item.branch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.bind('isExist', item => isPathExist({ path: item.filePath })),
      Result.andThrough(item =>
        item.isExist === false && item.builderLeft === BuilderLeftEnum.Tree
          ? Result.fail({ code: 'DISK_FILE_IS_NOT_EXIST' })
          : Result.succeed()
      ),
      Result.bind('content', item =>
        item.isExist === false
          ? Result.succeed('')
          : Result.pipe(
              readFileCheckSizeWrapped({
                filePath: item.filePath,
                getStat: false
              }),
              Result.map(file => file.content)
            )
      ),
      Result.bind('originalContent', item => {
        if (item.builderLeft === BuilderLeftEnum.ChangesToCommit) {
          return getLastCommitFileContent({
            repoDir: item.repoDir,
            filePathRelative: item.filePathRelative
          });
        }

        if (item.builderLeft === BuilderLeftEnum.ChangesToPush) {
          return getBaseCommitFileContent({
            repoDir: item.repoDir,
            filePathRelative: item.filePathRelative
          });
        }

        return Result.succeed('');
      }),
      Result.bind('repoStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: false,
          isCheckConflicts: false
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
        (item): ToDiskGetFileResponsePayload => ({
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
          originalContent: item.originalContent,
          content: item.content,
          isExist: item.isExist
        })
      )
    );

    return getFileResult;
  }
}
