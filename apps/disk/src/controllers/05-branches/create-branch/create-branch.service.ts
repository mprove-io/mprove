import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskCreateBranchRequest,
  zToDiskCreateBranchRequest
} from '#common/zod/to-disk/05-branches/create-branch/create-branch-request';
import type { ToDiskCreateBranchRequestPayload } from '#common/zod/to-disk/05-branches/create-branch/create-branch-request-payload';
import type { ToDiskCreateBranchResponsePayload } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { DiskBranchIsNotExistError } from './errors/disk-branch-is-not-exist-error';

@Injectable()
export class CreateBranchService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateBranchResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskCreateBranchRequest = zodParseOrThrow({
      schema: zToDiskCreateBranchRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      newBranch,
      fromBranch,
      isFromRemote
    }: ToDiskCreateBranchRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let createBranchResult = Result.pipe(
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
          branchId:
            item.repoId === PROD_REPO_ID
              ? fromBranch
              : isFromRemote === false
                ? fromBranch
                : undefined
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
      Result.andThrough(item =>
        item.isFromBranchExist === false
          ? Result.fail(new DiskBranchIsNotExistError())
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
        getRepoStatus({
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
        getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.repoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskCreateBranchResponsePayload => ({
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

    let payload = await Result.unwrap(createBranchResult);

    return payload;
  }
}
