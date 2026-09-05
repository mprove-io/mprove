import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskPushRepoRequest } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request';
import type { ToDiskPushRepoRequestPayload } from '#common/zod/to-disk/03-repos/push-repo/push-repo-request-payload';
import type { ToDiskPushRepoResponsePayload } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { merge } from '#disk/functions/git/merge';
import { pushToRemote } from '#disk/functions/git/push-to-remote';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class PushRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskPushRepoResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskPushRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      branch,
      userAlias
    }: ToDiskPushRepoRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKeyEncrypted, publicKey, passPhrase } =
      projectLt;

    let pushRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`
      }),
      Result.bind('keyDir', async () => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: orgId,
            projectId: projectId,
            projectLt: projectLt,
            repoId: repoId,
            branchId: branch
          });
        return Result.succeed(keyDir);
      }),
      Result.bind('git', async item => {
        let git: SimpleGit = await createGit({
          repoDir: item.repoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(git);
      }),
      Result.andThrough(async item => {
        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: branch,
          git: item.git,
          isFetch: true
        });
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await pushToRemote({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branch: branch,
          git: item.git,
          isFetch: false
        });
        return Result.succeed();
      }),
      Result.bind('prodGit', async item => {
        let prodGit: SimpleGit = await createGit({
          repoDir: item.prodRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(prodGit);
      }),
      Result.andThrough(async item => {
        await item.prodGit.fetch('origin', ['--prune']);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        let isProdBranchExist: boolean = await isLocalBranchExist({
          repoDir: item.prodRepoDir,
          localBranch: branch
        });

        if (isProdBranchExist === false) {
          await createBranch({
            repoDir: item.prodRepoDir,
            fromBranch: `origin/${branch}`,
            newBranch: branch,
            git: item.prodGit
          });
        }

        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await merge({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          userAlias: userAlias,
          branch: branch,
          theirBranch: `origin/${branch}`,
          isTheirBranchRemote: true,
          git: item.prodGit
        });
        return Result.succeed();
      }),
      Result.bind('repoStatus', async item => {
        let repoStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: true,
          isCheckConflicts: true
        });
        return Result.succeed(repoStatus);
      }),
      Result.bind('repoItemCatalog', async item => {
        let repoItemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: false,
          isRootMproveDir: false
        });
        return Result.succeed(repoItemCatalog);
      }),
      Result.andThrough(async item => {
        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          branchName: branch,
          git: item.prodGit,
          isFetch: false
        });
        return Result.succeed();
      }),
      Result.bind('productionItemCatalog', async item => {
        let productionItemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          readFiles: true,
          isRootMproveDir: false
        });
        return Result.succeed(productionItemCatalog);
      }),
      Result.map(
        (item): ToDiskPushRepoResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.repoItemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          productionFiles: item.productionItemCatalog.files,
          productionMproveDir: item.productionItemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(pushRepoResult);

    return payload;
  }
}
