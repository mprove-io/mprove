import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskCreateFileRequest,
  zToDiskCreateFileRequest
} from '#common/zod/to-disk/07-files/create-file/create-file-request';
import type { ToDiskCreateFileRequestPayload } from '#common/zod/to-disk/07-files/create-file/create-file-request-payload';
import type { ToDiskCreateFileResponsePayload } from '#common/zod/to-disk/07-files/create-file/create-file-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
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
import { DiskFileAlreadyExistError } from './errors/disk-file-already-exist-error';
import { getContentFromFileName } from './functions/get-content-from-file-name';

@Injectable()
export class CreateFileService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateFileResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskCreateFileRequest = zodParseOrThrow({
      schema: zToDiskCreateFileRequest,
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
      fileName,
      fileText,
      parentNodeId,
      userAlias
    }: ToDiskCreateFileRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId } = baseProject;

    let { name: projectName } = projectSt;

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
        remoteType: baseProject.remoteType,
        projectLt: projectLt,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        branch: branch,
        parentPath: `${orgPath}/${orgId}/${projectId}/${repoId}/${parent}`,
        filePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${parent}${fileName}`,
        relativeFilePath: relativeFilePath,
        content: content,
        userAlias: userAlias
      }),
      Result.bind('keyDir', async item => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: item.remoteType,
            orgId: item.orgId,
            projectId: item.projectId,
            projectLt: item.projectLt,
            repoId: item.repoId,
            branchId: item.branch
          });
        return Result.succeed(keyDir);
      }),
      Result.bind('git', async item => {
        let git: SimpleGit = await createGit({
          repoDir: item.repoDir,
          remoteType: item.remoteType,
          keyDir: item.keyDir,
          gitUrl: item.projectLt.gitUrl,
          privateKeyEncrypted: item.projectLt.privateKeyEncrypted,
          publicKey: item.projectLt.publicKey,
          passPhrase: item.projectLt.passPhrase
        });
        return Result.succeed(git);
      }),
      Result.andThrough(async item => {
        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: item.branch,
          git: item.git,
          isFetch: false
        });
        return Result.succeed();
      }),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.parentPath,
          allowedDir: item.repoDir
        });

        validatePathUnderDir({
          fullPath: item.filePath,
          allowedDir: item.repoDir
        });

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await ensureDir(item.parentPath);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        let isFileExist: boolean = await isPathExist(item.filePath);

        if (isFileExist === true) {
          return Result.fail(new DiskFileAlreadyExistError());
        }

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await writeToFile({
          filePath: item.filePath,
          content: item.content
        });

        await addChangesToStage({ repoDir: item.repoDir });

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        if (item.repoId === PROD_REPO_ID) {
          await commit({
            repoDir: item.repoDir,
            userAlias: item.userAlias,
            commitMessage: `Created file ${item.relativeFilePath}`
          });

          await pushToRemote({
            projectId: item.projectId,
            projectDir: item.projectDir,
            repoId: item.repoId,
            repoDir: item.repoDir,
            branch: item.branch,
            git: item.git,
            isFetch: true
          });
        }

        return Result.succeed();
      }),
      Result.bind('repoStatus', async item => {
        let repoStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: true
        });
        return Result.succeed(repoStatus);
      }),
      Result.bind('itemCatalog', async item => {
        let itemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        });
        return Result.succeed(itemCatalog);
      }),
      Result.map(
        (item): ToDiskCreateFileResponsePayload => ({
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

    let payload = await Result.unwrap(createFileResult);

    return payload;
  }
}
