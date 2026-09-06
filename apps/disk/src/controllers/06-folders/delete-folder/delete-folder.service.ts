import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskDeleteFolderRequest,
  zToDiskDeleteFolderRequest
} from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request';
import type { ToDiskDeleteFolderRequestPayload } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-request-payload';
import type { ToDiskDeleteFolderResponsePayload } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskFolderIsNotExistError } from './errors/disk-folder-is-not-exist-error';

@Injectable()
export class DeleteFolderService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskDeleteFolderResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskDeleteFolderRequest = zodParseOrThrow({
      schema: zToDiskDeleteFolderRequest,
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
      folderNodeId
    }: ToDiskDeleteFolderRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let deleteFolderResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        folderAbsolutePath: `${orgPath}/${orgId}/${projectId}/${repoId}/${folderNodeId.substring(projectId.length + 1)}`
      }),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.folderAbsolutePath,
          allowedDir: item.repoDir
        });
        return Result.succeed();
      }),
      Result.bind('keyDir', async item => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: item.orgId,
            projectId: item.projectId,
            projectLt: projectLt,
            repoId: item.repoId,
            branchId: branch
          });
        return Result.succeed(keyDir);
      }),
      Result.bind('git', async item => {
        let git: SimpleGit = await createGit({
          repoDir: item.repoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(git);
      }),
      Result.andThrough(async item => {
        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: branch,
          git: item.git,
          isFetch: false
        });
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        let isFolderExist: boolean = await isPathExist(item.folderAbsolutePath);

        if (isFolderExist === false) {
          return Result.fail(new DiskFolderIsNotExistError());
        }

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await removePath(item.folderAbsolutePath);

        await addChangesToStage({ repoDir: item.repoDir });

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
        (item): ToDiskDeleteFolderResponsePayload => ({
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
          deletedFolderNodeId: folderNodeId,
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(deleteFolderResult);

    return payload;
  }
}
