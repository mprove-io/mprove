/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  pgTable,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';

export const evsTable = pgTable(
  'evs',
  {
    evFullId: varchar('ev_full_id', { length: 64 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    evId: varchar('ev_id', { length: 32 }).notNull(), // name
    val: varchar('val'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxEvsServerTs: index('idx_evs_server_ts').on(table.serverTs),
    idxEvsProjectId: index('idx_evs_project_id').on(table.projectId),
    idxEvsEnvId: index('idx_evs_env_id').on(table.envId),
    idxEvsEvId: index('idx_evs_ev_id').on(table.evId),
    //
    uidxEvsProjectIdEnvIdEvId: uniqueIndex(
      'uidx_evs_project_id_env_id_ev_id'
    ).on(table.projectId, table.envId, table.evId)
  })
);

export type EvEnt = InferSelectModel<typeof evsTable>;
export type EvEntIns = InferInsertModel<typeof evsTable>;
