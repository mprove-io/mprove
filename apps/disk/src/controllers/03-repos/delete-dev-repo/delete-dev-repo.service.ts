import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectLt, ProjectSt } from '~common/interfaces/st-lt';
import {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponsePayload
} from '~common/interfaces/to-disk/03-repos/to-disk-delete-dev-repo';
import { DiskConfig } from '~disk/config/disk-config';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { removePath } from '~disk/functions/disk/remove-path';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { RestoreService } from '~disk/services/restore.service';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class DeleteDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskDeleteDevRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, projectId, baseProject, devRepoId } = requestValid.payload;

    let projectSt: ProjectSt = this.diskTabService.decrypt<ProjectSt>({
      encryptedString: baseProject.st
    });

    let projectLt: ProjectLt = this.diskTabService.decrypt<ProjectLt>({
      encryptedString: baseProject.lt
    });

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    // let isOrgExist = await isPathExist(orgDir);
    // if (isOrgExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_ORG_IS_NOT_EXIST
    //   });
    // }

    // let isProjectExist = await isPathExist(projectDir);
    // if (isProjectExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
    //   });
    // }

    let keyDir = await this.restoreService.checkOrgProjectRepoBranch({
      remoteType: baseProject.remoteType,
      orgId: orgId,
      projectId: projectId,
      projectLt: projectLt,
      repoId: undefined,
      branchId: undefined
    });

    let isDevRepoExist = await isPathExist(devRepoDir);
    if (isDevRepoExist === true) {
      await removePath(devRepoDir);
    }

    let payload: ToDiskDeleteDevRepoResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      deletedRepoId: devRepoId
    };

    return payload;
  }
}
