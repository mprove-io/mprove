import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { makeUserAliasUnwrap } from '#backend/functions/db/users/make-user-alias-unwrap/make-user-alias-unwrap';
import {
  type CreateSaltAndHashOutput,
  createSaltAndHash
} from '#backend/functions/hash/create-salt-and-hash/create-salt-and-hash';
import type { DbService } from '#backend/services/db/db.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';

export async function addMproveAdminUser(item: {
  email: string;
  password: string;
  db: DbService;
}): Promise<UserTab> {
  let { email, password, db } = item;

  let passwordHS: CreateSaltAndHashOutput = await createSaltAndHash({
    input: password
  });

  let alias: string = await makeUserAliasUnwrap({
    email: email,
    db: db
  });

  let emailVerificationToken: string = makeId();

  let user: UserTab = {
    userId: makeId(),
    isEmailVerified: true,
    passwordHash: passwordHS.hash,
    passwordSalt: passwordHS.salt,
    jwtMinIat: undefined,
    email: email,
    alias: alias,
    firstName: undefined,
    lastName: undefined,
    emailVerificationToken: emailVerificationToken,
    passwordResetToken: undefined,
    passwordResetExpiresTs: undefined,
    ui: makeCopy(DEFAULT_SRV_UI),
    emailHash: undefined, // tab-to-ent
    aliasHash: undefined, // tab-to-ent
    emailVerificationTokenHash: undefined, // tab-to-ent
    passwordResetTokenHash: undefined, // tab-to-ent
    apiKeyPrefix: undefined,
    codexAuthUpdateTs: undefined,
    codexAuthExpiresTs: undefined,
    keyTag: undefined,
    serverTs: undefined,
    createdTs: Date.now()
  };

  await db.writeUnwrap({
    insert: {
      users: [user]
    }
  });

  return user;
}
