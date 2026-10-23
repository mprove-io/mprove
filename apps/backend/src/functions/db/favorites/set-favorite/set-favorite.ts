import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { favoritesTable } from '#backend/drizzle/postgres/schema/favorites';
import { makeFavoriteFullId } from '#backend/functions/db/favorites/set-favorite/make-favorite-full-id/make-favorite-full-id';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import type { HashService } from '#backend/services/hash/hash.service';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

export async function setFavorite(item: {
  db: DbService;
  hashService: HashService;
  projectId: string;
  userId: string;
  type: FavoriteType;
  targetId: string;
  isFavorite: boolean;
}): Result.ResultAsync<void, never> {
  let { db, hashService, projectId, userId, type, targetId, isFavorite } = item;

  let favoriteFullId: string = makeFavoriteFullId({
    hashService: hashService,
    userId: userId,
    projectId: projectId,
    type: type,
    targetId: targetId
  });

  if (isFavorite === true) {
    await db.drizzle
      .insert(favoritesTable)
      .values({
        favoriteFullId: favoriteFullId,
        projectId: projectId,
        userId: userId,
        type: type,
        targetId: targetId,
        serverTs: makeTsNumber()
      })
      .onConflictDoNothing();
  } else {
    await db.drizzle
      .delete(favoritesTable)
      .where(eq(favoritesTable.favoriteFullId, favoriteFullId));
  }

  return Result.succeed();
}
