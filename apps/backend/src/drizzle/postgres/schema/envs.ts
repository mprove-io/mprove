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

export const envsTable = pgTable(
  'envs',
  {
    envFullId: varchar('env_full_id', { length: 64 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    memberIds: json('member_ids').$type<string[]>().default([]),
    evs: json('evs').$type<Ev[]>().default([]),
    isFallbackToProdConnections: boolean(
      'is_fallback_to_prod_connections'
    ).default(false),
    isFallbackToProdVariables: boolean('is_fallback_to_prod_variables').default(
      false
    ),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxEnvsServerTs: index('idx_envs_server_ts').on(table.serverTs),
    idxEnvsProjectId: index('idx_envs_project_id').on(table.projectId),
    idxEnvsEnvId: index('idx_envs_env_id').on(table.envId),
    //
    uidxEnvsProjectIdEnvId: uniqueIndex('uidx_envs_project_id_env_id').on(
      table.projectId,
      table.envId
    )
  })
);

export type EnvEnt = InferSelectModel<typeof envsTable>;
export type EnvEntIns = InferInsertModel<typeof envsTable>;
