import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskCreateFolderRequest,
  zToDiskCreateFolderRequest
} from '#common/zod/to-disk/06-folders/create-folder/create-folder-request';
import type { ToDiskCreateFolderRequestPayload } from '#common/zod/to-disk/06-folders/create-folder/create-folder-request-payload';
import type { ToDiskCreateFolderResponsePayload } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskFolderAlreadyExistError } from './errors/disk-folder-already-exist-error';
import { DiskParentPathIsNotExistError } from './errors/disk-parent-path-is-not-exist-error';

@Injectable()
export class CreateFolderService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateFolderResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskCreateFolderRequest = zodParseOrThrow({
      schema: zToDiskCreateFolderRequest,
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
      folderName,
      parentNodeId
    }: ToDiskCreateFolderRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let parent: string = parentNodeId.substring(projectId.length + 1);

    parent = parent.length > 0 ? parent + '/' : parent;

    let parentPath: string =
      `${orgPath}/${orgId}/${projectId}/${repoId}/` + parent;

    let folderAbsolutePath: string = parentPath + folderName;

    let createFolderResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        parentPath: parentPath,
        folderAbsolutePath: folderAbsolutePath
      }),
      Result.andThrough(item => {
        validatePathUnderDir({
          fullPath: item.parentPath,
          allowedDir: item.repoDir
        });

        validatePathUnderDir({
          fullPath: item.folderAbsolutePath,
          allowedDir: item.repoDir
        });

        return Result.succeed();
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
      Result.bind('isParentPathExist', item =>
        isPathExist({ path: item.parentPath })
      ),
      Result.andThrough(item =>
        item.isParentPathExist === false
          ? Result.fail(new DiskParentPathIsNotExistError())
          : Result.succeed()
      ),
      Result.bind('isFolderExist', item =>
        isPathExist({ path: item.folderAbsolutePath })
      ),
      Result.andThrough(item =>
        item.isFolderExist === true
          ? Result.fail(new DiskFolderAlreadyExistError())
          : Result.succeed()
      ),
      Result.andThrough(item => ensureDir({ dir: item.folderAbsolutePath })),
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
        (item): ToDiskCreateFolderResponsePayload => ({
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

    let payload = await Result.unwrap(createFolderResult);

    return payload;
  }
}
