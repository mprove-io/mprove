export function getDashboardUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  dashboardId: string;
  timezone: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, dashboardId, timezone } =
    item;
  //TODO: mcli getDashboardUrl
  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/dashboard/${dashboardId}?timezone=${timezone}`;
}
