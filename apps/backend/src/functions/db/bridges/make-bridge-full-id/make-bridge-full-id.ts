import * as crypto from 'node:crypto';

export function makeBridgeFullId(item: {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
}): string {
  let { projectId, repoId, branchId, envId } = item;

  let text = projectId + repoId + branchId + envId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
