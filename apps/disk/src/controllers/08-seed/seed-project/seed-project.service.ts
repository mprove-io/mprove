import * as nodegit from '@figma/nodegit';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emptyDir, ensureDir } from 'fs-extra';
import { ErEnum } from '~common/enums/er.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskSeedProjectRequest,
  ToDiskSeedProjectResponsePayload
} from '~common/interfaces/to-disk/08-seed/to-disk-seed-project';
import { DiskConfig } from '~disk/config/disk-config';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { cloneRemoteToDev } from '~disk/functions/git/clone-remote-to-dev';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { prepareRemoteAndProd } from '~disk/functions/git/prepare-remote-and-prod';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class SeedProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskSeedProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, devRepoId, userAlias, testProjectId } =
      requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKey, publicKey } = projectLt;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    await ensureDir(orgDir);
    await emptyDir(projectDir);

    //

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    let cloneOptions: nodegit.CloneOptions = {
      fetchOpts: fetchOptions
    };

    await prepareRemoteAndProd({
      projectId: projectId,
      projectName: projectName,
      projectDir: projectDir,
      testProjectId: testProjectId,
      userAlias: userAlias,
      remoteType: remoteType,
      gitUrl: gitUrl,
      cloneOptions: cloneOptions
    });

    await cloneRemoteToDev({
      orgId: orgId,
      projectId: projectId,
      devRepoId: devRepoId,
      orgPath: orgPath,
      remoteType: remoteType,
      gitUrl: gitUrl,
      cloneOptions: cloneOptions
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <DiskItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      repoDir: devRepoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let payload: ToDiskSeedProjectResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: devRepoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
}
