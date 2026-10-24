import * as crypto from 'node:crypto';

export function makeEnvFullId(item: {
  projectId: string;
  envId: string;
}): string {
  let { projectId, envId } = item;

  let text = projectId + envId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
