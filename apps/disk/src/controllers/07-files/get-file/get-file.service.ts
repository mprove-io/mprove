import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskGetFileRequest,
  zToDiskGetFileRequest
} from '#common/zod/to-disk/07-files/get-file/get-file-request';
import type { ToDiskGetFileRequestPayload } from '#common/zod/to-disk/07-files/get-file/get-file-request-payload';
import type { ToDiskGetFileResponsePayload } from '#common/zod/to-disk/07-files/get-file/get-file-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getBaseCommitFileContent } from '#disk/functions/git/get-base-commit-file-content';
import { getLastCommitFileContent } from '#disk/functions/git/get-last-commit-file-content';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskFileIsNotExistError } from './errors/disk-file-is-not-exist-error';

@Injectable()
export class GetFileService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskGetFileResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskGetFileRequest = zodParseOrThrow({
      schema: zToDiskGetFileRequest,
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
      builderLeft
    }: ToDiskGetFileRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId } = baseProject;

    let { name: projectName } = projectSt;

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
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.filePath,
          allowedDir: item.repoDir
        });
        return Result.succeed();
      }),
      Result.bind('keyDir', item =>
        this.restoreService.checkOrgProjectRepoBranch({
          remoteType: item.remoteType,
          orgId: item.orgId,
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
      Result.andThrough(item => {
        if (
          item.isExist === false &&
          item.builderLeft === BuilderLeftEnum.Tree
        ) {
          return Result.fail(new DiskFileIsNotExistError());
        }

        return Result.succeed();
      }),
      Result.bind('content', async item => {
        if (item.isExist === false) {
          return Result.succeed('');
        }

        let { content }: { content: string } = await readFileCheckSize({
          filePath: item.filePath,
          getStat: false
        });

        return Result.succeed(content);
      }),
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

        return Result.succeed(undefined);
      }),
      Result.bind('repoStatus', item =>
        getRepoStatus({
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
        getNodesAndFiles({
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
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          originalContent: item.originalContent as string,
          content: item.content,
          isExist: item.isExist
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(getFileResult);

    return payload;
  }
}
