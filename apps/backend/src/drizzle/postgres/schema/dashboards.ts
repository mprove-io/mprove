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
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Tile } from '~common/interfaces/blockml/tile';

export const dashboardsTable = pgTable(
  'dashboards',
  {
    dashboardFullId: varchar('dashboard_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    dashboardId: varchar('dashboard_id', { length: 32 }).notNull(), // name
    filePath: varchar('file_path'),
    content: json('content').notNull(),
    accessRoles: json('access_roles').$type<string[]>().notNull(),
    title: varchar('title'),
    gr: varchar('gr'),
    hidden: boolean('hidden').notNull(),
    fields: json('fields').$type<DashboardField[]>().notNull(),
    tiles: json('tiles').$type<Tile[]>().notNull(),
    description: varchar('description'),
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    draft: boolean('draft').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxDashboardsServerTs: index('idx_dashboards_server_ts').on(table.serverTs),
    idxDashboardsStructId: index('idx_dashboards_struct_id').on(table.structId),
    idxDashboardsDashboardId: index('idx_dashboards_dashboard_id').on(
      table.dashboardId
    ),
    //
    uidxDashboardsStructIdDasboardId: uniqueIndex(
      'uidx_dashboards_struct_id_dashboard_id'
    ).on(table.structId, table.dashboardId)
  })
);

export type DashboardEnt = InferSelectModel<typeof dashboardsTable>;
export type DashboardEntIns = InferInsertModel<typeof dashboardsTable>;
