import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToDiskCreateDevRepoOutput } from '#common/types/disk/routes/repos/create-dev-repo/create-dev-repo-output';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';
import type { DiskConfig } from '#disk/config/disk-config';
import { getInitialCommitHash } from '#disk/controllers/repos/create-dev-repo/get-initial-commit-hash/get-initial-commit-hash';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files/get-nodes-and-files';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project/check-restore-org-project';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

@Injectable()
export class CreateDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    devRepoId: string;
    initialBranch?: string;
    sessionBranch?: string;
  }): Promise<DiskResultForOperation<'createDevRepo'>> {
    let { baseProject } = item;

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

    let createDevRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: item.devRepoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${item.devRepoId}`,
        sessionBranch: item.sessionBranch,
        initialBranch: item.initialBranch,
        passPhrase: passPhrase,
        publicKey: publicKey,
        privateKeyEncrypted: privateKeyEncrypted,
        gitUrl: gitUrl,
        projectLt: projectLt,
        orgPath: orgPath,
        remoteType: remoteType
      }),
      Result.bind('keyDir', v =>
        checkRestoreOrgProject({
          remoteType: v.remoteType,
          orgId: v.orgId,
          orgPath: v.orgPath,
          projectId: v.projectId,
          projectLt: v.projectLt
        })
      ),
      Result.bind('isDevRepoExist', v => isPathExist({ path: v.devRepoDir })),
      Result.andThrough(v =>
        v.isDevRepoExist === false
          ? cloneRemoteToDev({
              orgId: v.orgId,
              projectId: v.projectId,
              devRepoId: v.devRepoId,
              orgPath: v.orgPath,
              remoteType: v.remoteType,
              gitUrl: v.gitUrl,
              keyDir: v.keyDir,
              privateKeyEncrypted: v.privateKeyEncrypted,
              publicKey: v.publicKey,
              passPhrase: v.passPhrase
            })
          : Result.succeed()
      ),
      Result.bind('devGit', v =>
        createGit({
          repoDir: v.devRepoDir,
          remoteType: v.remoteType,
          keyDir: v.keyDir,
          gitUrl: v.gitUrl,
          privateKeyEncrypted: v.privateKeyEncrypted,
          publicKey: v.publicKey,
          passPhrase: v.passPhrase
        })
      ),
      Result.bind('initialCommitHash', v =>
        getInitialCommitHash({
          initialBranch: v.initialBranch,
          sessionBranch: v.sessionBranch,
          projectId: v.projectId,
          projectDir: v.projectDir,
          devRepoId: v.devRepoId,
          devRepoDir: v.devRepoDir,
          devGit: v.devGit
        })
      ),
      Result.bind('devItemStatus', v =>
        getRepoStatus({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.devRepoId,
          repoDir: v.devRepoDir,
          git: v.devGit,
          isFetch: false, // or !sessionBranch
          isCheckConflicts: true
        })
      ),
      // The session branch does not exist remotely, so use NeedPush without fetching.
      Result.bind('repoStatus', v =>
        Result.succeed(
          isDefined(v.sessionBranch) ? 'NeedPush' : v.devItemStatus.repoStatus
        )
      ),
      Result.bind('itemCatalog', v =>
        getNodesAndFiles({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.devRepoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (v): ToDiskCreateDevRepoOutput => ({
          repo: {
            orgId: v.orgId,
            projectId: v.projectId,
            repoId: v.devRepoId,
            repoStatus: v.repoStatus,
            repoError: v.devItemStatus.repoError,
            currentBranchId: v.devItemStatus.currentBranch,
            conflicts: v.devItemStatus.conflicts,
            nodes: v.itemCatalog.nodes,
            changesToCommit: v.devItemStatus.changesToCommit,
            changesToPush: v.devItemStatus.changesToPush
          },
          files: v.itemCatalog.files,
          mproveDir: v.itemCatalog.mproveDir,
          initialCommitHash: v.initialCommitHash
        })
      )
    );

    return createDevRepoResult;
  }
}
