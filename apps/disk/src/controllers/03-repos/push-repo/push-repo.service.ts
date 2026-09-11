import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskPushRepoOutput } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { merge } from '#disk/functions/git/merge';
import { pushToRemote } from '#disk/functions/git/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class PushRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
  }): Promise<ToDiskResultFor<'ToDiskPushRepo'>> {
    let { baseProject, repoId, branch, userAlias } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let pushRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`
      }),
      Result.bind('keyDir', () =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: orgId,
          orgPath: orgPath,
          projectId: projectId,
          projectLt: projectLt,
          repoId: repoId,
          branchId: branch
        })
      ),
      Result.bind('git', item =>
        createGit({
          repoDir: item.repoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.andThrough(item =>
        checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: branch,
          git: item.git,
          isFetch: true
        })
      ),
      Result.andThrough(item =>
        pushToRemote({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branch: branch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.bind('prodGit', item =>
        createGit({
          repoDir: item.prodRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.andThrough(async item => {
        await item.prodGit.fetch('origin', ['--prune']);
        return Result.succeed();
      }),
      Result.bind('isProdBranchExist', item =>
        isLocalBranchExist({
          repoDir: item.prodRepoDir,
          localBranch: branch
        })
      ),
      Result.andThrough(item =>
        item.isProdBranchExist === false
          ? createBranch({
              repoDir: item.prodRepoDir,
              fromBranch: `origin/${branch}`,
              newBranch: branch,
              git: item.prodGit
            })
          : Result.succeed()
      ),
      Result.andThrough(item =>
        merge({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          userAlias: userAlias,
          branch: branch,
          theirBranch: `origin/${branch}`,
          isTheirBranchRemote: true,
          git: item.prodGit
        })
      ),
      Result.bind('repoStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: true
        })
      ),
      Result.bind('repoItemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: false,
          isRootMproveDir: false
        })
      ),
      Result.andThrough(item =>
        checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          branchName: branch,
          git: item.prodGit,
          isFetch: false
        })
      ),
      Result.bind('productionItemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskPushRepoOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            repoError: item.repoStatus.repoError,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.repoItemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          productionFiles: item.productionItemCatalog.files,
          productionMproveDir: item.productionItemCatalog.mproveDir
        })
      )
    );

    return pushRepoResult;
  }
}
