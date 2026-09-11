import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskRemoteBranchIsNotExistError } from '#common/zod/disk/errors/disk-remote-branch-is-not-exist-error';
import type { ProjectLt } from '#common/zod/st-lt';
import type { ToDiskRevertRepoToRemoteOutput } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { revertRepoToRemote } from '#disk/functions/git/revert-repo-to-remote';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

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
  }): Promise<ToDiskResultFor<'ToDiskRevertRepoToRemote'>> {
    let { baseProject, repoId, branch } = item;

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
        repoId: repoId,
        repoDir: repoDir
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
      Result.bind('remoteBranchExists', item =>
        isRemoteBranchExist({
          repoDir: item.repoDir,
          remoteBranch: branch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskRemoteBranchIsNotExistError> =>
          item.remoteBranchExists === false
            ? Result.fail({ code: 'DISK_REMOTE_BRANCH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item =>
        revertRepoToRemote({
          repoDir: item.repoDir,
          remoteBranch: branch,
          git: item.git
        })
      ),
      Result.bind('repoStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: false,
          isCheckConflicts: true
        })
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskRevertRepoToRemoteOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            repoError: item.repoStatus.repoError,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      )
    );

    return revertRepoToRemoteResult;
  }
}
