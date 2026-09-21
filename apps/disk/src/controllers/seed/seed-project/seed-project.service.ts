import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { emptyDir, ensureDir } from 'fs-extra';
import type { SimpleGit } from 'simple-git';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskSeedProjectOutput } from '#common/zod/disk/routes/seed/seed-project/seed-project-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { prepareRemoteAndProd } from '#disk/functions/git/prepare-remote-and-prod/prepare-remote-and-prod';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class SeedProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    seedProjectId?: string;
    devRepoId: string;
    userAlias: string;
  }): Promise<ToDiskResponseResultForOperation<'seedProject'>> {
    let { baseProject, devRepoId, userAlias, seedProjectId } = item;

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

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;
    let keyDir = `${orgDir}/_keys/${projectId}`;

    let seedProjectResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        projectDir: projectDir,
        devRepoDir: devRepoDir,
        keyDir: keyDir,
        orgPath: orgPath,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        remoteType: remoteType,
        userAlias: userAlias,
        seedProjectId: seedProjectId,
        projectName: projectName,
        orgDir: orgDir
      }),
      Result.andThrough(async v => {
        await ensureDir(v.orgDir);
        return Result.succeed();
      }),
      Result.andThrough(async v => {
        await emptyDir(v.projectDir);
        return Result.succeed();
      }),
      Result.andThrough(async v => {
        await ensureDir(v.keyDir);
        return Result.succeed();
      }),
      Result.andThrough(v =>
        prepareRemoteAndProd({
          projectId: v.projectId,
          projectName: v.projectName,
          projectDir: v.projectDir,
          seedProjectId: v.seedProjectId,
          userAlias: v.userAlias,
          remoteType: v.remoteType,
          gitUrl: v.gitUrl,
          keyDir: v.keyDir,
          privateKeyEncrypted: v.privateKeyEncrypted,
          publicKey: v.publicKey,
          passPhrase: v.passPhrase
        })
      ),
      Result.andThrough(v =>
        cloneRemoteToDev({
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
        'devItemStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.devRepoId,
            repoDir: v.devRepoDir,
            git: v.devGit,
            isFetch: true,
            isCheckConflicts: true
          })
      ),
      Result.map(
        (v): ToDiskSeedProjectOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.devRepoId,
            repoStatus: v.devItemStatus.repoStatus,
            repoError: v.devItemStatus.repoError,
            currentBranchId: v.devItemStatus.currentBranch,
            conflicts: v.devItemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.devItemStatus.changesToCommit,
            changesToPush: v.devItemStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return seedProjectResult;
  }
}
