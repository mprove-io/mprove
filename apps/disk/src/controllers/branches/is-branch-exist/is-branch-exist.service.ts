import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskIsBranchExistOutput } from '#common/zod/disk/routes/branches/is-branch-exist/is-branch-exist-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist/is-remote-branch-exist';
import { checkRestoreOrgProjectRepo } from '#disk/functions/restore/check-restore-org-project-repo/check-restore-org-project-repo';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';

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
  }): Promise<ToDiskResponseResultForOperation<'isBranchExist'>> {
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
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`,
        branch: branch,
        isRemote: isRemote,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind(
        'keyDir',
        (v): Result.ResultAsync<string, never> =>
          checkRestoreOrgProjectRepo({
            remoteType: v.remoteType,
            orgId: v.orgId,
            orgPath: v.orgPath,
            projectId: v.projectId,
            projectLt: v.projectLt,
            repoId: v.repoId
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
        'isBranchExist',
        (v): Result.ResultAsync<boolean, never> =>
          v.isRemote === true
            ? isRemoteBranchExist({
                repoDir: v.repoDir,
                remoteBranch: v.branch,
                git: v.git,
                isFetch: true
              })
            : isLocalBranchExist({
                repoDir: v.repoDir,
                localBranch: v.branch
              })
      ),
      Result.map(
        (v): ToDiskIsBranchExistOutput => ({
          orgId: v.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          branch: v.branch,
          isRemote: v.isRemote,
          isBranchExist: v.isBranchExist
        })
      )
    );

    return isBranchExistResult;
  }
}
