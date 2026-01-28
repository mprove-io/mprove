import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
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
import { EnvLt, EnvSt } from '#common/interfaces/st-lt';

export const envsTable = pgTable(
  'envs',
  {
    envFullId: varchar('env_full_id', { length: 64 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    memberIds: json('member_ids').$type<string[]>().default([]),
    isFallbackToProdConnections: boolean(
      'is_fallback_to_prod_connections'
    ).default(false),
    isFallbackToProdVariables: boolean('is_fallback_to_prod_variables').default(
      false
    ),
    st: json('st').$type<{ encrypted: string; decrypted: EnvSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: EnvLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxEnvsServerTs: index('idx_envs_server_ts').on(table.serverTs),
    idxEnvsProjectId: index('idx_envs_project_id').on(table.projectId),
    idxEnvsEnvId: index('idx_envs_env_id').on(table.envId),
    idxEnvsKeyTag: index('idx_envs_key_tag').on(table.keyTag),
    //
    uidxEnvsProjectIdEnvId: uniqueIndex('uidx_envs_project_id_env_id').on(
      table.projectId,
      table.envId
    )
  })
);

export type EnvEnt = InferSelectModel<typeof envsTable>;
export type EnvEntIns = InferInsertModel<typeof envsTable>;
