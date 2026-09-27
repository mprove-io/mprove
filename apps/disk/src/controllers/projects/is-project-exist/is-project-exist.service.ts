import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskIsProjectExistOutput } from '#common/zod/disk/routes/projects/is-project-exist/is-project-exist-output';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org/check-restore-org';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

@Injectable()
export class IsProjectExistService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
    projectId: string;
  }): Promise<DiskResultForOperation<'isProjectExist'>> {
    let { orgId, projectId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let isProjectExistResult = Result.pipe(
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
      Result.map(
        (v): ToDiskIsProjectExistOutput => ({
          orgId: v.orgId,
          projectId: v.projectId,
          isProjectExist: v.isProjectExist
        })
      )
    );

    return isProjectExistResult;
  }
}
