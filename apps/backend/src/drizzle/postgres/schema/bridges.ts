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
import { BridgeLt, BridgeSt } from '#common/interfaces/st-lt';

export const bridgesTable = pgTable(
  'bridges',
  {
    bridgeFullId: varchar('bridge_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    repoId: varchar('repo_id', { length: 32 }).notNull(),
    branchId: varchar('branch_id', { length: 32 }).notNull(), // name
    envId: varchar('env_id', { length: 32 }).notNull(), // name
    structId: varchar('struct_id', { length: 32 }).notNull(),
    needValidate: boolean('need_validate').notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: BridgeSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: BridgeLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxBridgesServerTs: index('idx_bridges_server_ts').on(table.serverTs),
    idxBridgesProjectId: index('idx_bridges_project_id').on(table.projectId),
    idxBridgesRepoId: index('idx_bridges_repo_id').on(table.repoId),
    idxBridgesBranchId: index('idx_bridges_branch_id').on(table.branchId),
    idxBridgesEnvId: index('idx_bridges_env_id').on(table.envId),
    idxBridgesStructId: index('idx_bridges_struct_id').on(table.structId),
    idxBridgesKeyTag: index('idx_bridges_key_tag').on(table.keyTag),
    //
    uidxBridgesProjectIdRepoIdBranchIdEnvId: uniqueIndex(
      'uidx_bridges_project_id_repo_id_branch_id_env_id'
    ).on(table.projectId, table.repoId, table.branchId, table.envId)
  })
);

export type BridgeEnt = InferSelectModel<typeof bridgesTable>;
export type BridgeEntIns = InferInsertModel<typeof bridgesTable>;
