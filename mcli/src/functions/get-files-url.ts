export function getFilesUrl(item: {
  host: string;
  orgId: string;
  projectId: string;
  repoId: string;
  branch: string;
  env: string;
}) {
  let { host, orgId, projectId, repoId, branch, env } = item;
  // TODO: mcli getFilesUrl
  return `${host}/org/${orgId}/project/${projectId}/repo/${repoId}/branch/${branch}/env/${env}/files`;
}
