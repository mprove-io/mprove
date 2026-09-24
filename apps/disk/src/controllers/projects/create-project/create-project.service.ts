import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskCreateProjectOutput } from '#common/zod/disk/routes/projects/create-project/create-project-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { prepareRemoteAndProd } from '#disk/functions/git/prepare-remote-and-prod/prepare-remote-and-prod';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org/check-restore-org';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import { checkProjectDoesNotExist } from './check-project-does-not-exist/check-project-does-not-exist';

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
  }): Promise<ToDiskResponseResultForOperation<'createProject'>> {
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
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`,
        devRepoId: devRepoId,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        remoteType: remoteType,
        userAlias: userAlias,
        seedProjectId: seedProjectId,
        projectName: projectName,
        orgPath: orgPath
      }),
      Result.andThrough(v =>
        checkRestoreOrg({
          orgId: v.orgId,
          orgPath: v.orgPath
        })
      ),
      Result.andThrough(v =>
        checkProjectDoesNotExist({ projectDir: v.projectDir })
      ),
      Result.andThrough(v => ensureDir({ dir: v.projectDir })),
      Result.andThrough(v => ensureDir({ dir: v.keyDir })),
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
        'prodItemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: PROD_REPO_ID,
            readFiles: true,
            isRootMproveDir: false
          })
      ),
      Result.bind(
        'prodGit',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.prodRepoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
      ),
      Result.bind(
        'prodItemStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: PROD_REPO_ID,
            repoDir: v.prodRepoDir,
            git: v.prodGit,
            isFetch: true,
            isCheckConflicts: true
          })
      ),
      Result.map(
        (v): ToDiskCreateProjectOutput => ({
          orgId: v.orgId,
          projectId: v.projectId,
          defaultBranch: v.prodItemStatus.currentBranch,
          prodFiles: v.prodItemCatalog.files,
          mproveDir: v.prodItemCatalog.mproveDir
        })
      )
    );

    return createProjectResult;
  }
}
