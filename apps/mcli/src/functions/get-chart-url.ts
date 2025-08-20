export function getChartUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  chartId: string;
  timezone: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, chartId, timezone } = item;
  //TODO: mcli getChartUrl
  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/charts?search=${chartId}&timezone=${timezone}`;
}
