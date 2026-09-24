import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskPushRepoOutput } from '#common/zod/disk/routes/repos/push-repo/push-repo-response';
import type { ProjectLt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch/create-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist/is-local-branch-exist';
import { merge } from '#disk/functions/git/merge/merge';
import { pushToRemote } from '#disk/functions/git/push-to-remote/push-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';

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
  }): Promise<ToDiskResponseResultForOperation<'pushRepo'>> {
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
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`,
        userAlias: userAlias,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        branch: branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind(
        'keyDir',
        (
          v
        ): Result.ResultAsync<
          string,
          DiskCheckRestoreOrgProjectRepoBranchError
        > =>
          checkRestoreOrgProjectRepoBranch({
            remoteType: v.remoteType,
            orgId: v.orgId,
            orgPath: v.orgPath,
            projectId: v.projectId,
            projectLt: v.projectLt,
            repoId: v.repoId,
            branchId: v.branch
          })
      ),
      Result.bind(
        'git',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.repoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
      ),
      Result.andThrough(v =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchName: v.branch,
          git: v.git,
          isFetch: true
        })
      ),
      Result.andThrough(v =>
        pushToRemote({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branch: v.branch,
          git: v.git,
          isFetch: false
        })
      ),
      Result.bind(
        'prodGit',
        (v): Result.ResultAsync<SimpleGit, never> =>
          createGit({
            repoDir: v.prodRepoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.gitUrl,
            privateKeyEncrypted: v.privateKeyEncrypted,
            publicKey: v.publicKey,
            passPhrase: v.passPhrase
          })
      ),
      Result.andThrough(async v => {
        await v.prodGit.fetch('origin', ['--prune']);
        return Result.succeed();
      }),
      Result.bind(
        'isProdBranchExist',
        (v): Result.ResultAsync<boolean, never> =>
          isLocalBranchExist({
            repoDir: v.prodRepoDir,
            localBranch: v.branch
          })
      ),
      Result.andThrough(v =>
        v.isProdBranchExist === false
          ? createBranch({
              repoDir: v.prodRepoDir,
              fromBranch: `origin/${v.branch}`,
              newBranch: v.branch,
              git: v.prodGit
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        merge({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: v.prodRepoDir,
          userAlias: v.userAlias,
          branch: v.branch,
          theirBranch: `origin/${v.branch}`,
          isTheirBranchRemote: true,
          git: v.prodGit
        })
      ),
      Result.bind(
        'repoStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            git: v.git,
            isFetch: true,
            isCheckConflicts: true
          })
      ),
      Result.bind(
        'repoItemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            readFiles: false,
            isRootMproveDir: false
          })
      ),
      Result.andThrough(v =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: v.prodRepoDir,
          branchName: v.branch,
          git: v.prodGit,
          isFetch: false
        })
      ),
      Result.bind(
        'productionItemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: PROD_REPO_ID,
            readFiles: true,
            isRootMproveDir: false
          })
      ),
      Result.map(
        (v): ToDiskPushRepoOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.repoStatus.repoStatus,
            repoError: v.repoStatus.repoError,
            currentBranchId: v.repoStatus.currentBranch,
            conflicts: v.repoStatus.conflicts,
            nodes: v.repoItemCatalog.nodes,
            changesToCommit: v.repoStatus.changesToCommit,
            changesToPush: v.repoStatus.changesToPush
          },
          productionFiles: v.productionItemCatalog.files,
          productionMproveDir: v.productionItemCatalog.mproveDir
        })
      )
    );

    return pushRepoResult;
  }
}
