import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BaseProject } from '#common/zod/backend/base-project';
import type { ToDiskResponseResultForOperation } from '#common/zod/disk/response/to-disk-response-result-for-operation';
import type { ToDiskDeleteDevRepoOutput } from '#common/zod/disk/routes/repos/delete-dev-repo/delete-dev-repo-response';
import type { ProjectLt, ProjectSt } from '#common/zod/st-lt';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path/remove-path';
import { checkRestoreOrgProject } from '#disk/functions/restore/check-restore-org-project/check-restore-org-project';
import { DiskTabService } from '#disk/services/disk-tab/disk-tab.service';

@Injectable()
export class DeleteDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>
  ) {}

  async process(item: {
    baseProject: BaseProject;
    devRepoId: string;
  }): Promise<ToDiskResponseResultForOperation<'deleteDevRepo'>> {
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
        devRepoDir: `${orgPath}/${orgId}/${projectId}/${devRepoId}`,
        projectLt: projectLt,
        orgPath: orgPath,
        baseProject: baseProject
      }),
      Result.andThrough(v =>
        checkRestoreOrgProject({
          remoteType: v.baseProject.remoteType,
          orgId: v.orgId,
          orgPath: v.orgPath,
          projectId: v.projectId,
          projectLt: v.projectLt
        })
      ),
      Result.bind(
        'isDevRepoExist',
        (v): Result.ResultAsync<boolean, never> =>
          isPathExist({ path: v.devRepoDir })
      ),
      Result.andThrough(v =>
        v.isDevRepoExist === true
          ? removePath({ path: v.devRepoDir })
          : Result.succeed()
      ),
      Result.map(
        (v): ToDiskDeleteDevRepoOutput => ({
          orgId: v.orgId,
          projectId: v.projectId,
          deletedRepoId: v.devRepoId
        })
      )
    );

    return deleteDevRepoResult;
  }
}
