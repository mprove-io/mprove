export function getModelUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  modelId: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, modelId } = item;
  //TODO: mcli getModelUrl
  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/model/${modelId}/mconfig/empty/query/empty`;
}
