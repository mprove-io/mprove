/* eslint-disable id-blacklist */
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
import { common } from '~backend/barrels/common';

export const reportsTable = pgTable(
  'reports',
  {
    reportFullId: varchar('report_full_id', { length: 32 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    reportId: varchar('report_id', { length: 64 }).notNull(), // name
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    filePath: varchar('file_path'),
    accessUsers: json('access_users').$type<string[]>().notNull(),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    title: varchar('title').notNull(),
    rows: json('rows').$type<common.Row[]>().notNull(),
    draft: boolean('draft').notNull(),
    draftCreatedTs: bigint('draft_created_ts', { mode: 'number' }).notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxReportsServerTs: index('idx_reports_server_ts').on(table.serverTs),
    idxReportsProjectId: index('idx_reports_project_id').on(table.projectId),
    idxReportsStructId: index('idx_reports_struct_id').on(table.structId),
    idxReportsReportId: index('idx_reports_report_id').on(table.reportId),
    //
    uidxReportsProjectIdStructIdReportId: uniqueIndex(
      'uidx_reports_project_id_struct_id_report_id'
    ).on(table.projectId, table.structId, table.reportId)
  })
);

export type ReportEnt = InferSelectModel<typeof reportsTable>;
export type ReportEntIns = InferInsertModel<typeof reportsTable>;
