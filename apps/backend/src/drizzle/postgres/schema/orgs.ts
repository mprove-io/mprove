import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';

export const orgsTable = pgTable(
  'orgs',
  {
    orgId: varchar('org_id', { length: 128 }).notNull().primaryKey(), // length 128 required for tests
    ownerId: varchar('owner_id').notNull(),
    st: text('st'),
    lt: text('lt'),
    nameHash: varchar('name_hash').notNull(),
    ownerEmailHash: varchar('owner_email_hash').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOrgsOwnerId: index('idx_orgs_owner_id').on(table.ownerId),
    idxOrgsOwnerEmailHash: index('idx_orgs_owner_email_hash').on(
      table.ownerEmailHash
    ),
    //
    uidxOrgsNameHash: uniqueIndex('uidx_orgs_name_hash').on(table.nameHash)
  })
);

export type OrgEnt = InferSelectModel<typeof orgsTable>;
export type OrgEntIns = InferInsertModel<typeof orgsTable>;
