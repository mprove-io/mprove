import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { StructLt, StructSt } from '#common/interfaces/st-lt';

export const structsTable = pgTable(
  'structs',
  {
    structId: varchar('struct_id', { length: 32 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    mproveVersion: varchar('mprove_version'),
    st: json('st')
      .$type<{ encrypted: string; decrypted: StructSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: StructLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxStructsServerTs: index('idx_structs_server_ts').on(table.serverTs),
    idxStructsProjectId: index('idx_structs_project_id').on(table.projectId),
    idxStructsKeyTag: index('idx_structs_key_tag').on(table.keyTag)
  })
);

export type StructEnt = InferSelectModel<typeof structsTable>;
export type StructEntIns = InferInsertModel<typeof structsTable>;
