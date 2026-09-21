import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskDeleteProjectOutput } from '#common/zod/disk/routes/projects/delete-project/delete-project-response';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org/check-restore-org';

@Injectable()
export class DeleteProjectService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
    projectId: string;
  }): Promise<ToDiskResponseResultForOperation<'deleteProject'>> {
    let { orgId, projectId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let deleteProjectResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`,
        orgPath: orgPath
      }),
      Result.andThrough(v =>
        checkRestoreOrg({
          orgId: v.orgId,
          orgPath: v.orgPath
        })
      ),
      Result.bind(
        'isProjectExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.projectDir })
      ),
      Result.andThrough(v =>
        v.isProjectExist === true
          ? removePath({ path: v.projectDir })
          : Result.succeed()
      ),
      Result.map(
        (v): ToDiskDeleteProjectOutput => ({
          orgId: v.orgId,
          deletedProjectId: v.projectId
        })
      )
    );

    return deleteProjectResult;
  }
}
