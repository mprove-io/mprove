import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  integer,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { QueryLt, QuerySt } from '#common/interfaces/st-lt';

export const queriesTable = pgTable(
  'queries',
  {
    queryId: varchar('query_id', { length: 64 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    envId: varchar('env_id', { length: 32 }).notNull(),
    connectionId: varchar('connection_id', { length: 32 }).notNull(),
    connectionType: varchar('connection_type')
      .$type<ConnectionTypeEnum>()
      .notNull(),
    reportId: varchar('report_id', { length: 32 }),
    reportStructId: varchar('report_struct_id', { length: 32 }),
    queryJobId: varchar('query_job_id'),
    bigqueryQueryJobId: varchar('bigquery_query_job_id'),
    status: varchar('status').$type<QueryStatusEnum>().notNull(),
    lastRunBy: varchar('last_run_by'),
    lastRunTs: bigint('last_run_ts', { mode: 'number' }),
    lastCancelTs: bigint('last_cancel_ts', { mode: 'number' }),
    lastCompleteTs: bigint('last_complete_ts', { mode: 'number' }),
    lastCompleteDuration: bigint('last_complete_duration', { mode: 'number' }),
    lastErrorTs: bigint('last_error_ts', { mode: 'number' }),
    bigqueryConsecutiveErrorsGetJob: integer(
      'bigquery_consecutive_errors_get_job'
    ),
    bigqueryConsecutiveErrorsGetResults: integer(
      'bigquery_consecutive_errors_get_results'
    ),
    st: json('st').$type<{ encrypted: string; decrypted: QuerySt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: QueryLt }>().notNull(),
    keyTag: text('key_tag'),
    apiUrlHash: varchar('api_url_hash'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxQueriesServerTs: index('idx_queries_server_ts').on(table.serverTs),
    idxQueriesProjectId: index('idx_queries_project_id').on(table.projectId),
    idxQueriesEnvId: index('idx_queries_env_id').on(table.envId),
    idxQueriesConnectionId: index('idx_queries_connection_id').on(
      table.connectionId
    ),
    idxQueriesQueryJobId: index('idx_queries_query_job_id').on(
      table.queryJobId
    ),
    idxQueriesBigqueryQueryJobId: index('idx_queries_bigquery_query_job_id').on(
      table.bigqueryQueryJobId
    ),
    idxQueriesApiUrlHash: index('idx_queries_api_url_hash').on(
      table.apiUrlHash
    ),
    idxQueriesKeyTag: index('idx_queries_key_tag').on(table.keyTag)
  })
);

export type QueryEnt = InferSelectModel<typeof queriesTable>;
export type QueryEntIns = InferInsertModel<typeof queriesTable>;
