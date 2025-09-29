import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
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
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';

export const modelsTable = pgTable(
  'models',
  {
    modelFullId: varchar('model_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    modelId: varchar('model_id', { length: 64 }).notNull(), // name
    source: varchar('source'),
    type: varchar('type').$type<ModelTypeEnum>(),
    malloyModelDef: json('malloy_model_def').$type<MalloyModelDef>(),
    connectionId: varchar('connection_id'),
    connectionType: varchar('connection_type').$type<ConnectionTypeEnum>(),
    filePath: varchar('file_path'),
    fileText: varchar('file_text'),
    content: json('content'),
    isViewModel: boolean('is_view_model'),
    // isStoreModel: boolean('is_store_model'),
    dateRangeIncludesRightSide: boolean('date_range_includes_right_side'),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    label: varchar('label').notNull(),
    gr: varchar('gr'),
    hidden: boolean('hidden').notNull(),
    fields: json('fields').$type<ModelField[]>().notNull(),
    nodes: json('nodes').$type<ModelNode[]>().notNull(),
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
