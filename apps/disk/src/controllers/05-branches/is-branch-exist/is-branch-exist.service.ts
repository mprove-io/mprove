import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import {
  type ToDiskIsBranchExistRequest,
  zToDiskIsBranchExistRequest
} from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request';
import type { ToDiskIsBranchExistRequestPayload } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-request-payload';
import type { ToDiskIsBranchExistResponsePayload } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { createGit } from '#disk/functions/git/create-git';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class IsBranchExistService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskIsBranchExistResponsePayload> {
    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid: ToDiskIsBranchExistRequest = zodParseOrThrow({
      schema: zToDiskIsBranchExistRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      baseProject,
      repoId,
      branch,
      isRemote
    }: ToDiskIsBranchExistRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { projectId, remoteType } = baseProject;

    let { name: projectName } = projectSt;

    let { gitUrl, privateKeyEncrypted, publicKey, passPhrase } = projectLt;

    let isBranchExistResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoDir: `${orgPath}/${orgId}/${projectId}/${repoId}`
      }),
      Result.bind('keyDir', async item => {
        let keyDir: string =
          await this.restoreService.checkOrgProjectRepoBranch({
            remoteType: remoteType,
            orgId: item.orgId,
            projectId: item.projectId,
            projectLt: projectLt,
            repoId: item.repoId,
            branchId: undefined
          });
        return Result.succeed(keyDir);
      }),
      Result.bind('git', async item => {
        let git: SimpleGit = await createGit({
          repoDir: item.repoDir,
          remoteType: remoteType,
          keyDir: item.keyDir,
          gitUrl: gitUrl,
          privateKeyEncrypted: privateKeyEncrypted,
          publicKey: publicKey,
          passPhrase: passPhrase
        });
        return Result.succeed(git);
      }),
      Result.bind('isBranchExist', async item => {
        let isBranchExist: boolean =
          isRemote === true
            ? await isRemoteBranchExist({
                repoDir: item.repoDir,
                remoteBranch: branch,
                git: item.git,
                isFetch: true
              })
            : await isLocalBranchExist({
                repoDir: item.repoDir,
                localBranch: branch
              });
        return Result.succeed(isBranchExist);
      }),
      Result.map(
        (item): ToDiskIsBranchExistResponsePayload => ({
          orgId: item.orgId,
          projectId: item.projectId,
          repoId: item.repoId,
          branch: branch,
          isRemote: isRemote,
          isBranchExist: item.isBranchExist
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(isBranchExistResult);

    return payload;
  }
}
