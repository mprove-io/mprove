import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskBranchIsNotExistError } from '#common/zod/disk/errors/disk-branch-is-not-exist-error';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateBranchOutput } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class CreateBranchService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    newBranch: string;
    fromBranch: string;
    isFromRemote: boolean;
  }): Promise<ToDiskResultFor<'ToDiskCreateBranch'>> {
    let { baseProject, repoId, newBranch, fromBranch, isFromRemote } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let restoreBranchId =
      repoId === PROD_REPO_ID
        ? fromBranch
        : isFromRemote === false
          ? fromBranch
          : undefined;

    let createBranchResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
      }),
      Result.bind('keyDir', item =>
        checkRestoreOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: item.orgId,
          orgPath: orgPath,
          projectId: item.projectId,
          projectLt: projectLt,
          repoId: item.repoId,
          branchId: restoreBranchId
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
      Result.bind('isFromBranchExist', item =>
        isFromRemote === true
          ? isRemoteBranchExist({
              repoDir: item.repoDir,
              remoteBranch: fromBranch,
              git: item.git,
              isFetch: true
            })
          : isLocalBranchExist({
              repoDir: item.repoDir,
              localBranch: fromBranch
            })
      ),
      Result.andThrough(
        (item): Result.Result<void, DiskBranchIsNotExistError> =>
          item.isFromBranchExist === false
            ? Result.fail({ code: 'DISK_BRANCH_IS_NOT_EXIST' })
            : Result.succeed()
      ),
      Result.andThrough(item =>
        checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: fromBranch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.andThrough(item =>
        createBranch({
          repoDir: item.repoDir,
          fromBranch:
            isFromRemote === true ? `origin/${fromBranch}` : fromBranch,
          newBranch: newBranch,
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
          isFetch: isFromRemote === true ? false : true,
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
        (item): ToDiskCreateBranchOutput => ({
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

    return createBranchResult;
  }
}
