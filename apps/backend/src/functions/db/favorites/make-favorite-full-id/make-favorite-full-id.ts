import * as crypto from 'node:crypto';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export function makeFavoriteFullId(item: {
  userId: string;
  projectId: string;
  type: FavoriteType;
  targetId: string;
}): string {
  let { userId, projectId, type, targetId } = item;

  let text = userId + projectId + type + targetId;

  let hash: string = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
}
