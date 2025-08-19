import * as nodegit from '@figma/nodegit';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emptyDir, ensureDir } from 'fs-extra';
import { ErEnum } from '~common/enums/er.enum';
import {
  ToDiskSeedProjectRequest,
  ToDiskSeedProjectResponsePayload
} from '~common/interfaces/to-disk/08-seed/to-disk-seed-project';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { cloneRemoteToDev } from '~disk/functions/git/clone-remote-to-dev';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { prepareRemoteAndProd } from '~disk/functions/git/prepare-remote-and-prod';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { Config } from '~disk/interfaces/config';
import { ItemCatalog } from '~disk/interfaces/item-catalog';
import { ItemStatus } from '~disk/interfaces/item-status';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class SeedProjectService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskSeedProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      projectName,
      devRepoId,
      userAlias,
      testProjectId,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

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

    let itemCatalog = <ItemCatalog>await getNodesAndFiles({
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
    } = <ItemStatus>await getRepoStatus({
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
