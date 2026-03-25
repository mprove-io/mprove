export function getChartUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  modelId: string;
  chartId: string;
  timezone: string;
}) {
  let {
    host,
    orgId,
    projectId,
    repoId,
    branch,
    env,
    modelId,
    chartId,
    timezone
  } = item;

  let tz = timezone.split('/').join('-');

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/models/model/${modelId}/chart/${chartId}?timezone=${tz}`;
}
