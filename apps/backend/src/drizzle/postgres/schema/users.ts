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
import { UserLt, UserSt } from '~common/interfaces/st-lt';

export const usersTable = pgTable(
  'users',
  {
    userId: varchar('user_id', { length: 32 }).notNull().primaryKey(),
    isEmailVerified: boolean('is_email_verified').notNull(),
    jwtMinIat: bigint('jwt_min_iat', { mode: 'number' }),
    st: json('st').$type<{ encrypted: string; decrypted: UserSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: UserLt }>().notNull(),
    keyTag: text('key_tag'),
    emailHash: varchar('email_hash').notNull(),
    aliasHash: varchar('alias_hash'),
    emailVerificationTokenHash: varchar(
      'email_verification_token_hash'
    ).notNull(),
    passwordResetTokenHash: varchar('password_reset_token_hash'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxUsersServerTs: index('idx_users_server_ts').on(table.serverTs),
    idxUsersKeyTag: index('idx_users_key_tag').on(table.keyTag),
    //
    uidxUsersEmailHash: uniqueIndex('uidx_users_email_hash').on(
      table.emailHash
    ),
    uidxUsersAliasHash: uniqueIndex('uidx_users_alias_hash').on(
      table.aliasHash
    ),
    uidxUsersEmailVerificationTokenHash: uniqueIndex(
      'uidx_users_email_verification_token_hash'
    ).on(table.emailVerificationTokenHash),
    uidxUsersPasswordResetTokenHash: uniqueIndex(
      'uidx_users_password_reset_token_hash'
    ).on(table.passwordResetTokenHash)
  })
);

export type UserEnt = InferSelectModel<typeof usersTable>;
export type UserEntIns = InferInsertModel<typeof usersTable>;
