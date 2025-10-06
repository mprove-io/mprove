import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectTab } from '~common/interfaces/backend/project-tab';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import {
  ToDiskPushRepoRequest,
  ToDiskPushRepoResponsePayload
} from '~common/interfaces/to-disk/03-repos/to-disk-push-repo';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { createBranch } from '~disk/functions/git/create-branch';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { merge } from '~disk/functions/git/merge';
import { pushToRemote } from '~disk/functions/git/push-to-remote';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { decryptData } from '~node-common/functions/tab/decrypt-data';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class PushRepoService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskPushRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, repoId, branch, userAlias } =
      requestValid.payload;

    let projectTab: ProjectTab = decryptData<ProjectTab>({
      encryptedString: baseProject.tab,
      keyBase64: this.cs.get<DiskConfig['aesKey']>('aesKey')
    });

    let { projectId, remoteType } = baseProject;
    let {
      name: projectName,
      gitUrl,
      defaultBranch,
      privateKey,
      publicKey
    } = projectTab;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let prodRepoDir = `${projectDir}/${PROD_REPO_ID}`;

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await pushToRemote({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branch: branch,
      fetchOptions: fetchOptions
    });

    let isProdBranchExist = await isLocalBranchExist({
      repoDir: prodRepoDir,
      localBranch: branch
    });
    if (isProdBranchExist === false) {
      await createBranch({
        repoDir: prodRepoDir,
        fromBranch: `origin/${branch}`,
        newBranch: branch,
        fetchOptions: fetchOptions
      });
    }

    await merge({
      projectId: projectId,
      projectDir: projectDir,
      repoId: PROD_REPO_ID,
      repoDir: prodRepoDir,
      userAlias: userAlias,
      branch: branch,
      theirBranch: `origin/${branch}`,
      isTheirBranchRemote: true,
      fetchOptions: fetchOptions
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
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let repoItemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: false,
      isRootMproveDir: false
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: PROD_REPO_ID,
      repoDir: prodRepoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    let productionItemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: PROD_REPO_ID,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: ToDiskPushRepoResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: repoItemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      productionFiles: productionItemCatalog.files,
      productionMproveDir: productionItemCatalog.mproveDir
    };

    return payload;
  }
}
