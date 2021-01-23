import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskSeedProject(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskSeedProjectRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
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

  let payload: api.ToDiskSeedProjectResponsePayload = {
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
