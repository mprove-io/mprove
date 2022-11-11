import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class DeleteDevRepoService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskDeleteDevRepoRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsColor:
        this.cs.get<interfaces.Config['diskLogIsColor']>('diskLogIsColor'),
      logIsStringify:
        this.cs.get<interfaces.Config['diskLogIsStringify']>(
          'diskLogIsStringify'
        )
    });

    let { orgId, projectId, devRepoId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isDevRepoExist = await disk.isPathExist(devRepoDir);
    if (isDevRepoExist === true) {
      await disk.removePath(devRepoDir);
    }

    let payload: apiToDisk.ToDiskDeleteDevRepoResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      deletedRepoId: devRepoId
    };

    return payload;
  }
}
