/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
  'users',
  {
    userId: varchar('user_id', { length: 36 }).notNull().primaryKey(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxUsersServerTs: index('idx_users_server_ts').on(table.serverTs)
  })
);

export type UserEnt = InferSelectModel<typeof usersTable>;
export type UserEntIns = InferInsertModel<typeof usersTable>;
