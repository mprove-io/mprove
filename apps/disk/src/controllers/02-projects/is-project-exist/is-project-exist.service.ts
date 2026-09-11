import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskIsProjectExistOutput } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org';

@Injectable()
export class IsProjectExistService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
    projectId: string;
  }): Promise<ToDiskResultFor<'ToDiskIsProjectExist'>> {
    let { orgId, projectId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let isProjectExistResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`
      }),
      Result.andThrough(item =>
        checkRestoreOrg({
          orgId: item.orgId,
          orgPath: orgPath
        })
      ),
      Result.bind('isProjectExist', item =>
        isPathExist({ path: item.projectDir })
      ),
      Result.map(
        (item): ToDiskIsProjectExistOutput => ({
          orgId: item.orgId,
          projectId: item.projectId,
          isProjectExist: item.isProjectExist
        })
      )
    );

    return isProjectExistResult;
  }
}
