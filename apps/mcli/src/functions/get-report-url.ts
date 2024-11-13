export function getReportUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  reportId: string;
  timezone: string;
  timeSpec: string;
  timeRange: string;
}) {
  let {
    host,
    orgId,
    projectId,
    repoId,
    branch,
    env,
    reportId,
    timezone,
    timeSpec,
    timeRange
  } = item;

  let timeRangeUnderscore = timeRange.split(' ').join('_');

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/metrics/report/${reportId}?timezone=${timezone}&timeSpec=${timeSpec}&timeRange=${timeRangeUnderscore}`;
}
