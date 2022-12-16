export function getVisualizationUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  vizId: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, vizId } = item;

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/visualizations?search=${vizId}`;
}
