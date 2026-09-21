import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { isUndefined } from '#common/functions/is-undefined';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskCheckRestoreOrgProjectRepoBranchError } from '#common/zod/disk/function-errors/disk-check-restore-org-project-repo-branch-error';
import type { DiskGetEffectiveIsFetchError } from '#common/zod/disk/function-errors/disk-get-effective-is-fetch-error';
import type { DiskGetIsFetchedAfterCheckoutRequestedBranchError } from '#common/zod/disk/function-errors/disk-get-is-fetched-after-checkout-requested-branch-error';
import type { DiskGetNodesAndFilesError } from '#common/zod/disk/function-errors/disk-get-nodes-and-files-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskGetCatalogNodesOutput } from '#common/zod/disk/routes/catalogs/get-catalog-nodes/get-catalog-nodes-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProjectRepoBranch } from '#disk/functions/restore/check-restore-org-project-repo-branch/check-restore-org-project-repo-branch';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { getEffectiveIsFetch } from './get-effective-is-fetch/get-effective-is-fetch';
import { getIsFetchedAfterCheckoutRequestedBranch } from './get-is-fetched-after-checkout-requested-branch/get-is-fetched-after-checkout-requested-branch';

@Injectable()
export class GetCatalogNodesService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch?: string;
    isFetch: boolean;
  }): Promise<ToDiskResponseResultForOperation<'getCatalogNodes'>> {
    let { baseProject, repoId, branch, isFetch } = item;

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

    let getCatalogNodesResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        isFetch: isFetch,
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
      Result.bind(
        'effectiveIsFetch',
        async (v): Result.ResultAsync<boolean, DiskGetEffectiveIsFetchError> =>
          getEffectiveIsFetch({
            isFetch: v.isFetch,
            repoDir: v.repoDir
          })
      ),
      Result.bind(
        'isFetched',
        async (
          v
        ): Result.ResultAsync<
          boolean,
          DiskGetIsFetchedAfterCheckoutRequestedBranchError
        > =>
          isUndefined(v.branch)
            ? Result.succeed(false)
            : getIsFetchedAfterCheckoutRequestedBranch({
                branch: v.branch,
                projectId: v.projectId,
                projectDir: v.projectDir,
                repoId: v.repoId,
                repoDir: v.repoDir,
                git: v.git,
                isFetch: v.effectiveIsFetch
              })
      ),
      Result.bind(
        'itemCatalog',
        (v): Result.ResultAsync<DiskItemCatalog, DiskGetNodesAndFilesError> =>
          getNodesAndFiles({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            readFiles: false,
            isRootMproveDir: false
          })
      ),
      Result.bind(
        'itemStatus',
        (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            git: v.git,
            isFetch: v.isFetched === true ? false : v.effectiveIsFetch,
            isCheckConflicts: true
          })
      ),
      Result.map(
        (v): ToDiskGetCatalogNodesOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.repoId,
            repoStatus: v.itemStatus.repoStatus,
            repoError: v.itemStatus.repoError,
            currentBranchId: v.itemStatus.currentBranch,
            conflicts: v.itemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.itemStatus.changesToCommit,
            changesToPush: v.itemStatus.changesToPush
          }
        })
      )
    );

    return getCatalogNodesResult;
  }
}
