import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class SeedProjectService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskSeedProjectRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let {
      organizationId,
      projectId,
      devRepoId,
      userAlias
    } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    await disk.ensureDir(orgDir);
    await disk.emptyDir(projectDir);

    //

    await git.prepareCentralAndProd({
      projectId: projectId,
      projectDir: projectDir,
      useData: true,
      userAlias: userAlias
    });

    await git.cloneCentralToDev({
      organizationId: organizationId,
      projectId: projectId,
      devRepoId: devRepoId,
      orgPath: orgPath
    });

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      readFiles: true
    });

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: devRepoId,
        repoDir: devRepoDir
      })
    );

    let payload: apiToDisk.ToDiskSeedProjectResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: devRepoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes,
      files: itemCatalog.files
    };

    return payload;
  }
}