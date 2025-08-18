import * as nodegit from '@figma/nodegit';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { Config } from '~disk/interfaces/config';
import { ItemCatalog } from '~disk/interfaces/item-catalog';
import { ItemStatus } from '~disk/interfaces/item-status';
import { ensureDir } from '~disk/models/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/models/disk/get-nodes-and-files';
import { isPathExist } from '~disk/models/disk/is-path-exist';
import { cloneRemoteToDev } from '~disk/models/git/clone-remote-to-dev';
import { getRepoStatus } from '~disk/models/git/get-repo-status';
import { prepareRemoteAndProd } from '~disk/models/git/prepare-remote-and-prod';

@Injectable()
export class CreateProjectService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskCreateProjectRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      projectName,
      testProjectId,
      devRepoId,
      userAlias,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_ALREADY_EXIST
      });
    }

    //

    await ensureDir(projectDir);

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
      cloneOptions: cloneOptions,
      gitUrl: gitUrl
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

    let prodItemCatalog = <ItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: common.PROD_REPO_ID,
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
      repoId: common.PROD_REPO_ID,
      repoDir: `${projectDir}/${common.PROD_REPO_ID}`,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let payload: apiToDisk.ToDiskCreateProjectResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      defaultBranch: currentBranch,
      prodFiles: prodItemCatalog.files,
      mproveDir: prodItemCatalog.mproveDir
    };

    return payload;
  }
}
