import type { HashService } from '#backend/services/hash/hash.service';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export function makeFavoriteFullId(item: {
  hashService: HashService;
  userId: string;
  projectId: string;
  type: FavoriteType;
  targetId: string;
}): string {
  let { hashService, userId, projectId, type, targetId } = item;

  let favoriteFullId: string = hashService.makeFavoriteFullId({
    userId: userId,
    projectId: projectId,
    type: type,
    targetId: targetId
  });

  return favoriteFullId;
}
