import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodegit from 'nodegit';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class CreateProjectService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskCreateProjectRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS
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

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_ALREADY_EXIST
      });
    }

    //

    await disk.ensureDir(projectDir);

    let keyDir = `${orgDir}/_keys/${projectId}`;
    await disk.ensureDir(keyDir);

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

    await git.prepareRemoteAndProd({
      projectId: projectId,
      projectName: projectName,
      projectDir: projectDir,
      testProjectId: testProjectId,
      userAlias: userAlias,
      remoteType: remoteType,
      cloneOptions: cloneOptions,
      gitUrl: gitUrl
    });

    await git.cloneRemoteToDev({
      orgId: orgId,
      projectId: projectId,
      devRepoId: devRepoId,
      orgPath: orgPath,
      remoteType: remoteType,
      gitUrl: gitUrl,
      cloneOptions: cloneOptions
    });

    let prodItemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: common.PROD_REPO_ID,
      readFiles: true
    });

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: common.PROD_REPO_ID,
        repoDir: `${projectDir}/${common.PROD_REPO_ID}`,
        fetchOptions: fetchOptions
      })
    );

    let payload: apiToDisk.ToDiskCreateProjectResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      defaultBranch: currentBranch,
      prodFiles: prodItemCatalog.files
    };

    return payload;
  }
}
