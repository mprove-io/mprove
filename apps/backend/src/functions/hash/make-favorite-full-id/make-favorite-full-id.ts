import * as crypto from 'node:crypto';

export function makeFavoriteFullId(item: {
  userId: string;
  projectId: string;
  type: string;
  targetId: string;
}): string {
  let { userId, projectId, type, targetId } = item;

  let text = userId + projectId + type + targetId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
