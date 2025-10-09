import * as nodegit from '@figma/nodegit';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskCreateProjectRequest,
  ToDiskCreateProjectResponsePayload
} from '~common/interfaces/to-disk/02-projects/to-disk-create-project';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { cloneRemoteToDev } from '~disk/functions/git/clone-remote-to-dev';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { prepareRemoteAndProd } from '~disk/functions/git/prepare-remote-and-prod';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { decryptData } from '~node-common/functions/tab/decrypt-data';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class CreateProjectService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskCreateProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, testProjectId, devRepoId, userAlias } =
      requestValid.payload;

    let projectSt: ProjectSt = decryptData<ProjectSt>({
      encryptedString: baseProject.st,
      keyBase64: this.cs.get<DiskConfig['aesKey']>('aesKey')
    });

    let projectLt: ProjectLt = decryptData<ProjectLt>({
      encryptedString: baseProject.lt,
      keyBase64: this.cs.get<DiskConfig['aesKey']>('aesKey')
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKey, publicKey } = projectLt;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === true) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_ALREADY_EXIST
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

    let prodItemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: PROD_REPO_ID,
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
      repoId: PROD_REPO_ID,
      repoDir: `${projectDir}/${PROD_REPO_ID}`,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let payload: ToDiskCreateProjectResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      defaultBranch: currentBranch,
      prodFiles: prodItemCatalog.files,
      mproveDir: prodItemCatalog.mproveDir
    };

    return payload;
  }
}
