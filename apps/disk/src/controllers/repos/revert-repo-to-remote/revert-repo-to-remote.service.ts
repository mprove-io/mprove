import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToDiskRevertRepoToRemoteOutput } from '#common/types/disk/routes/repos/revert-repo-to-remote/revert-repo-to-remote-output';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist/is-remote-branch-exist';
import { revertRepoToRemote } from '#disk/functions/git/revert-repo-to-remote/revert-repo-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

@Injectable()
export class RevertRepoToRemoteService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
  }): Promise<DiskResultForOperation<'revertRepoToRemote'>> {
    let { baseProject, repoId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let revertRepoToRemoteResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: projectDir,
        repoId: item.repoId,
        repoDir: repoDir,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        branch: item.branch,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind('keyDir', v =>
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
      Result.bind('git', v =>
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
      Result.bind('isRemoteBranchExist', v =>
        isRemoteBranchExist({
          repoDir: v.repoDir,
          remoteBranch: v.branch,
          git: v.git,
          isFetch: false
        })
      ),
      Result.andThrough(v =>
        v.isRemoteBranchExist === false
          ? Result.fail({ code: 'DISK_REMOTE_BRANCH_IS_NOT_EXIST' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        revertRepoToRemote({
          repoDir: v.repoDir,
          remoteBranch: v.branch,
          git: v.git
        })
      ),
      Result.bind('repoStatus', v =>
        getRepoStatus({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          git: v.git,
          isFetch: false,
          isCheckConflicts: true
        })
      ),
      Result.bind('itemCatalog', v =>
        getNodesAndFiles({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (v): ToDiskRevertRepoToRemoteOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.repoStatus.repoStatus,
            repoError: v.repoStatus.repoError,
            currentBranchId: v.repoStatus.currentBranch,
            conflicts: v.repoStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.repoStatus.changesToCommit,
            changesToPush: v.repoStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir
        })
      )
    );

    return revertRepoToRemoteResult;
  }
}
