import { Result } from '@praha/byethrow';
import type { FavoriteTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { FavoriteEnt } from '#backend/drizzle/postgres/schema/favorites';
import type { HashService } from '#backend/services/hash/hash.service';

export function favoriteTabToEnt(item: {
  tab: FavoriteTab;
  hashService: HashService;
}): Result.Result<FavoriteEnt, never> {
  let { tab, hashService } = item;

  let favoriteEnt: FavoriteEnt = {
    favoriteFullId: hashService.makeFavoriteFullId({
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
