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
import { DashboardLt, DashboardSt } from '~common/interfaces/st-lt';

export const dashboardsTable = pgTable(
  'dashboards',
  {
    dashboardFullId: varchar('dashboard_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    structId: varchar('struct_id', { length: 32 }).notNull(),
    dashboardId: varchar('dashboard_id', { length: 32 }).notNull(), // name
    creatorId: varchar('creator_id', { length: 32 }), // user_id
    draft: boolean('draft').notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: DashboardSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: DashboardLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxDashboardsServerTs: index('idx_dashboards_server_ts').on(table.serverTs),
    idxDashboardsStructId: index('idx_dashboards_struct_id').on(table.structId),
    idxDashboardsDashboardId: index('idx_dashboards_dashboard_id').on(
      table.dashboardId
    ),
    idxDashboardsKeyTag: index('idx_dashboards_key_tag').on(table.keyTag),
    //
    uidxDashboardsStructIdDasboardId: uniqueIndex(
      'uidx_dashboards_struct_id_dashboard_id'
    ).on(table.structId, table.dashboardId)
  })
);

export type DashboardEnt = InferSelectModel<typeof dashboardsTable>;
export type DashboardEntIns = InferInsertModel<typeof dashboardsTable>;
