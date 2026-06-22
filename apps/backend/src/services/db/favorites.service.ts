import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { favoritesTable } from '#backend/drizzle/postgres/schema/favorites';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { HashService } from '../hash.service';

@Injectable()
export class FavoritesService {
  constructor(
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeFavoriteFullId(item: {
    userId: string;
    projectId: string;
    type: FavoriteTypeEnum;
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
    type: FavoriteTypeEnum;
    targetId: string;
    isFavorite: boolean;
  }) {
    let { projectId, userId, type, targetId, isFavorite } = item;

    let favoriteFullId = this.makeFavoriteFullId({
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
  }

  async getFavoriteTargetIds(item: {
    projectId: string;
    userId: string;
    type: FavoriteTypeEnum;
    targetIds: string[];
  }) {
    let { projectId, userId, type, targetIds } = item;

    if (targetIds.length === 0) {
      return [];
    }

    let favorites = await this.db.drizzle.query.favoritesTable.findMany({
      where: and(
        eq(favoritesTable.projectId, projectId),
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.type, type),
        inArray(favoritesTable.targetId, targetIds)
      )
    });

    return favorites.map(favorite => favorite.targetId);
  }
}
