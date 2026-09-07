import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskDeleteBranchRequest,
  zToDiskDeleteBranchRequest
} from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request';
import type { ToDiskDeleteBranchRequestPayload } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-request-payload';
import type { ToDiskDeleteBranchResponsePayload } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskDefaultBranchCannotBeDeletedError } from './errors/disk-default-branch-cannot-be-deleted-error';
import { deleteBranchFromRepositories } from './functions/delete-branch-from-repositories';

@Injectable()
export class DeleteBranchService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskDeleteBranchResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskDeleteBranchRequest = zodParseOrThrow({
      schema: zToDiskDeleteBranchRequest,
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
    }: ToDiskDeleteBranchRequestPayload = requestValid.payload;

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

    let deleteBranchResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
      }),
      Result.bind('keyDir', item =>
        this.restoreService.checkOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: item.orgId,
          projectId: item.projectId,
          projectLt: projectLt,
          repoId: item.repoId,
          branchId: branch
        })
      ),
      Result.andThrough(() =>
        branch === defaultBranch
          ? Result.fail(new DiskDefaultBranchCannotBeDeletedError())
          : Result.succeed()
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
          branchName: defaultBranch,
          git: item.git,
          isFetch: false
        })
      ),
      Result.andThrough(item =>
        deleteBranchFromRepositories({
          projectDir: item.projectDir,
          repoId: item.repoId,
          repoDir: item.repoDir,
          branch: branch,
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
          isFetch: true,
          isCheckConflicts: true
        })
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: false,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskDeleteBranchResponsePayload => ({
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
          deletedBranch: branch
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(deleteBranchResult);

    return payload;
  }
}
