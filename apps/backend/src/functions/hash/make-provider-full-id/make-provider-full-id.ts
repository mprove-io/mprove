import * as crypto from 'node:crypto';

export function makeProviderFullId(item: {
  projectId: string;
  providerId: string;
}): string {
  let { projectId, providerId } = item;

  let text = projectId + providerId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
