import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateProjectService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskCreateProjectRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { orgId, projectId, devRepoId, userAlias } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === true) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_PROJECT_ALREADY_EXIST
      });
    }

    //

    await disk.ensureDir(projectDir);

    await git.prepareCentralAndProd({
      projectId: projectId,
      projectDir: projectDir,
      useData: false,
      userAlias: userAlias
    });

    await git.cloneCentralToDev({
      orgId: orgId,
      projectId: projectId,
      devRepoId: devRepoId,
      orgPath: orgPath
    });

    let payload: apiToDisk.ToDiskCreateProjectResponsePayload = {
      orgId: orgId,
      projectId: projectId
    };

    return payload;
  }
}
