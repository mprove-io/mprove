import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { LogResult } from 'simple-git';
import { isDefined } from '#common/functions/is-defined';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskCreateDevRepoOutput } from '#common/zod/to-disk/03-repos/create-dev-repo/create-dev-repo-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { getNodesAndFilesWrapped } from '#disk/functions/disk/get-nodes-and-files-wrapped';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatusWrapped } from '#disk/functions/git/get-repo-status-wrapped';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project';
import { DiskTabService } from '#disk/services/disk-tab.service';

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
  }): Promise<ToDiskResultFor<'ToDiskCreateDevRepo'>> {
    let { baseProject, devRepoId, initialBranch, sessionBranch } = item;

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
        devRepoId: devRepoId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`
      }),
      Result.bind('keyDir', item =>
        checkRestoreOrgProject({
          remoteType: remoteType,
          orgId: item.orgId,
          orgPath: orgPath,
          projectId: item.projectId,
          projectLt: projectLt
        })
      ),
      Result.bind('isDevRepoExist', item =>
        isPathExist({ path: item.devRepoDir })
      ),
      Result.andThrough(item =>
        item.isDevRepoExist === false
          ? cloneRemoteToDev({
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
            })
          : Result.succeed()
      ),
      Result.bind('devGit', item =>
        createGit({
          repoDir: item.devRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        })
      ),
      Result.bind('initialCommitHash', item => {
        if (!initialBranch) {
          return Result.succeed(undefined);
        }

        return Result.pipe(
          checkoutBranch({
            projectId: item.projectId,
            projectDir: item.projectDir,
            repoId: item.devRepoId,
            repoDir: item.devRepoDir,
            branchName: initialBranch,
            git: item.devGit,
            isFetch: false
          }),
          Result.andThen(async () => {
            let logResult: LogResult = await item.devGit.log({ n: 1 });

            let initialCommitHash: string | undefined =
              logResult.latest?.hash?.substring(0, 7);

            if (sessionBranch) {
              await item.devGit.checkout(['-b', sessionBranch]);
            }

            return Result.succeed(initialCommitHash);
          })
        );
      }),
      Result.bind('devItemStatus', item =>
        getRepoStatusWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          repoDir: item.devRepoDir,
          git: item.devGit,
          isFetch: false, // or !sessionBranch
          isCheckConflicts: true
        })
      ),
      Result.bind('repoStatus', item =>
        Result.succeed(
          isDefined(sessionBranch) ? 'NeedPush' : item.devItemStatus.repoStatus
        )
      ),
      Result.bind('itemCatalog', item =>
        getNodesAndFilesWrapped({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: item.devRepoId,
          readFiles: true,
          isRootMproveDir: false
        })
      ),
      Result.map(
        (item): ToDiskCreateDevRepoOutput => ({
          repo: {
            orgId: item.orgId,
            projectId: item.projectId,
            repoId: item.devRepoId,
            repoStatus: item.repoStatus,
            repoError: item.devItemStatus.repoError,
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
      )
    );

    return createDevRepoResult;
  }
}
