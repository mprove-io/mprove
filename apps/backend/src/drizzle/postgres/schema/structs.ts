import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, json, pgTable, varchar } from 'drizzle-orm/pg-core';
import { MproveConfig } from '~common/interfaces/backend/mprove-config';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';

export const structsTable = pgTable(
  'structs',
  {
    structId: varchar('struct_id', { length: 32 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    errors: json('errors').$type<BmlError[]>().notNull(),
    metrics: json('metrics').$type<ModelMetric[]>().default([]),
    presets: json('presets').$type<Preset[]>().default([]),
    mproveConfig: json('mprove_config').$type<MproveConfig>(),
    mproveVersion: varchar('mprove_version'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxStructsServerTs: index('idx_structs_server_ts').on(table.serverTs),
    idxStructsProjectId: index('idx_structs_project_id').on(table.projectId)
  })
);

export type StructEnt = InferSelectModel<typeof structsTable>;
export type StructEntIns = InferInsertModel<typeof structsTable>;
