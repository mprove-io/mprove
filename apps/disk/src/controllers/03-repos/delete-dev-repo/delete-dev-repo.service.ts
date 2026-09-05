import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import { zToDiskDeleteDevRepoRequest } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request';
import type { ToDiskDeleteDevRepoRequestPayload } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-request-payload';
import type { ToDiskDeleteDevRepoResponsePayload } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class DeleteDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskDeleteDevRepoResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskDeleteDevRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      baseProject,
      devRepoId
    }: ToDiskDeleteDevRepoRequestPayload = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let deleteDevRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`
      }),
      Result.andThrough(async item => {
        await this.restoreService.checkOrgProjectRepoBranch({
          remoteType: baseProject.remoteType,
          orgId: item.orgId,
          projectId: item.projectId,
          projectLt: projectLt,
          repoId: undefined,
          branchId: undefined
        });
        return Result.succeed();
      }),
      Result.andThrough(async item => {
        let isDevRepoExist: boolean = await isPathExist(item.devRepoDir);

        if (isDevRepoExist === true) {
          await removePath(item.devRepoDir);
        }

        return Result.succeed();
      }),
      Result.map(
        (item): ToDiskDeleteDevRepoResponsePayload => ({
          orgId: item.orgId,
          projectId: item.projectId,
          deletedRepoId: item.devRepoId
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(deleteDevRepoResult);

    return payload;
  }
}
