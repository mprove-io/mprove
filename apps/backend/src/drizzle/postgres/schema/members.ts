import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';

export const membersTable = pgTable(
  'members',
  {
    memberFullId: varchar('member_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    memberId: varchar('member_id', { length: 32 }).notNull(), // user_id
    isAdmin: boolean('is_admin').notNull(),
    isEditor: boolean('is_editor').notNull(),
    isExplorer: boolean('is_explorer').notNull(),
    st: text('st'),
    lt: text('lt'),
    emailHash: varchar('email_hash').notNull(),
    aliasHash: varchar('alias_hash'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxMembersServerTs: index('idx_members_server_ts').on(table.serverTs),
    idxMembersProjectId: index('idx_members_project_id').on(table.projectId),
    idxMembersMemberId: index('idx_members_member_id').on(table.memberId),
    idxMembersEmailHash: index('idx_members_email_hash').on(table.emailHash),
    idxMembersAliasHash: index('idx_members_alias_hash').on(table.aliasHash),
    //
    uidxMembersProjectIdMemberId: uniqueIndex(
      'uidx_members_project_id_member_id'
    ).on(table.projectId, table.memberId)
  })
);

export type MemberEnt = InferSelectModel<typeof membersTable>;
export type MemberEntIns = InferInsertModel<typeof membersTable>;
