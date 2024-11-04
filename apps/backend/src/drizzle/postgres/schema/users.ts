/* eslint-disable id-blacklist */
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
import { Ui } from '~common/interfaces/backend/ui';

export const usersTable = pgTable(
  'users',
  {
    userId: varchar('user_id', { length: 36 }).notNull().primaryKey(),
    email: varchar('email').notNull(),
    alias: varchar('alias'),
    isEmailVerified: boolean('is_email_verified').notNull(),
    emailVerificationToken: varchar('email_verification_token').notNull(),
    passwordResetToken: varchar('password_reset_token'),
    passwordResetExpiresTs: bigint('password_reset_expires_ts', {
      mode: 'number'
    }),
    hash: varchar('hash'),
    salt: varchar('salt'),
    jwtMinIat: bigint('jwt_min_iat', { mode: 'number' }),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    timezone: varchar('timezone').notNull(),
    ui: json('ui').$type<Ui>(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxUsersServerTs: index('idx_users_server_ts').on(table.serverTs),
    uidxUsersEmail: uniqueIndex('uidx_users_email').on(table.email),
    uidxUsersAlias: uniqueIndex('uidx_users_alias').on(table.alias),
    uidxUsersEmailVerificationToken: uniqueIndex(
      'uidx_users_email_verification_token'
    ).on(table.emailVerificationToken),
    uidxUsersPasswordResetToken: uniqueIndex(
      'uidx_users_password_reset_token'
    ).on(table.passwordResetToken)
  })
);

export type UserEnt = InferSelectModel<typeof usersTable>;
export type UserEntIns = InferInsertModel<typeof usersTable>;
