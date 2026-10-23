import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { FavoriteTab } from '#backend/drizzle/postgres/schema/_tabs';
import { favoritesTable } from '#backend/drizzle/postgres/schema/favorites';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { FavoriteType } from '#common/types/backend/parts/favorite/favorite-type';

@Injectable()
export class FavoritesService {
  constructor(
    private hashService: HashService,
    private db: DbService
  ) {}

  makeFavoriteFullId(item: {
    userId: string;
    projectId: string;
    type: FavoriteType;
    targetId: string;
  }) {
    let { userId, projectId, type, targetId } = item;

    return this.hashService.makeFavoriteFullId({
      userId: userId,
      projectId: projectId,
      type: type,
      targetId: targetId
    });
  }

  async setFavorite(item: {
    projectId: string;
    userId: string;
    type: FavoriteType;
    targetId: string;
    isFavorite: boolean;
  }): Result.ResultAsync<void, never> {
    let { projectId, userId, type, targetId, isFavorite } = item;

    let favoriteFullId: string = this.makeFavoriteFullId({
      userId: userId,
      projectId: projectId,
      type: type,
      targetId: targetId
    });

    if (isFavorite === true) {
      await this.db.drizzle
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
      await this.db.drizzle
        .delete(favoritesTable)
        .where(eq(favoritesTable.favoriteFullId, favoriteFullId));
    }

    return Result.succeed();
  }

  async getFavoriteTargetIds(item: {
    projectId: string;
    userId: string;
    type: FavoriteType;
    targetIds: string[];
  }): Promise<string[]> {
    let { projectId, userId, type, targetIds } = item;

    if (targetIds.length === 0) {
      return [];
    }

    let favorites: FavoriteTab[] = await this.db.favorites.findManyUnwrap({
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
}
