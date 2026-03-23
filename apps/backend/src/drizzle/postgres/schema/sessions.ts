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
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { SessionLt, SessionSt } from '#common/interfaces/st-lt';

export const sessionsTable = pgTable(
  'sessions',
  {
    sessionId: varchar('session_id', { length: 255 }).notNull().primaryKey(),
    type: varchar('type', { length: 32 }).notNull().$type<SessionTypeEnum>(),
    repoId: varchar('repo_id', { length: 255 }).notNull(),
    branchId: varchar('branch_id', { length: 255 }).notNull(),
    userId: varchar('user_id', { length: 32 }).notNull(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    sandboxType: varchar('sandbox_type', { length: 32 }),
    provider: varchar('provider', { length: 64 }).notNull(),
    model: varchar('model', { length: 64 }),
    lastMessageProviderModel: varchar('last_message_provider_model', {
      length: 64
    }),
    lastMessageVariant: varchar('last_message_variant', {
      length: 64
    }),
    agent: varchar('agent', { length: 64 }),
    status: varchar('status', { length: 32 })
      .notNull()
      .$type<SessionStatusEnum>(),
    archiveReason: varchar('archive_reason', {
      length: 32
    }).$type<ArchiveReasonEnum>(),
    pauseReason: varchar('pause_reason', {
      length: 32
    }).$type<PauseReasonEnum>(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: SessionSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: SessionLt }>()
      .notNull(),
    initialBranch: varchar('initial_branch', { length: 255 }).notNull(),
    envId: varchar('env_id', { length: 255 }),
    initialCommit: varchar('initial_commit', { length: 64 }),
    apiKeyPrefix: varchar('api_key_prefix', { length: 32 }),
    keyTag: text('key_tag'),
    lastActivityTs: bigint('last_activity_ts', { mode: 'number' }),
    sandboxStartTs: bigint('sandbox_start_ts', { mode: 'number' }),
    sandboxEndTs: bigint('sandbox_end_ts', { mode: 'number' }),
    sandboxInfo: json('sandbox_info'),
    lastFetchEventIndex: bigint('last_fetch_event_index', { mode: 'number' }),
    reloadRequestedTs: bigint('reload_requested_ts', { mode: 'number' }),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxSessionsServerTs: index('idx_sessions_server_ts').on(table.serverTs),
    idxSessionsLastActivityTs: index('idx_sessions_last_activity_ts').on(
      table.lastActivityTs
    ),
    idxSessionsSandboxStartTs: index('idx_sessions_sandbox_start_ts').on(
      table.sandboxStartTs
    ),
    idxSessionsSandboxEndTs: index('idx_sessions_sandbox_end_ts').on(
      table.sandboxEndTs
    ),
    idxSessionsCreatedTs: index('idx_sessions_created_ts').on(table.createdTs),
    idxSessionsUserId: index('idx_sessions_user_id').on(table.userId),
    idxSessionsProjectId: index('idx_sessions_project_id').on(table.projectId),
    idxSessionsStatus: index('idx_sessions_status').on(table.status),
    idxSessionsKeyTag: index('idx_sessions_key_tag').on(table.keyTag),
    uidxSessionsApiKeyPrefix: uniqueIndex('uidx_sessions_api_key_prefix').on(
      table.apiKeyPrefix
    )
  })
);

export type SessionEnt = InferSelectModel<typeof sessionsTable>;

export type SessionEntIns = InferInsertModel<typeof sessionsTable>;
