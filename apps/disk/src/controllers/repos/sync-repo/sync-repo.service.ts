import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { LogResult, SimpleGit, StatusResult } from 'simple-git';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskDevRepoCommitDoesNotMatchLocalCommitError } from '#common/zod/disk/errors/disk-dev-repo-commit-does-not-match-local-commit-error';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { DiskGetSyncDataError } from '#common/zod/disk/function-errors/disk-get-sync-data-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskSyncRepoOutput } from '#common/zod/disk/routes/repos/sync-repo/sync-repo-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import {
  getSyncData,
  type SyncData
} from '#disk/controllers/repos/sync-repo/get-sync-data/get-sync-data';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';

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
  ): Promise<ToDiskResponseResultForOperation<'syncRepo'>> {
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
        repoDir: repoDir,
        getRepoNodes: getRepoNodes,
        getRepo: getRepo,
        deletedFiles: deletedFiles,
        changedFiles: changedFiles,
        direction: direction,
        lastCommit: lastCommit,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        branch: branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind(
        'keyDir',
        (
          v
        ): Result.ResultAsync<
          string,
          DiskCheckRestoreOrgProjectRepoBranchError
        > =>
          checkRestoreOrgProjectRepoBranch({
            remoteType: v.remoteType,
            orgId: v.orgId,
            orgPath: v.orgPath,
            projectId: v.projectId,
            projectLt: v.projectLt,
            repoId: v.repoId,
            branchId: v.branch
          })
      ),
      Result.bind(
        'git',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.repoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
      ),
      Result.andThrough(v =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchName: v.branch,
          git: v.git,
          isFetch: false
        })
      ),
      Result.andThrough(
        async (
          v
        ): Result.ResultAsync<
          void,
          DiskDevRepoCommitDoesNotMatchLocalCommitError
        > => {
          let logResult: LogResult = await v.git.log(['-1']);
          let diskLastCommit = logResult.latest?.hash;

          if (v.lastCommit !== diskLastCommit) {
            return Result.fail({
              code: 'DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT',
              displayData: {
                branch: v.branch,
                devLastCommit: diskLastCommit,
                localLastCommit: v.lastCommit
              }
            });
          }

          return Result.succeed();
        }
      ),
      Result.bind(
        'statusResult',
        async (v): Result.ResultAsync<StatusResult, never> => {
          let statusResult: StatusResult = await v.git.status();
          return Result.succeed(statusResult);
        }
      ),
      Result.bind(
        'syncFilesPayload',
        (v): Result.ResultAsync<SyncData, DiskGetSyncDataError> =>
          getSyncData({
            direction: v.direction,
            repoDir: v.repoDir,
            changedFiles: v.changedFiles,
            deletedFiles: v.deletedFiles,
            statusResult: v.statusResult
          })
      ),
      Result.bind(
        'repoStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            git: v.git,
            isFetch: true,
            isCheckConflicts: v.getRepo === true,
            addContent: true,
            expandRenamed: true
          })
      ),
      Result.bind(
        'itemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            readFiles: true,
            isRootMproveDir: false
          })
      ),
      Result.map((v): ToDiskSyncRepoOutput => {
        let basePayload = {
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir,
          devChangesToCommit: v.repoStatus.changesToCommit,
          repo:
            v.getRepo === true
              ? {
                  orgId: v.orgId,
                  projectId: v.projectId,
                  repoId: v.repoId,
                  repoStatus: v.repoStatus.repoStatus,
                  repoError: v.repoStatus.repoError,
                  currentBranchId: v.repoStatus.currentBranch,
                  conflicts: v.repoStatus.conflicts,
                  nodes:
                    v.getRepoNodes === true ? v.itemCatalog.nodes : undefined
                }
              : undefined
        };

        if (v.syncFilesPayload.direction === 'from-server') {
          return {
            direction: 'from-server',
            ...basePayload,
            changedFiles: v.syncFilesPayload.changedFiles,
            deletedFiles: v.syncFilesPayload.deletedFiles
          };
        }

        return {
          direction: 'to-server',
          ...basePayload,
          appliedChangesOnServer: v.syncFilesPayload.appliedChangesOnServer
        };
      })
    );

    return syncRepoResult;
  }
}
