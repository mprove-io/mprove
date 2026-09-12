import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskIsBranchExistOutput } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import type { DiskConfig } from '#disk/config/disk-config';
import { createGit } from '#disk/functions/git/create-git';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { checkRestoreOrgProjectRepo } from '#disk/functions/restore/check-restore-org-project-repo';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class IsBranchExistService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    repoId: string;
    branch: string;
    isRemote: boolean;
  }): Promise<ToDiskResultForOperation<'isBranchExist'>> {
    let { baseProject, repoId, branch, isRemote } = item;

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

    let isBranchExistResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
      }),
      Result.bind('keyDir', item =>
        checkRestoreOrgProjectRepo({
          remoteType: remoteType,
          orgId: item.orgId,
          orgPath: orgPath,
          projectId: item.projectId,
          projectLt: projectLt,
          repoId: item.repoId
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
      Result.bind('isBranchExist', item =>
        isRemote === true
          ? isRemoteBranchExist({
              repoDir: item.repoDir,
              remoteBranch: branch,
              git: item.git,
              isFetch: true
            })
          : isLocalBranchExist({
              repoDir: item.repoDir,
              localBranch: branch
            })
      ),
      Result.map(
        (item): ToDiskIsBranchExistOutput => ({
          orgId: item.orgId,
          projectId: item.projectId,
          repoId: item.repoId,
          branch: branch,
          isRemote: isRemote,
          isBranchExist: item.isBranchExist
        })
      )
    );

    return isBranchExistResult;
  }
}
