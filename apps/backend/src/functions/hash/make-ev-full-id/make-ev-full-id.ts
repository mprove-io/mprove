import * as crypto from 'node:crypto';

export function makeEvFullId(item: {
  projectId: string;
  envId: string;
  evId: string;
}): string {
  let { projectId, envId, evId } = item;

  let text = projectId + envId + evId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
