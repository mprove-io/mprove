import { and, eq, inArray } from 'drizzle-orm';
import type { FavoriteTab } from '#backend/drizzle/postgres/tables/favorites';
import { favoritesTable } from '#backend/drizzle/postgres/tables/favorites';
import type { DbService } from '#backend/services/db/db.service';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export async function getFavoriteTargetIds(item: {
  db: DbService;
  projectId: string;
  userId: string;
  type: FavoriteType;
  targetIds: string[];
}): Promise<string[]> {
  let { db, projectId, userId, type, targetIds } = item;

  if (targetIds.length === 0) {
    return [];
  }

  let favorites: FavoriteTab[] = await db.favorites.findManyUnwrap({
    where: and(
      eq(favoritesTable.projectId, projectId),
      eq(favoritesTable.userId, userId),
      eq(favoritesTable.type, type),
      inArray(favoritesTable.targetId, targetIds)
    )
  });

  let favoriteTargetIds: string[] = favorites.map(
    favorite => favorite.targetId
  );

  return favoriteTargetIds;
}
