import { Result } from '@praha/byethrow';
import type {
  FavoriteEnt,
  FavoriteTab
} from '#backend/drizzle/postgres/tables/favorites';

export function favoriteEntToTab(item: {
  ent: FavoriteEnt;
}): Result.Result<FavoriteTab, never> {
  let { ent } = item;

  let favorite: FavoriteTab = {
    projectId: ent.projectId,
    userId: ent.userId,
    type: ent.type,
    targetId: ent.targetId,
    serverTs: ent.serverTs
  };

  return Result.succeed(favorite);
}
