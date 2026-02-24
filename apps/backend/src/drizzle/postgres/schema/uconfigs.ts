import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { UconfigLt, UconfigSt } from '#common/interfaces/st-lt';

export const uconfigsTable = pgTable(
  'uconfigs',
  {
    uconfigId: varchar('uconfig_id', { length: 32 }).notNull().primaryKey(),
    providerModels: json('provider_models').$type<AgentModelApi[]>().notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: UconfigSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: UconfigLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxUconfigsServerTs: index('idx_uconfigs_server_ts').on(table.serverTs),
    idxUconfigsKeyTag: index('idx_uconfigs_key_tag').on(table.keyTag)
  })
);

export type UconfigEnt = InferSelectModel<typeof uconfigsTable>;
export type UconfigEntIns = InferInsertModel<typeof uconfigsTable>;
