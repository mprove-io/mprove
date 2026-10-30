import * as crypto from 'node:crypto';

export function makeBranchFullId(item: {
  projectId: string;
  repoId: string;
  branchId: string;
}): string {
  let { projectId, repoId, branchId } = item;

  let text = projectId + repoId + branchId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
