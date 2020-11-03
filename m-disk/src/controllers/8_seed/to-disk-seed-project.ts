import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskSeedProject(
  request: api.ToDiskSeedProjectRequest
): Promise<api.ToDiskSeedProjectResponse> {
  let requestValid = await api.transformValid({
    classType: api.ToDiskSeedProjectRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    devRepoId,
    userAlias
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
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
    devRepoId: devRepoId
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

  let response: api.ToDiskSeedProjectResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: devRepoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes,
      files: itemCatalog.files
    }
  };

  return response;
}
