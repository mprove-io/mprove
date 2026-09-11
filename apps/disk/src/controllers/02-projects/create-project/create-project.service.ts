import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateProjectOutput } from '#common/zod/to-disk/02-projects/create-project/create-project-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { prepareRemoteAndProd } from '#disk/functions/git/prepare-remote-and-prod';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { checkProjectDoesNotExist } from './check-project-does-not-exist';

@Injectable()
export class CreateProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    seedProjectId?: string;
    devRepoId: string;
    userAlias: string;
  }): Promise<ToDiskResultFor<'ToDiskCreateProject'>> {
    let { baseProject, seedProjectId, devRepoId, userAlias } = item;

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

    let createProjectResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        keyDir: `${orgPath}/${orgId}/_keys/${projectId}`,
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`
      }),
      Result.andThrough(() =>
        checkRestoreOrg({
          orgId: orgId,
          orgPath: orgPath
        })
      ),
      Result.andThrough(item =>
        checkProjectDoesNotExist({ projectDir: item.projectDir })
      ),
      Result.andThrough(item => ensureDir({ dir: item.projectDir })),
      Result.andThrough(item => ensureDir({ dir: item.keyDir })),
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
          devRepoId: devRepoId,
          orgPath: orgPath,
          remoteType: remoteType,
          gitUrl: gitUrl,
          keyDir: item.keyDir,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.bind('prodItemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.bind('prodGit', item =>
        createGit({
          repoDir: item.prodRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.bind('prodItemStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          git: item.prodGit,
          isFetch: true,
          isCheckConflicts: true
        })
      ),
      Result.map(
        (item): ToDiskCreateProjectOutput => ({
          orgId: item.orgId,
          projectId: item.projectId,
          defaultBranch: item.prodItemStatus.currentBranch,
          prodFiles: item.prodItemCatalog.files,
          mproveDir: item.prodItemCatalog.mproveDir
        })
      )
    );

    return createProjectResult;
  }
}
