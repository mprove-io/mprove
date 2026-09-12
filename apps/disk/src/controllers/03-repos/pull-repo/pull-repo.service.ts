import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskPullRepoOutput } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { merge } from '#disk/functions/git/merge';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class PullRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    userAlias: string;
  }): Promise<ToDiskResultForOperation<'pullRepo'>> {
    let { baseProject, repoId, branch, userAlias } = item;

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

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let pullRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
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
        merge({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          userAlias: userAlias,
          branch: branch,
          theirBranch: `origin/${branch}`,
          isTheirBranchRemote: true,
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
        (item): ToDiskPullRepoOutput => ({
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

    return pullRepoResult;
  }
}
