import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskGetFileRequest,
  ToDiskGetFileResponsePayload
} from '~common/interfaces/to-disk/07-files/to-disk-get-file';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { getBaseCommitFileContent } from '~disk/functions/git/get-base-commit-file-content';
import { getLastCommitFileContent } from '~disk/functions/git/get-last-commit-file-content';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { readFileCheckSize } from '~node-common/functions/read-file-check-size';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class GetFileService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskGetFileRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, baseProject, repoId, branch, fileNodeId, panel } =
      requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, defaultBranch, privateKey, publicKey } = projectLt;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let filePathRelative = fileNodeId.substring(projectId.length + 1);

    let filePath = repoDir + '/' + filePathRelative;

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: false
    });

    let content = '';

    let isExist = true;

    let isFileExist = await isPathExist(filePath);
    if (isFileExist === false) {
      isExist = false;
      if (panel === PanelEnum.Tree) {
        throw new ServerError({
          message: ErEnum.DISK_FILE_IS_NOT_EXIST
        });
      }
    } else {
      let { content: cont } = await readFileCheckSize({
        filePath: filePath,
        getStat: false
      });

      content = cont;
    }

    let originalContent;

    if (panel === PanelEnum.ChangesToCommit) {
      originalContent = await getLastCommitFileContent({
        repoDir: repoDir,
        filePathRelative: filePathRelative
      });
    } else if (panel === PanelEnum.ChangesToPush) {
      originalContent = await getBaseCommitFileContent({
        repoDir: repoDir,
        filePathRelative: filePathRelative
      });
    }

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <DiskItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: false,
      isCheckConflicts: false
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: ToDiskGetFileResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      originalContent: originalContent,
      content: content,
      isExist: isExist
    };

    return payload;
  }
}
