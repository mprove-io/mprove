import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function ToDiskGetRepoCatalogNodes(
  request: api.ToDiskGetRepoCatalogNodesRequest
): Promise<api.ToDiskGetRepoCatalogNodesResponse> {
  let traceId = request.info.traceId;

  let organizationId = request.payload.organizationId;
  let projectId = request.payload.projectId;
  let repoId = request.payload.repoId;

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
    readFiles: false
  });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      nodes: itemCatalog.nodes
    }
  };
}
