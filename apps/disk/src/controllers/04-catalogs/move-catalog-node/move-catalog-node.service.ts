import { dirname } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskFromPathIsNotExistError } from '#common/zod/disk/errors/disk-from-path-is-not-exist-error';
import type { DiskToPathAlreadyExistError } from '#common/zod/disk/errors/disk-to-path-already-exist-error';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskMoveCatalogNodeRequest } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request';
import type { ToDiskMoveCatalogNodeRequestPayload } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-request-payload';
import type { ToDiskMoveCatalogNodeResponsePayload } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { movePath } from '#disk/functions/disk/move-path';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class MoveCatalogNodeService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskMoveCatalogNodeResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskMoveCatalogNodeRequest,
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
      fromNodeId,
      toNodeId
    }: ToDiskMoveCatalogNodeRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let moveCatalogNodeResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        fromPath: `${orgPath}/${orgId}/${projectId}/${repoId}/${fromNodeId.substring(projectId.length + 1)}`,
        toPath: `${orgPath}/${orgId}/${projectId}/${repoId}/${toNodeId.substring(projectId.length + 1)}`
      }),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.fromPath,
          allowedDir: item.repoDir
        });

        validatePathUnderDir({
          fullPath: item.toPath,
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
      Result.bind('isFromPathExist', item =>
        isPathExist({ path: item.fromPath })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskFromPathIsNotExistError> =>
          item.isFromPathExist === false
            ? Result.fail({ code: 'DISK_FROM_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind('isToPathExist', item => isPathExist({ path: item.toPath })),
      Result.andThrough(
        (item): Result.Result<void, DiskToPathAlreadyExistError> =>
          item.isToPathExist === true
            ? Result.fail({ code: 'DISK_TO_PATH_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.bind('toParentPath', item => Result.succeed(dirname(item.toPath))),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.toParentPath,
          allowedDir: item.repoDir
        });
        return Result.succeed();
      }),
      Result.andThrough(item => ensureDir({ dir: item.toParentPath })),
      Result.andThrough(item =>
        movePath({
          sourcePath: item.fromPath,
          destinationPath: item.toPath
        })
      ),
      Result.andThrough(item => addChangesToStage({ repoDir: item.repoDir })),
      Result.bind('itemStatus', item =>
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
        (item): ToDiskMoveCatalogNodeResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.itemStatus.repoStatus,
            repoError: item.itemStatus.repoError,
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

    let payload = await Result.unwrap(moveCatalogNodeResult);

    return payload;
  }
}
