import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionLt, SessionSt } from '#common/interfaces/st-lt';

export const sessionsTable = pgTable(
  'sessions',
  {
    sessionId: varchar('session_id', { length: 255 }).notNull().primaryKey(),
    userId: varchar('user_id', { length: 32 }).notNull(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    sandboxType: varchar('sandbox_type', { length: 32 }).notNull(),
    provider: varchar('provider', { length: 64 }).notNull(),
    model: varchar('model', { length: 64 }),
    lastMessageProviderModel: varchar('last_message_provider_model', {
      length: 64
    }),
    lastMessageVariant: varchar('last_message_variant', {
      length: 64
    }),
    agentMode: varchar('agent_mode', { length: 64 }),
    permissionMode: varchar('permission_mode', { length: 64 }),
    status: varchar('status', { length: 32 })
      .notNull()
      .$type<SessionStatusEnum>(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: SessionSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: SessionLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    lastActivityTs: bigint('last_activity_ts', { mode: 'number' }),
    runningStartTs: bigint('running_start_ts', { mode: 'number' }),
    expiresAt: bigint('expires_at', { mode: 'number' }),
    createdTs: bigint('created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxSessionsServerTs: index('idx_sessions_server_ts').on(table.serverTs),
    idxSessionsLastActivityTs: index('idx_sessions_last_activity_ts').on(
      table.lastActivityTs
    ),
    idxSessionsRunningStartTs: index('idx_sessions_running_start_ts').on(
      table.runningStartTs
    ),
    idxSessionsExpiresTs: index('idx_sessions_expires_ts').on(table.expiresAt),
    idxSessionsCreatedTs: index('idx_sessions_created_ts').on(table.createdTs),
    idxSessionsUserId: index('idx_sessions_user_id').on(table.userId),
    idxSessionsProjectId: index('idx_sessions_project_id').on(table.projectId),
    idxSessionsStatus: index('idx_sessions_status').on(table.status),
    idxSessionsKeyTag: index('idx_sessions_key_tag').on(table.keyTag)
  })
);

export type SessionEnt = InferSelectModel<typeof sessionsTable>;

export type SessionEntIns = InferInsertModel<typeof sessionsTable>;
