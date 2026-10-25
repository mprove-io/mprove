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
}): string {
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

  let tzEncoded: string = encodeURIComponent(timezone);

  let timeRangeEncoded: string = encodeURIComponent(timeRange);

  let reportUrl = `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/reports/report/${reportId}?timezone=${tzEncoded}&timeSpec=${timeSpec}&timeRange=${timeRangeEncoded}`;

  return reportUrl;
}
