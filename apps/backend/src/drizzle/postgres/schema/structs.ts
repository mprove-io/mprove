import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const structsTable = pgTable(
  'structs',
  {
    structId: varchar('struct_id', { length: 32 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    // errors: json('errors').$type<BmlError[]>().notNull(),
    // metrics: json('metrics').$type<ModelMetric[]>().default([]),
    // presets: json('presets').$type<Preset[]>().default([]),
    // mproveConfig: json('mprove_config').$type<MproveConfig>(),
    mproveVersion: varchar('mprove_version'),
    tab: text('tab'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxStructsServerTs: index('idx_structs_server_ts').on(table.serverTs),
    idxStructsProjectId: index('idx_structs_project_id').on(table.projectId)
  })
);

export type StructEnt = InferSelectModel<typeof structsTable>;
export type StructEntIns = InferInsertModel<typeof structsTable>;
