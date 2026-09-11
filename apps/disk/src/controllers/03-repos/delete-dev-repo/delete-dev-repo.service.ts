import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { ToDiskDeleteDevRepoOutput } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import type { ToDiskResultFor } from '#common/zod/to-disk/to-disk-operation-contract';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project';
import { DiskTabService } from '#disk/services/disk-tab.service';

@Injectable()
export class DeleteDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    devRepoId: string;
  }): Promise<ToDiskResultFor<'ToDiskDeleteDevRepo'>> {
    let { baseProject, devRepoId } = item;

    let orgPath: string = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let { orgId, projectId } = baseProject;

    let deleteDevRepoResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        devRepoId: devRepoId,
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`
      }),
      Result.andThrough(item =>
        checkRestoreOrgProject({
          remoteType: baseProject.remoteType,
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
        item.isDevRepoExist === true
          ? removePath({ path: item.devRepoDir })
          : Result.succeed()
      ),
      Result.map(
        (item): ToDiskDeleteDevRepoOutput => ({
          orgId: item.orgId,
          projectId: item.projectId,
          deletedRepoId: item.devRepoId
        })
      )
    );

    return deleteDevRepoResult;
  }
}
