import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodegit from 'nodegit';
import { PROD_REPO_ID } from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectLt } from '~common/interfaces/st-lt';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { cloneRemote } from '~disk/functions/git/clone-remote';
import { createBranch } from '~disk/functions/git/create-branch';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '~disk/functions/git/is-remote-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class RestoreService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async checkOrgProjectRepoBranch(item: {
    remoteType: ProjectRemoteTypeEnum;
    orgId: string;
    projectId?: string;
    projectLt?: ProjectLt;
    repoId?: string;
    branchId?: string;
  }): Promise<string> {
    let { remoteType, orgId, projectId, projectLt, repoId, branchId } = item;

    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;

    let keyDir: string;

    let isOrgExist = await isPathExist(orgDir);

    if (isOrgExist === false) {
      await ensureDir(orgDir);
    }

    if (isUndefined(projectId)) {
      return keyDir;
    }

    keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    if (remoteType !== ProjectRemoteTypeEnum.GitClone) {
      return keyDir;
    }

    let projectDir = `${orgDir}/${projectId}`;

    let isProjectExist = await isPathExist(projectDir);

    if (isProjectExist === false) {
      await ensureDir(projectDir);
    }

    let { gitUrl, defaultBranch, privateKeyEncrypted, publicKey, passPhrase } =
      projectLt;

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKeyEncrypted: privateKeyEncrypted,
      publicKey: publicKey,
      passPhrase: passPhrase
    });

    let cloneOptions: nodegit.CloneOptions = {
      fetchOpts: fetchOptions
    };

    let prodRepoDir = `${projectDir}/${PROD_REPO_ID}`;

    let isProdRepoExist = await isPathExist(prodRepoDir);

    if (isProdRepoExist === false) {
      await cloneRemote({
        orgId: orgId,
        projectId: projectId,
        repoId: PROD_REPO_ID,
        orgPath: orgPath,
        remoteType: remoteType,
        gitUrl: gitUrl,
        cloneOptions: cloneOptions
      });
    }

    if (isUndefined(repoId)) {
      return keyDir;
    }

    let repoDir = `${projectDir}/${repoId}`;

    if (repoId !== PROD_REPO_ID) {
      let isRepoExist = await isPathExist(repoDir);

      if (isRepoExist === false) {
        await cloneRemote({
          orgId: orgId,
          projectId: projectId,
          repoId: repoId,
          orgPath: orgPath,
          remoteType: remoteType,
          gitUrl: gitUrl,
          cloneOptions: cloneOptions
        });
      }
    }

    if (isUndefined(branchId)) {
      return keyDir;
    }

    let isLocalBranchExistResult = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branchId
    });

    if (isLocalBranchExistResult === false) {
      await checkoutBranch({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir,
        branchName: defaultBranch,
        fetchOptions: fetchOptions,
        isFetch: false
      });

      let isRemoteBranchExistResult = await isRemoteBranchExist({
        repoDir: repoDir,
        remoteBranch: branchId,
        fetchOptions: fetchOptions,
        isFetch: true
      });

      await createBranch({
        repoDir: repoDir,
        fromBranch:
          isRemoteBranchExistResult === true
            ? `origin/${branchId}`
            : `origin/${defaultBranch}`,
        newBranch: branchId,
        fetchOptions: fetchOptions
      });
    }

    return keyDir;
  }
}
