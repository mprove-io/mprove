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

  let tz = timezone.split('/').join('-');
  let timeRangeUnderscore = timeRange.split(' ').join('_');

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/reports/report/${reportId}?timezone=${tz}&timeSpec=${timeSpec}&timeRange=${timeRangeUnderscore}`;
}
