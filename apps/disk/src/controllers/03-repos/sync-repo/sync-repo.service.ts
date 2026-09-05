import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { LogResult, SimpleGit, StatusResult } from 'simple-git';

import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskSyncRepoRequest } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request';
import type { ToDiskSyncRepoRequestPayload } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-request-payload';
import type { ToDiskSyncRepoResponsePayload } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
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
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskDevRepoCommitDoesNotMatchLocalCommitError } from './errors/disk-dev-repo-commit-does-not-match-local-commit-error';

type SyncData =
  | {
      direction: 'from-server';
      changedFiles: DiskSyncFile[];
      deletedFiles: DiskSyncFile[];
    }
  | {
      direction: 'to-server';
      appliedChangesOnServer: string[];
    };

type WorkingTreePayload = {
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
};

@Injectable()
export class SyncRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskSyncRepoResponsePayload> {
    let requestValid = zodParseOrThrow({
      schema: zToDiskSyncRepoRequest,
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
      lastCommit,
      direction,
      getRepo,
      getRepoNodes
    }: ToDiskSyncRepoRequestPayload = requestValid.payload;

    let changedFiles: DiskSyncFile[] =
      requestValid.payload.direction === 'to-server'
        ? requestValid.payload.changedFiles
        : [];
    let deletedFiles: DiskSyncFile[] =
      requestValid.payload.direction === 'to-server'
        ? requestValid.payload.deletedFiles
        : [];

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

    let syncRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir
      }),
      Result.bind('keyDir', async () => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: orgId,
            projectId: projectId,
            projectLt: projectLt,
            repoId: repoId,
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
        let logResult: LogResult = await item.git.log(['-1']);
        let diskLastCommit = logResult.latest?.hash;

        if (lastCommit !== diskLastCommit) {
          return Result.fail(
            new DiskDevRepoCommitDoesNotMatchLocalCommitError({
              displayData: {
                branch: branch,
                devLastCommit: diskLastCommit,
                localLastCommit: lastCommit
              }
            })
          );
        }

        return Result.succeed();
      }),
      Result.bind('statusResult', async item => {
        let statusResult: StatusResult = await item.git.status();
        return Result.succeed(statusResult);
      }),
      Result.bind('syncData', async item => {
        if (direction === 'from-server') {
          let serverPayload: WorkingTreePayload = await getWorkingTreePayload({
            repoDir: item.repoDir,
            statusResult: item.statusResult
          });

          let syncData: SyncData = {
            direction: 'from-server',
            changedFiles: serverPayload.changedFiles,
            deletedFiles: serverPayload.deletedFiles
          };

          return Result.succeed(syncData);
        }

        let appliedChangesOnServer: string[] = await getSyncAppliedChanges({
          repoDir: item.repoDir,
          changedFiles: changedFiles,
          deletedFiles: deletedFiles,
          statusResult: item.statusResult
        });

        await resetWorkingTreeToHead({
          repoDir: item.repoDir,
          statusResult: item.statusResult
        });

        await applySyncPayload({
          repoDir: item.repoDir,
          changedFiles: changedFiles,
          deletedFiles: deletedFiles
        });

        await addChangesToStage({ repoDir: item.repoDir });

        let syncData: SyncData = {
          direction: 'to-server',
          appliedChangesOnServer: appliedChangesOnServer
        };

        return Result.succeed(syncData);
      }),
      Result.bind('repoStatus', async item => {
        let repoStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: getRepo === true,
          addContent: true,
          expandRenamed: true
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
      Result.map((item): ToDiskSyncRepoResponsePayload => {
        let basePayload = {
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir,
          devChangesToCommit: item.repoStatus.changesToCommit,
          repo:
            getRepo === true
              ? {
                  orgId: item.orgId,
                  projectId: item.projectId,
                  repoId: item.repoId,
                  repoStatus: item.repoStatus.repoStatus,
                  currentBranchId: item.repoStatus.currentBranch,
                  conflicts: item.repoStatus.conflicts,
                  nodes:
                    getRepoNodes === true ? item.itemCatalog.nodes : undefined
                }
              : undefined
        };

        if (item.syncData.direction === 'from-server') {
          return {
            ...basePayload,
            direction: 'from-server',
            changedFiles: item.syncData.changedFiles,
            deletedFiles: item.syncData.deletedFiles
          };
        }

        return {
          ...basePayload,
          direction: 'to-server',
          appliedChangesOnServer: item.syncData.appliedChangesOnServer
        };
      }),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(syncRepoResult);

    return payload;
  }
}
