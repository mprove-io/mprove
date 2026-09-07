import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskSaveFileRequest,
  zToDiskSaveFileRequest
} from '#common/zod/to-disk/07-files/save-file/save-file-request';
import type { ToDiskSaveFileRequestPayload } from '#common/zod/to-disk/07-files/save-file/save-file-request-payload';
import type { ToDiskSaveFileResponsePayload } from '#common/zod/to-disk/07-files/save-file/save-file-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { writeToFile } from '#disk/functions/disk/write-to-file';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { commit } from '#disk/functions/git/commit';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { pushToRemote } from '#disk/functions/git/push-to-remote';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskFileIsNotExistError } from './errors/disk-file-is-not-exist-error';

@Injectable()
export class SaveFileService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskSaveFileResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskSaveFileRequest = zodParseOrThrow({
      schema: zToDiskSaveFileRequest,
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
      content,
      userAlias
    }: ToDiskSaveFileRequestPayload = requestValid.payload;

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

    let saveFileResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${relativeFilePath}`
      }),
      Result.bind('keyDir', item =>
        this.restoreService.checkOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: item.orgId,
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
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.filePath,
          allowedDir: item.repoDir
        });
        return Result.succeed();
      }),
      Result.bind('isFileExist', item => isPathExist({ path: item.filePath })),
      Result.andThrough(item =>
        item.isFileExist === false
          ? Result.fail(new DiskFileIsNotExistError())
          : Result.succeed()
      ),
      Result.andThrough(item =>
        writeToFile({ filePath: item.filePath, content: content })
      ),
      Result.andThrough(item => addChangesToStage({ repoDir: item.repoDir })),
      Result.andThrough(item =>
        item.repoId === PROD_REPO_ID
          ? commit({
              repoDir: item.repoDir,
              userAlias: userAlias,
              commitMessage: `Modified file ${relativeFilePath}`
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
        (item): ToDiskSaveFileResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(saveFileResult);

    return payload;
  }
}
