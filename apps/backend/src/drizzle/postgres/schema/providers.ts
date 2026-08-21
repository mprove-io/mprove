import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import type { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { ProviderLt, ProviderSt } from '#common/zod/st-lt';

export const providersTable = pgTable(
  'providers',
  {
    providerFullId: varchar('provider_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    providerId: varchar('provider_id', { length: 32 }).notNull(), // name
    type: varchar('type').$type<ProviderTypeEnum>().notNull(),
    isEnabled: boolean('is_enabled').notNull(),
    models: json('models').$type<LlmModel[]>().notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: ProviderSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: ProviderLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxProvidersServerTs: index('idx_providers_server_ts').on(table.serverTs),
    idxProvidersProjectId: index('idx_providers_project_id').on(
      table.projectId
    ),
    idxProvidersConnectionId: index('idx_providers_provider_id').on(
      table.providerId
    ),
    idxProvidersKeyTag: index('idx_providers_key_tag').on(table.keyTag),
    //
    uidxProvidersProjectIdProviderId: uniqueIndex(
      'uidx_providers_project_id_provider_id'
    ).on(table.projectId, table.providerId)
  })
);

export type ProviderEnt = InferSelectModel<typeof providersTable>;
export type ProviderEntIns = InferInsertModel<typeof providersTable>;
