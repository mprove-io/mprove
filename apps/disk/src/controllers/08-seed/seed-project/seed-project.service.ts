import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { emptyDir, ensureDir } from 'fs-extra';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskSeedProjectOutput } from '#common/zod/to-disk/08-seed/seed-project/seed-project-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { prepareRemoteAndProd } from '#disk/functions/git/prepare-remote-and-prod';
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
  }): Promise<ToDiskResultFor<'ToDiskSeedProject'>> {
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
        keyDir: keyDir
      }),
      Result.andThrough(async () => {
        await ensureDir(orgDir);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await emptyDir(item.projectDir);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await ensureDir(item.keyDir);
        return Result.succeed();
      }),
      Result.andThrough(item =>
        prepareRemoteAndProd({
          projectId: item.projectId,
          projectName: projectName,
          projectDir: item.projectDir,
          seedProjectId: seedProjectId,
          userAlias: userAlias,
          remoteType: remoteType,
          gitUrl: gitUrl,
          keyDir: item.keyDir,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.andThrough(item =>
        cloneRemoteToDev({
          orgId: item.orgId,
          projectId: item.projectId,
          devRepoId: item.devRepoId,
          orgPath: orgPath,
          remoteType: remoteType,
          gitUrl: gitUrl,
          keyDir: item.keyDir,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.bind('devGit', item =>
        createGit({
          repoDir: item.devRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.bind('devItemStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          repoDir: item.devRepoDir,
          git: item.devGit,
          isFetch: true,
          isCheckConflicts: true
        })
      ),
      Result.map(
        (item): ToDiskSeedProjectOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.devRepoId,
            repoStatus: item.devItemStatus.repoStatus,
            repoError: item.devItemStatus.repoError,
            currentBranchId: item.devItemStatus.currentBranch,
            conflicts: item.devItemStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.devItemStatus.changesToCommit,
            changesToPush: item.devItemStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      )
    );

    return seedProjectResult;
  }
}
