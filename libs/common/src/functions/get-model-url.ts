export function getModelUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
  modelId: string;
  timezone: string;
}) {
  let { host, orgId, projectId, repoId, branch, env, modelId, timezone } = item;

  let tz = timezone.split('/').join('-');

  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/models/model/${modelId}/chart/new?timezone=${tz}`;
}
