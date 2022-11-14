import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class MergeRepoService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskMergeRepoRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsStringify:
        this.cs.get<interfaces.Config['diskLogIsStringify']>(
          'diskLogIsStringify'
        ),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      theirBranch,
      isTheirBranchRemote,
      userAlias,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

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

    let isRepoExist = await disk.isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await disk.ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    let isTheirBranchExist =
      isTheirBranchRemote === true
        ? await git.isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: theirBranch,
            fetchOptions: fetchOptions
          })
        : await git.isLocalBranchExist({
            repoDir: repoDir,
            localBranch: theirBranch
          });
    if (isTheirBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_THEIR_BRANCH_IS_NOT_EXIST
      });
    }

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: true
    });

    //

    await git.merge({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      userAlias: userAlias,
      branch: branch,
      theirBranch:
        isTheirBranchRemote === true ? `origin/${theirBranch}` : theirBranch,
      isTheirBranchRemote: isTheirBranchRemote,
      fetchOptions: fetchOptions
    });

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir,
        fetchOptions: fetchOptions,
        isFetch: true,
        isCheckConflicts: true
      })
    );

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: apiToDisk.ToDiskMergeRepoResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
}
