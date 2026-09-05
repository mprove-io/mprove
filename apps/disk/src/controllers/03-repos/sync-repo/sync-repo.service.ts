import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import type { ToDiskSyncRepoResponsePayload } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { applySyncPayload } from '#node-common/functions/apply-sync-payload';
import { getSyncAppliedChanges } from '#node-common/functions/get-sync-applied-changes';
import { getWorkingTreePayload } from '#node-common/functions/get-sync-files';
import { resetWorkingTreeToHead } from '#node-common/functions/reset-working-tree-to-head';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class SyncRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let requestValid = zodParseOrThrow({
      schema: zToDiskSyncRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, repoId, branch, lastCommit, direction } =
      requestValid.payload;
    let getRepo = requestValid.payload.getRepo === true;
    let getRepoNodes = requestValid.payload.getRepoNodes === true;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKeyEncrypted, publicKey, passPhrase } =
      projectLt;

    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    // let keyDir = `${orgDir}/_keys/${projectId}`;

    // await ensureDir(keyDir);

    // let isOrgExist = await isPathExist(orgDir);
    // if (isOrgExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_ORG_IS_NOT_EXIST
    //   });
    // }

    // let isProjectExist = await isPathExist(projectDir);
    // if (isProjectExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
    //   });
    // }

    // let isRepoExist = await isPathExist(repoDir);
    // if (isRepoExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_REPO_IS_NOT_EXIST
    //   });
    // }

    // let isBranchExist = await isLocalBranchExist({
    //   repoDir: repoDir,
    //   localBranch: branch
    // });
    // if (isBranchExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
    //   });
    // }

    let keyDir = await this.restoreService.checkOrgProjectRepoBranch({
      remoteType: remoteType,
      orgId: orgId,
      projectId: projectId,
      projectLt: projectLt,
      repoId: repoId,
      branchId: branch
    });

    let git = await createGit({
      repoDir: repoDir,
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey: publicKey,
      passPhrase: passPhrase
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      git: git,
      isFetch: false
    });

    let logResult = await git.log(['-1']);
    let diskLastCommit = logResult.latest?.hash;

    if (lastCommit !== diskLastCommit) {
      throw new ServerError({
        message: ErEnum.DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT,
        displayData: {
          branch: branch,
          devLastCommit: diskLastCommit,
          localLastCommit: lastCommit
        }
      });
    }

    let statusResult = await git.status();
    let sourceChangedFiles: DiskSyncFile[] = [];
    let sourceDeletedFiles: DiskSyncFile[] = [];
    let appliedChangesOnServer: string[] = [];

    if (requestValid.payload.direction === 'from-server') {
      let serverPayload = await getWorkingTreePayload({
        repoDir: repoDir,
        statusResult: statusResult
      });

      sourceChangedFiles = serverPayload.changedFiles;
      sourceDeletedFiles = serverPayload.deletedFiles;
    } else {
      sourceChangedFiles = requestValid.payload.changedFiles;
      sourceDeletedFiles = requestValid.payload.deletedFiles;
      appliedChangesOnServer = await getSyncAppliedChanges({
        repoDir: repoDir,
        changedFiles: sourceChangedFiles,
        deletedFiles: sourceDeletedFiles,
        statusResult: statusResult
      });
      await resetWorkingTreeToHead({
        repoDir: repoDir,
        statusResult: statusResult
      });
      await applySyncPayload({
        repoDir: repoDir,
        changedFiles: sourceChangedFiles,
        deletedFiles: sourceDeletedFiles
      });
      await addChangesToStage({ repoDir: repoDir });
    }

    let { repoStatus, currentBranch, conflicts, changesToCommit } = <
      DiskItemStatus
    >await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      git: git,
      isFetch: true,
      isCheckConflicts: getRepo,
      addContent: true,
      expandRenamed: true
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let repo =
      getRepo === true
        ? {
            orgId: orgId,
            projectId: projectId,
            repoId: repoId,
            repoStatus: repoStatus,
            currentBranchId: currentBranch,
            conflicts: conflicts,
            nodes: getRepoNodes === true ? itemCatalog.nodes : undefined
          }
        : undefined;

    let basePayload = {
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir,
      devChangesToCommit: changesToCommit,
      repo: repo
    };

    let payload: ToDiskSyncRepoResponsePayload;
    if (requestValid.payload.direction === 'from-server') {
      payload = {
        ...basePayload,
        direction: 'from-server',
        changedFiles: sourceChangedFiles,
        deletedFiles: sourceDeletedFiles
      };
    } else {
      payload = {
        ...basePayload,
        direction: 'to-server',
        appliedChangesOnServer: appliedChangesOnServer
      };
    }

    return payload;
  }
}
