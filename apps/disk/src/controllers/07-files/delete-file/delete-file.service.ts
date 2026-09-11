import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskFileIsNotExistError } from '#common/zod/disk/errors/disk-file-is-not-exist-error';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskDeleteFileRequest,
  zToDiskDeleteFileRequest
} from '#common/zod/to-disk/07-files/delete-file/delete-file-request';
import type { ToDiskDeleteFileRequestPayload } from '#common/zod/to-disk/07-files/delete-file/delete-file-request-payload';
import type { ToDiskDeleteFileResponsePayload } from '#common/zod/to-disk/07-files/delete-file/delete-file-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { commit } from '#disk/functions/git/commit';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { pushToRemote } from '#disk/functions/git/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class DeleteFileService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskDeleteFileResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskDeleteFileRequest = zodParseOrThrow({
      schema: zToDiskDeleteFileRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      branch,
      fileNodeId,
      userAlias
    }: ToDiskDeleteFileRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

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
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.filePath,
          allowedDir: item.repoDir
        });
        return Result.succeed();
      }),
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
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
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
        getRepoStatus({
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
        getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskDeleteFileResponsePayload => ({
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
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(deleteFileResult);

    return payload;
  }
}
