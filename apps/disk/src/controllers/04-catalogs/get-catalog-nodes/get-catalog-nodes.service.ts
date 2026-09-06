import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskGetCatalogNodesRequest } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request';
import type { ToDiskGetCatalogNodesRequestPayload } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-request-payload';
import type { ToDiskGetCatalogNodesResponsePayload } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskBranchIsNotExistError } from './errors/disk-branch-is-not-exist-error';

@Injectable()
export class GetCatalogNodesService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskGetCatalogNodesResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskGetCatalogNodesRequest,
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
      isFetch
    }: ToDiskGetCatalogNodesRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let getCatalogNodesResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
      }),
      Result.bind('keyDir', async item => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: item.orgId,
            projectId: item.projectId,
            projectLt: projectLt,
            repoId: item.repoId,
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
      Result.bind('effectiveIsFetch', async item => {
        if (isFetch === false) {
          return Result.succeed(false);
        }

        let changesToCommitEarly: DiskFileChange[] = await getChangesToCommit({
          repoDir: item.repoDir
        });

        let repoHasChanges: boolean = changesToCommitEarly.length > 0;

        return Result.succeed(repoHasChanges === true ? false : isFetch);
      }),
      Result.andThrough(async item => {
        if (isUndefined(branch)) {
          return Result.succeed();
        }

        let isBranchExist: boolean = await isLocalBranchExist({
          repoDir: item.repoDir,
          localBranch: branch
        });

        if (isBranchExist === false) {
          return Result.fail(new DiskBranchIsNotExistError());
        }

        return Result.succeed();
      }),
      Result.bind('isFetched', async item => {
        if (isUndefined(branch)) {
          return Result.succeed(false);
        }

        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branchName: branch,
          git: item.git,
          isFetch: item.effectiveIsFetch
        });

        return Result.succeed(true);
      }),
      Result.bind('itemCatalog', async item => {
        let itemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: false,
          isRootMproveDir: false
        });
        return Result.succeed(itemCatalog);
      }),
      Result.bind('itemStatus', async item => {
        let itemStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          git: item.git,
          isFetch: item.isFetched === true ? false : item.effectiveIsFetch,
          isCheckConflicts: true
        });
        return Result.succeed(itemStatus);
      }),
      Result.map(
        (item): ToDiskGetCatalogNodesResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.itemStatus.repoStatus,
            currentBranchId: item.itemStatus.currentBranch,
            conflicts: item.itemStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.itemStatus.changesToCommit,
            changesToPush: item.itemStatus.changesToPush
          }
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(getCatalogNodesResult);

    return payload;
  }
}
