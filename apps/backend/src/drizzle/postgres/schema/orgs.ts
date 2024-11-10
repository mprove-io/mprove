/* eslint-disable id-blacklist */
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
    name: text('name').notNull(),
    ownerId: text('owner_id').notNull(),
    ownerEmail: text('owner_email').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOrgsOwnerId: index('idx_orgs_owner_id').on(table.ownerId),
    idxOrgsOwnerEmail: index('idx_orgs_owner_email').on(table.ownerEmail),
    //
    uidxOrgsName: uniqueIndex('uidx_orgs_name').on(table.name)
  })
);

export type OrgEnt = InferSelectModel<typeof orgsTable>;
export type OrgEntIns = InferInsertModel<typeof orgsTable>;
