import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskRenameCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request';
import type { ToDiskRenameCatalogNodeRequestPayload } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-request-payload';
import type { ToDiskRenameCatalogNodeResponsePayload } from '#common/zod/to-disk/04-catalogs/rename-catalog-node/rename-catalog-node-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { renamePath } from '#disk/functions/disk/rename-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskNewPathAlreadyExistError } from './errors/disk-new-path-already-exist-error';
import { DiskOldPathIsNotExistError } from './errors/disk-old-path-is-not-exist-error';

@Injectable()
export class RenameCatalogNodeService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskRenameCatalogNodeResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskRenameCatalogNodeRequest,
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
      nodeId,
      newName
    }: ToDiskRenameCatalogNodeRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let projectDir: string = `${orgPath}/${orgId}/${projectId}`;
    let repoDir: string = `${projectDir}/${repoId}`;

    let oldPath: string =
      repoDir + '/' + nodeId.substring(projectId.length + 1);

    let sourceArray: string[] = oldPath.split('/');

    sourceArray.pop();

    let parentPath: string = sourceArray.join('/');

    let newPath: string = parentPath + '/' + newName;

    let renameCatalogNodeResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: projectDir,
        repoDir: repoDir,
        oldPath: oldPath,
        newPath: newPath
      }),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.oldPath,
          allowedDir: item.repoDir
        });

        validatePathUnderDir({
          fullPath: item.newPath,
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
        let isOldPathExist: boolean = await isPathExist(item.oldPath);

        if (isOldPathExist === false) {
          return Result.fail(new DiskOldPathIsNotExistError());
        }

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        let isNewPathExist: boolean = await isPathExist(item.newPath);

        if (isNewPathExist === true) {
          return Result.fail(new DiskNewPathAlreadyExistError());
        }

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await renamePath({
          oldPath: item.oldPath,
          newPath: item.newPath
        });
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await addChangesToStage({ repoDir: item.repoDir });
        return Result.succeed();
      }),
      Result.bind('itemStatus', async item => {
        let itemStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: true
        });
        return Result.succeed(itemStatus);
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
        (item): ToDiskRenameCatalogNodeResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.itemStatus.repoStatus,
            currentBranchId: item.itemStatus.currentBranch,
            conflicts: item.itemStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.itemStatus.changesToCommit,
            changesToPush: item.itemStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(renameCatalogNodeResult);

    return payload;
  }
}
