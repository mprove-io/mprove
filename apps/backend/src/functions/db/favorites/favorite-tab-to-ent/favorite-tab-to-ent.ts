import { Result } from '@praha/byethrow';
import type { FavoriteTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { FavoriteEnt } from '#backend/drizzle/postgres/schema/favorites';
import { makeFavoriteFullId } from '#backend/functions/hash/make-favorite-full-id/make-favorite-full-id';

export function favoriteTabToEnt(item: {
  tab: FavoriteTab;
}): Result.Result<FavoriteEnt, never> {
  let { tab } = item;

  let favoriteEnt: FavoriteEnt = {
    favoriteFullId: makeFavoriteFullId({
      projectId: tab.projectId,
      userId: tab.userId,
      type: tab.type,
      targetId: tab.targetId
    }),
    projectId: tab.projectId,
    userId: tab.userId,
    type: tab.type,
    targetId: tab.targetId,
    serverTs: tab.serverTs
  };

  return Result.succeed(favoriteEnt);
}
