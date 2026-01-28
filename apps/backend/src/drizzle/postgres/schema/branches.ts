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
import { BranchLt, BranchSt } from '#common/interfaces/st-lt';

export const branchesTable = pgTable(
  'branches',
  {
    branchFullId: varchar('branch_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    repoId: varchar('repo_id', { length: 32 }).notNull(),
    branchId: varchar('branch_id', { length: 32 }).notNull(), // name
    st: json('st')
      .$type<{ encrypted: string; decrypted: BranchSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: BranchLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxBranchesServerTs: index('idx_branches_server_ts').on(table.serverTs),
    idxBranchesProjectId: index('idx_branches_project_id').on(table.projectId),
    idxBranchesRepoId: index('idx_branches_repo_id').on(table.repoId),
    idxBranchesBranchId: index('idx_branches_branch_id').on(table.branchId),
    idxBranchesKeyTag: index('idx_branches_key_tag').on(table.keyTag),
    //
    uidxBranchesProjectIdRepoIdBranchId: uniqueIndex(
      'uidx_branches_project_id_repo_id_branch_id'
    ).on(table.projectId, table.repoId, table.branchId)
  })
);

export type BranchEnt = InferSelectModel<typeof branchesTable>;
export type BranchEntIns = InferInsertModel<typeof branchesTable>;
