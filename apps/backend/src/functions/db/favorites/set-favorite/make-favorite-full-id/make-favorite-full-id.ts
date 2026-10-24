import { makeFavoriteFullId as makeFavoriteFullIdHash } from '#backend/functions/hash/make-favorite-full-id/make-favorite-full-id';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export function makeFavoriteFullId(item: {
  userId: string;
  projectId: string;
  type: FavoriteType;
  targetId: string;
}): string {
  let { userId, projectId, type, targetId } = item;

  let favoriteFullId: string = makeFavoriteFullIdHash({
    userId: userId,
    projectId: projectId,
    type: type,
    targetId: targetId
  });

  return favoriteFullId;
}
