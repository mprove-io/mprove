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

export const modelsTable = pgTable(
  'models',
  {
    modelFullId: varchar('model_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    modelId: varchar('model_id', { length: 64 }).notNull(), // name
    connectionId: varchar('connection_id'),
    filePath: varchar('file_path'),
    content: json('content').notNull(),
    isViewModel: boolean('is_view_model'),
    isStoreModel: boolean('is_store_model'),
    accessUsers: json('access_users').$type<string[]>().notNull(),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    label: varchar('label').notNull(),
    gr: varchar('gr'),
    hidden: boolean('hidden').notNull(),
    fields: json('fields').$type<common.ModelField[]>().notNull(),
    nodes: json('nodes').$type<common.ModelNode[]>().notNull(),
    store: json('store').$type<common.FileStore>(),
    description: varchar('description'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxModelsServerTs: index('idx_models_server_ts').on(table.serverTs),
    idxModelsStructId: index('idx_models_struct_id').on(table.structId),
    idxModelsModelId: index('idx_models_model_id').on(table.modelId),
    //
    uidxModelsStructIdModelId: uniqueIndex('uidx_models_struct_id_model_id').on(
      table.structId,
      table.modelId
    )
  })
);

export type ModelEnt = InferSelectModel<typeof modelsTable>;
export type ModelEntIns = InferInsertModel<typeof modelsTable>;
