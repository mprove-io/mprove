import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { OrgLt, OrgSt } from '~common/interfaces/st-lt';

export const orgsTable = pgTable(
  'orgs',
  {
    orgId: varchar('org_id', { length: 128 }).notNull().primaryKey(), // length 128 required for tests
    ownerId: varchar('owner_id').notNull(),
    st: json('st').$type<{ encrypted: string; decrypted: OrgSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: OrgLt }>().notNull(),
    keyTag: text('key_tag'),
    nameHash: varchar('name_hash').notNull(),
    ownerEmailHash: varchar('owner_email_hash').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxOrgsOwnerId: index('idx_orgs_owner_id').on(table.ownerId),
    idxOrgsOwnerEmailHash: index('idx_orgs_owner_email_hash').on(
      table.ownerEmailHash
    ),
    idxOrgsKeyTag: index('idx_orgs_key_tag').on(table.keyTag),
    //
    uidxOrgsNameHash: uniqueIndex('uidx_orgs_name_hash').on(table.nameHash)
  })
);

export type OrgEnt = InferSelectModel<typeof orgsTable>;
export type OrgEntIns = InferInsertModel<typeof orgsTable>;
