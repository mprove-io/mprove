import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskNewPathAlreadyExistError } from '#common/zod/disk/errors/disk-new-path-already-exist-error';
import type { DiskOldPathIsNotExistError } from '#common/zod/disk/errors/disk-old-path-is-not-exist-error';
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
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class RenameCatalogNodeService {
  constructor(
    private diskTabService: DiskTabService,
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
      Result.andThrough(v => {
        validatePathUnderDir({
          fullPath: v.oldPath,
          allowedDir: v.repoDir
        });

        validatePathUnderDir({
          fullPath: v.newPath,
          allowedDir: v.repoDir
        });

        return Result.succeed();
      }),
      Result.bind('keyDir', v =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: v.orgId,
          orgPath: orgPath,
          projectId: v.projectId,
          projectLt: projectLt,
          repoId: v.repoId,
          branchId: branch
        })
      ),
      Result.bind('git', v =>
        createGit({
          repoDir: v.repoDir,
          remoteType: remoteType,
          keyDir: v.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.andThrough(v =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchName: branch,
          git: v.git,
          isFetch: false
        })
      ),
      Result.bind('isOldPathExist', v => isPathExist({ path: v.oldPath })),
      Result.andThrough(
        (v): Result.Result<void, DiskOldPathIsNotExistError> =>
          v.isOldPathExist === false
            ? Result.fail({ code: 'DISK_OLD_PATH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.bind('isNewPathExist', v => isPathExist({ path: v.newPath })),
      Result.andThrough(
        (v): Result.Result<void, DiskNewPathAlreadyExistError> =>
          v.isNewPathExist === true
            ? Result.fail({ code: 'DISK_NEW_PATH_ALREADY_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(v =>
        renamePath({
          oldPath: v.oldPath,
          newPath: v.newPath
        })
      ),
      Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
      Result.bind('itemStatus', v =>
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
      Result.bind('itemCatalog', v =>
        getNodesAndFiles({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (v): ToDiskRenameCatalogNodeResponsePayload => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.itemStatus.repoStatus,
            repoError: v.itemStatus.repoError,
            currentBranchId: v.itemStatus.currentBranch,
            conflicts: v.itemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.itemStatus.changesToCommit,
            changesToPush: v.itemStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(renameCatalogNodeResult);

    return payload;
  }
}
