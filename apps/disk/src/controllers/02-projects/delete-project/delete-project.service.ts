import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { ToDiskDeleteProjectOutput } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org';

@Injectable()
export class DeleteProjectService {
  constructor(private cs: ConfigService<DiskConfig>) {}

  async process(item: {
    orgId: string;
    projectId: string;
  }): Promise<ToDiskResultFor<'ToDiskDeleteProject'>> {
    let { orgId, projectId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let deleteProjectResult = Result.pipe(
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
      Result.andThrough(item =>
        item.isProjectExist === true
          ? removePath({ path: item.projectDir })
          : Result.succeed()
      ),
      Result.map(
        (item): ToDiskDeleteProjectOutput => ({
          orgId: item.orgId,
          deletedProjectId: item.projectId
        })
      )
    );

    return deleteProjectResult;
  }
}
