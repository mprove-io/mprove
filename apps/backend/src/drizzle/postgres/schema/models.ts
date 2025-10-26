import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ModelLt, ModelSt } from '~common/interfaces/st-lt';

export const modelsTable = pgTable(
  'models',
  {
    modelFullId: varchar('model_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    modelId: varchar('model_id', { length: 64 }).notNull(), // name
    type: varchar('type').$type<ModelTypeEnum>(),
    connectionId: varchar('connection_id'),
    connectionType: varchar('connection_type').$type<ConnectionTypeEnum>(),
    st: json('st').$type<{ encrypted: string; decrypted: ModelSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: ModelLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxModelsServerTs: index('idx_models_server_ts').on(table.serverTs),
    idxModelsStructId: index('idx_models_struct_id').on(table.structId),
    idxModelsModelId: index('idx_models_model_id').on(table.modelId),
    idxModelsKeyTag: index('idx_models_key_tag').on(table.keyTag),
    //
    uidxModelsStructIdModelId: uniqueIndex('uidx_models_struct_id_model_id').on(
      table.structId,
      table.modelId
    )
  })
);

export type ModelEnt = InferSelectModel<typeof modelsTable>;
export type ModelEntIns = InferInsertModel<typeof modelsTable>;
