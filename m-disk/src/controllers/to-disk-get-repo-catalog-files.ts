import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskGetRepoCatalogFiles(
  request: api.ToDiskGetRepoCatalogFilesRequest
): Promise<api.ToDiskGetRepoCatalogFilesResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskGetRepoCatalogFilesRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId, projectId, repoId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw Error(api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST);
  }

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw Error(api.ErEnum.M_DISK_REPO_IS_NOT_EXIST);
  }

  //

  let itemCatalog = <api.ItemCatalog>await disk.getRepoCatalogNodesAndFiles({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    readFiles: true
  });

  let response = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      files: itemCatalog.files
    }
  };

  return response;
}
