import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';

export const favoritesTable = pgTable(
  'favorites',
  {
    favoriteFullId: varchar('favorite_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    userId: varchar('user_id', { length: 32 }).notNull(),
    type: varchar('type').$type<FavoriteTypeEnum>().notNull(),
    targetId: varchar('target_id', { length: 32 }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxFavoritesProjectId: index('idx_favorites_project_id').on(
      table.projectId
    ),
    idxFavoritesUserId: index('idx_favorites_user_id').on(table.userId),
    idxFavoritesTargetId: index('idx_favorites_target_id').on(table.targetId),
    idxFavoritesServerTs: index('idx_favorites_server_ts').on(table.serverTs),
    //
    uidxFavoritesUserProjectTypeTarget: uniqueIndex(
      'uidx_favorites_user_project_type_target'
    ).on(table.userId, table.projectId, table.type, table.targetId)
  })
);

export type FavoriteEnt = InferSelectModel<typeof favoritesTable>;
export type FavoriteEntIns = InferInsertModel<typeof favoritesTable>;
