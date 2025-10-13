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
import { ReportLt, ReportSt } from '~common/interfaces/st-lt';

export const reportsTable = pgTable(
  'reports',
  {
    reportFullId: varchar('report_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    reportId: varchar('report_id', { length: 32 }).notNull(), // name
    projectId: varchar('project_id', { length: 32 }).notNull(),
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    draft: boolean('draft').notNull(),
    draftCreatedTs: bigint('draft_created_ts', { mode: 'number' }).notNull(),
    // filePath: varchar('file_path'),
    // accessRoles: json('access_roles').$type<string[]>().notNull(),
    // title: varchar('title').notNull(),
    // fields: json('fields').$type<ReportField[]>(),
    // rows: json('rows').$type<Row[]>().notNull(),
    // chart: json('chart').$type<MconfigChart>(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: ReportSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: ReportLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxReportsServerTs: index('idx_reports_server_ts').on(table.serverTs),
    idxReportsStructId: index('idx_reports_struct_id').on(table.structId),
    idxReportsReportId: index('idx_reports_report_id').on(table.reportId),
    idxReportsProjectId: index('idx_reports_project_id').on(table.projectId),
    idxReportsKeyTag: index('idx_reports_key_tag').on(table.keyTag),
    //
    uidxReportsStructIdReportId: uniqueIndex(
      'uidx_reports_struct_id_report_id'
    ).on(table.structId, table.reportId)
  })
);

export type ReportEnt = InferSelectModel<typeof reportsTable>;
export type ReportEntIns = InferInsertModel<typeof reportsTable>;
