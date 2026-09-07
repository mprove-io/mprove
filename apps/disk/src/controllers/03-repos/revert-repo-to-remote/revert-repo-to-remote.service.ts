import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskRevertRepoToRemoteRequest } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request';
import type { ToDiskRevertRepoToRemoteRequestPayload } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-request-payload';
import type { ToDiskRevertRepoToRemoteResponsePayload } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { revertRepoToRemote } from '#disk/functions/git/revert-repo-to-remote';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskRemoteBranchIsNotExistError } from './errors/disk-remote-branch-is-not-exist-error';

@Injectable()
export class RevertRepoToRemoteService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(
    request: any
  ): Promise<ToDiskRevertRepoToRemoteResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskRevertRepoToRemoteRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      branch
    }: ToDiskRevertRepoToRemoteRequestPayload = requestValid.payload;

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
        this.restoreService.checkOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: orgId,
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
      Result.andThrough(item =>
        item.remoteBranchExists === false
          ? Result.fail(new DiskRemoteBranchIsNotExistError())
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
        getRepoStatus({
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
        getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskRevertRepoToRemoteResponsePayload => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.repoId,
            repoStatus: item.repoStatus.repoStatus,
            currentBranchId: item.repoStatus.currentBranch,
            conflicts: item.repoStatus.conflicts,
            nodes: item.itemCatalog.nodes,
            changesToCommit: item.repoStatus.changesToCommit,
            changesToPush: item.repoStatus.changesToPush
          },
          files: item.itemCatalog.files,
          mproveDir: item.itemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(revertRepoToRemoteResult);

    return payload;
  }
}
