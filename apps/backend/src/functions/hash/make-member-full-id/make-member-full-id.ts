import * as crypto from 'node:crypto';

export function makeMemberFullId(item: {
  projectId: string;
  memberId: string;
}): string {
  let { projectId, memberId } = item;

  let text = projectId + memberId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
