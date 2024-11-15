export function getChartUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  chartId: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, chartId } = item;

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/charts?search=${chartId}`;
}
