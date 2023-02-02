import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodegit from 'nodegit';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class CreateDevRepoService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskCreateDevRepoRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      devRepoId,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await disk.ensureDir(keyDir);

    let cloneOptions: nodegit.CloneOptions = {
      fetchOpts: makeFetchOptions({
        remoteType: remoteType,
        keyDir: keyDir,
        gitUrl: gitUrl,
        privateKey: privateKey,
        publicKey: publicKey
      })
    };

    let isDevRepoExist = await disk.isPathExist(devRepoDir);
    if (isDevRepoExist === false) {
      await git.cloneRemoteToDev({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        orgPath: orgPath,
        remoteType: remoteType,
        gitUrl: gitUrl,
        cloneOptions: cloneOptions
      });
    }

    //

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <interfaces.ItemStatus>await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      repoDir: devRepoDir,
      fetchOptions: cloneOptions.fetchOpts,
      isFetch: true,
      isCheckConflicts: true
    });

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskCreateDevRepoResponsePayload = {
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
