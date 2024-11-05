/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { common } from '~backend/barrels/common';

export const vizsTable = pgTable(
  'vizs',
  {
    vizFullId: varchar('viz_full_id', { length: 32 }).notNull().primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    vizId: varchar('viz_id', { length: 32 }).notNull(), // name
    title: varchar('title').notNull(),
    modelId: varchar('model_id', { length: 32 }).notNull(),
    modelLabel: varchar('model_label').notNull(),
    filePath: varchar('file_path'),
    accessUsers: json('access_users').$type<string[]>().notNull(),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    gr: varchar('gr'),
    hidden: boolean('hidden').notNull(),
    tiles: json('tiles').$type<common.Tile[]>().notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxVizsServerTs: index('idx_vizs_server_ts').on(table.serverTs),
    idxVizsStructId: index('idx_vizs_struct_id').on(table.structId),
    idxVizsVizId: index('idx_vizs_viz_id').on(table.vizId),
    idxVizsModelId: index('idx_vizs_model_id').on(table.modelId),
    //
    uidxVizsStructIdVizId: uniqueIndex('uidx_vizs_struct_id_viz_id').on(
      table.structId,
      table.vizId
    )
  })
);

export type VizEnt = InferSelectModel<typeof vizsTable>;
export type VizEntIns = InferInsertModel<typeof vizsTable>;
