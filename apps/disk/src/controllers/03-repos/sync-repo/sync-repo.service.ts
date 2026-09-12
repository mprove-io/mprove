import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { LogResult, StatusResult } from 'simple-git';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskDevRepoCommitDoesNotMatchLocalCommitError } from '#common/zod/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskSyncRepoOutput } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { applySyncPayloadWrapped } from '#disk/functions/sync/apply-sync-payload-wrapped';
import { getSyncAppliedChangesWrapped } from '#disk/functions/sync/get-sync-applied-changes-wrapped';
import { getWorkingTreePayloadWrapped } from '#disk/functions/sync/get-working-tree-payload-wrapped';
import { resetWorkingTreeToHeadWrapped } from '#disk/functions/sync/reset-working-tree-to-head-wrapped';
import { DiskTabService } from '#disk/services/disk-tab.service';

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
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(
    item:
      | {
          direction: 'from-server';
          baseProject: BaseProject;
          repoId: string;
          branch: string;
          lastCommit: string;
          getRepo?: boolean;
          getRepoNodes?: boolean;
        }
      | {
          direction: 'to-server';
          baseProject: BaseProject;
          repoId: string;
          branch: string;
          lastCommit: string;
          getRepo?: boolean;
          getRepoNodes?: boolean;
          changedFiles: DiskSyncFile[];
          deletedFiles: DiskSyncFile[];
        }
  ): Promise<ToDiskResultForOperation<'syncRepo'>> {
    let {
      baseProject,
      repoId,
      branch,
      lastCommit,
      direction,
      getRepo,
      getRepoNodes
    } = item;

    let changedFiles: DiskSyncFile[] =
      item.direction === 'to-server' ? item.changedFiles : [];
    let deletedFiles: DiskSyncFile[] =
      item.direction === 'to-server' ? item.deletedFiles : [];

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let syncRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir
      }),
      Result.bind('keyDir', () =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: orgId,
          orgPath: orgPath,
          projectId: projectId,
          projectLt: projectLt,
          repoId: repoId,
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
      Result.andThrough(
        async (
          item
        ): Result.ResultAsync<
          void,
          DiskDevRepoCommitDoesNotMatchLocalCommitError
        > => {
          let logResult: LogResult = await item.git.log(['-1']);
          let diskLastCommit = logResult.latest?.hash;

          if (lastCommit !== diskLastCommit) {
            return Result.fail({
              code: 'DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT',
              displayData: {
                branch: branch,
                devLastCommit: diskLastCommit,
                localLastCommit: lastCommit
              }
            });
          }

          return Result.succeed();
        }
      ),
      Result.bind('statusResult', async item => {
        let statusResult: StatusResult = await item.git.status();
        return Result.succeed(statusResult);
      }),
      Result.bind('syncData', item => {
        if (direction === 'from-server') {
          return Result.pipe(
            getWorkingTreePayloadWrapped({
              repoDir: item.repoDir,
              statusResult: item.statusResult
            }),
            Result.map(
              (serverPayload: WorkingTreePayload): SyncData => ({
                direction: 'from-server',
                changedFiles: serverPayload.changedFiles,
                deletedFiles: serverPayload.deletedFiles
              })
            )
          );
        }

        return Result.pipe(
          getSyncAppliedChangesWrapped({
            repoDir: item.repoDir,
            changedFiles: changedFiles,
            deletedFiles: deletedFiles,
            statusResult: item.statusResult
          }),
          Result.andThen(appliedChangesOnServer =>
            Result.pipe(
              resetWorkingTreeToHeadWrapped({
                repoDir: item.repoDir,
                statusResult: item.statusResult
              }),
              Result.andThen(() =>
                applySyncPayloadWrapped({
                  repoDir: item.repoDir,
                  changedFiles: changedFiles,
                  deletedFiles: deletedFiles
                })
              ),
              Result.andThen(() =>
                addChangesToStage({ repoDir: item.repoDir })
              ),
              Result.map(
                (): SyncData => ({
                  direction: 'to-server',
                  appliedChangesOnServer: appliedChangesOnServer
                })
              )
            )
          )
        );
      }),
      Result.bind('repoStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: getRepo === true,
          addContent: true,
          expandRenamed: true
        })
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map((item): ToDiskSyncRepoOutput => {
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
                  repoError: item.repoStatus.repoError,
                  currentBranchId: item.repoStatus.currentBranch,
                  conflicts: item.repoStatus.conflicts,
                  nodes:
                    getRepoNodes === true ? item.itemCatalog.nodes : undefined
                }
              : undefined
        };

        if (item.syncData.direction === 'from-server') {
          return {
            direction: 'from-server',
            ...basePayload,
            changedFiles: item.syncData.changedFiles,
            deletedFiles: item.syncData.deletedFiles
          };
        }

        return {
          direction: 'to-server',
          ...basePayload,
          appliedChangesOnServer: item.syncData.appliedChangesOnServer
        };
      })
    );

    return syncRepoResult;
  }
}
