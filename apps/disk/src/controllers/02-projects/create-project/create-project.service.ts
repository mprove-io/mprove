import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskCreateProjectRequest } from '#common/zod/to-disk/02-projects/create-project/create-project-request';
import type { ToDiskCreateProjectRequestPayload } from '#common/zod/to-disk/02-projects/create-project/create-project-request-payload';
import type { ToDiskCreateProjectResponsePayload } from '#common/zod/to-disk/02-projects/create-project/create-project-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '#disk/functions/disk/get-nodes-and-files';
import { cloneRemoteToDev } from '#disk/functions/git/clone-remote-to-dev';
import { createGit } from '#disk/functions/git/create-git';
import { getRepoStatus } from '#disk/functions/git/get-repo-status';
import { prepareRemoteAndProd } from '#disk/functions/git/prepare-remote-and-prod';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { checkProjectDoesNotExist } from './functions/check-project-does-not-exist';

@Injectable()
export class CreateProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateProjectResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskCreateProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      testProjectId,
      devRepoId,
      userAlias
    }: ToDiskCreateProjectRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;
    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let createProjectResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        keyDir: `${orgPath}/${orgId}/_keys/${projectId}`,
        prodRepoDir: `${orgPath}/${orgId}/${projectId}/${PROD_REPO_ID}`
      }),
      Result.andThrough(async () => {
        await this.restoreService.checkOrgProjectRepoBranch({
          remoteType: remoteType,
          orgId: orgId,
          projectId: undefined,
          projectLt: undefined,
          repoId: undefined,
          branchId: undefined
        });
        return Result.succeed();
      }),
      Result.andThrough(item =>
        checkProjectDoesNotExist({ projectDir: item.projectDir })
      ),
      Result.andThrough(async item => {
        await ensureDir(item.projectDir);
        await ensureDir(item.keyDir);
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await prepareRemoteAndProd({
          projectId: item.projectId,
          projectName: projectName,
          projectDir: item.projectDir,
          testProjectId: testProjectId,
          userAlias: userAlias,
          remoteType: remoteType,
          gitUrl: gitUrl,
          keyDir: item.keyDir,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        await cloneRemoteToDev({
          orgId: item.orgId,
          projectId: item.projectId,
          devRepoId: devRepoId,
          orgPath: orgPath,
          remoteType: remoteType,
          gitUrl: gitUrl,
          keyDir: item.keyDir,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed();
      }),
      Result.bind('prodItemCatalog', async item => {
        let prodItemCatalog: DiskItemCatalog = await getNodesAndFiles({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          readFiles: true,
          isRootMproveDir: false
        });
        return Result.succeed(prodItemCatalog);
      }),
      Result.bind('prodGit', async item => {
        let prodGit: SimpleGit = await createGit({
          repoDir: item.prodRepoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(prodGit);
      }),
      Result.bind('prodItemStatus', async item => {
        let prodItemStatus: DiskItemStatus = await getRepoStatus({
          projectId: item.projectId,
          projectDir: item.projectDir,
          repoId: PROD_REPO_ID,
          repoDir: item.prodRepoDir,
          git: item.prodGit,
          isFetch: true,
          isCheckConflicts: true
        });
        return Result.succeed(prodItemStatus);
      }),
      Result.map(
        (item): ToDiskCreateProjectResponsePayload => ({
          orgId: item.orgId,
          projectId: item.projectId,
          defaultBranch: item.prodItemStatus.currentBranch,
          prodFiles: item.prodItemCatalog.files,
          mproveDir: item.prodItemCatalog.mproveDir
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(createProjectResult);

    return payload;
  }
}
