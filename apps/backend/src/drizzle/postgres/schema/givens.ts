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
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import type { GivenLt, GivenSt } from '#common/types/shared/st-lt/st-lt';

export const givensTable = pgTable(
  'givens',
  {
    givenFullId: varchar('given_full_id', { length: 64 })
      .notNull()
      .primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    givenId: varchar('given_id', { length: 32 }).notNull(), // name
    type: varchar('type').$type<GivenTypeEnum>().notNull(),
    isMultiple: boolean('is_multiple'),
    st: json('st').$type<{ encrypted: string; decrypted: GivenSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: GivenLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxGivensServerTs: index('idx_givens_server_ts').on(table.serverTs),
    idxGivensProjectId: index('idx_givens_project_id').on(table.projectId),
    idxGivensGivenId: index('idx_givens_given_id').on(table.givenId),
    idxGivensKeyTag: index('idx_givens_key_tag').on(table.keyTag),
    //
    uidxGivensProjectIdGivenId: uniqueIndex(
      'uidx_givens_project_id_given_id'
    ).on(table.projectId, table.givenId)
  })
);

export type GivenEnt = InferSelectModel<typeof givensTable>;
export type GivenEntIns = InferInsertModel<typeof givensTable>;
