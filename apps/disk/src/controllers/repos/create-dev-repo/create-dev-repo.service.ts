import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { isDefined } from '#common/functions/is-defined';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskGetInitialCommitHashError } from '#common/zod/disk/function-errors/disk-get-initial-commit-hash-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskCreateDevRepoOutput } from '#common/zod/disk/routes/repos/create-dev-repo/create-dev-repo-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getInitialCommitHash } from '#disk/controllers/repos/create-dev-repo/get-initial-commit-hash/get-initial-commit-hash';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project/check-restore-org-project';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';

@Injectable()
export class CreateDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    devRepoId: string;
    initialBranch?: string;
    sessionBranch?: string;
  }): Promise<ToDiskResponseResultForOperation<'createDevRepo'>> {
    let { baseProject, devRepoId, initialBranch, sessionBranch } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let createDevRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`,
        sessionBranch: sessionBranch,
        initialBranch: initialBranch,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind(
        'keyDir',
        (v): Result.ResultAsync<string, never> =>
          checkRestoreOrgProject({
            remoteType: v.remoteType,
            orgId: v.orgId,
            orgPath: v.orgPath,
            projectId: v.projectId,
            projectLt: v.projectLt
          })
      ),
      Result.bind(
        'isDevRepoExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.devRepoDir })
      ),
      Result.andThrough(v =>
        v.isDevRepoExist === false
          ? cloneRemoteToDev({
              orgId: v.orgId,
              projectId: v.projectId,
              devRepoId: v.devRepoId,
              orgPath: v.orgPath,
              remoteType: v.remoteType,
              gitUrl: v.gitUrl,
              keyDir: v.keyDir,
              privateKeyEncrypted: v.privateKeyEncrypted,
              publicKey: v.publicKey,
              passPhrase: v.passPhrase
            })
          : Result.succeed()
      ),
      Result.bind(
        'devGit',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.devRepoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
      ),
      Result.bind(
        'initialCommitHash',
        (
          v
        ): Result.ResultAsync<
          string | undefined,
          DiskGetInitialCommitHashError
        > =>
          getInitialCommitHash({
            initialBranch: v.initialBranch,
            sessionBranch: v.sessionBranch,
            projectId: v.projectId,
            projectDir: v.projectDir,
            devRepoId: v.devRepoId,
            devRepoDir: v.devRepoDir,
            devGit: v.devGit
          })
      ),
      Result.bind(
        'devItemStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.devRepoId,
            repoDir: v.devRepoDir,
            git: v.devGit,
            isFetch: false, // or !sessionBranch
            isCheckConflicts: true
          })
      ),
      Result.bind(
        'repoStatus',
        (
          v
        ): Result.Result<
          'NeedPush' | 'NeedCommit' | 'NeedPull' | 'Ok',
          never
        > =>
          Result.succeed(
            isDefined(v.sessionBranch) ? 'NeedPush' : v.devItemStatus.repoStatus
          )
      ),
      Result.bind(
        'itemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.devRepoId,
            readFiles: true,
            isRootMproveDir: false
          })
      ),
      Result.map(
        (v): ToDiskCreateDevRepoOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.devRepoId,
            repoStatus: v.repoStatus,
            repoError: v.devItemStatus.repoError,
            currentBranchId: v.devItemStatus.currentBranch,
            conflicts: v.devItemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.devItemStatus.changesToCommit,
            changesToPush: v.devItemStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir,
          initialCommitHash: v.initialCommitHash
        })
      )
    );

    return createDevRepoResult;
  }
}
