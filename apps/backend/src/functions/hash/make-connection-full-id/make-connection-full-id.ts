import * as crypto from 'node:crypto';

export function makeConnectionFullId(item: {
  projectId: string;
  envId: string;
  connectionId: string;
}): string {
  let { projectId, envId, connectionId } = item;

  let text = projectId + envId + connectionId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
