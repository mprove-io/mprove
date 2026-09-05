import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { LogResult, SimpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { isDefined } from '#common/functions/is-defined';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskCreateDevRepoRequest } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request';
import type { ToDiskCreateDevRepoRequestPayload } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-request-payload';
import type { ToDiskCreateDevRepoResponsePayload } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class CreateDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateDevRepoResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskCreateDevRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      devRepoId,
      initialBranch,
      sessionBranch
    }: ToDiskCreateDevRepoRequestPayload = requestValid.payload;

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

    let createDevRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`
      }),
      Result.bind('keyDir', async item => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: item.orgId,
            projectId: item.projectId,
            projectLt: projectLt,
            repoId: undefined,
            branchId: undefined
          });
        return Result.succeed(keyDir);
      }),
      Result.andThrough(async item => {
        let isDevRepoExist: boolean = await isPathExist(item.devRepoDir);

        if (isDevRepoExist === false) {
          await cloneRemoteToDev({
            orgId: item.orgId,
            projectId: item.projectId,
            devRepoId: item.devRepoId,
            orgPath: orgPath,
            remoteType: remoteType,
            gitUrl: gitUrl,
            keyDir: item.keyDir,
            privateKeyEncrypted: privateKeyEncrypted,
            publicKey: publicKey,
            passPhrase: passPhrase
          });
        }

        return Result.succeed();
      }),
      Result.bind('devGit', async item => {
        let devGit: SimpleGit = await createGit({
          repoDir: item.devRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(devGit);
      }),
      Result.bind('initialCommitHash', async item => {
        if (!initialBranch) {
          return Result.succeed(undefined);
        }

        await checkoutBranch({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          repoDir: item.devRepoDir,
          branchName: initialBranch,
          git: item.devGit,
          isFetch: false
        });

        let logResult: LogResult = await item.devGit.log({ n: 1 });

        let initialCommitHash = logResult.latest?.hash?.substring(0, 7);

        if (sessionBranch) {
          await item.devGit.checkout(['-b', sessionBranch]);
        }

        return Result.succeed(initialCommitHash);
      }),
      Result.bind('devItemStatus', async item => {
        let devItemStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          repoDir: item.devRepoDir,
          git: item.devGit,
          isFetch: false, // or !sessionBranch
          isCheckConflicts: true
        });
        return Result.succeed(devItemStatus);
      }),
      Result.bind('repoStatus', item =>
        Result.succeed(
          isDefined(sessionBranch)
            ? RepoStatusEnum.NeedPush
            : item.devItemStatus.repoStatus
        )
      ),
      Result.bind('itemCatalog', async item => {
        let itemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          readFiles: true,
          isRootMproveDir: false
        });
        return Result.succeed(itemCatalog);
      }),
      Result.map(
        (item): ToDiskCreateDevRepoResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.devRepoId,
            repoStatus: item.repoStatus,
            currentBranchId: item.devItemStatus.currentBranch,
            conflicts: item.devItemStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.devItemStatus.changesToCommit,
            changesToPush: item.devItemStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir,
          initialCommitHash: item.initialCommitHash
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(createDevRepoResult);

    return payload;
  }
}
