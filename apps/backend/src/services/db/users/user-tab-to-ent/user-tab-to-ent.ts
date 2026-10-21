import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { UserTabToEntError } from '#common/types/backend/function-errors/user-tab-to-ent-error';
import type { UserLt } from '#common/types/shared/st-lt/users/user-lt';
import type { UserSt } from '#common/types/shared/st-lt/users/user-st';

export function userTabToEnt(item: {
  tab: UserTab;
  hashSecret?: string;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<UserEnt, UserTabToEntError> {
  let { tab } = item;

  let userSt: UserSt = {};

  let userLt: UserLt = {
    email: tab.email,
    alias: tab.alias,
    passwordHash: tab.passwordHash,
    passwordSalt: tab.passwordSalt,
    firstName: tab.firstName,
    lastName: tab.lastName,
    emailVerificationToken: tab.emailVerificationToken,
    passwordResetToken: tab.passwordResetToken,
    passwordResetExpiresTs: tab.passwordResetExpiresTs,
    ui: tab.ui,
    apiKeySecretHash: tab.apiKeySecretHash,
    apiKeySalt: tab.apiKeySalt,
    codexAuth: tab.codexAuth
  };

  return Result.pipe(
    Result.succeed({
      ...item,
      st: userSt,
      lt: userLt
    }),
    Result.bind('emailHash', v =>
      v.hashService.makeHash({
        input: v.tab.email,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('aliasHash', v =>
      v.hashService.makeHash({
        input: v.tab.alias,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('emailVerificationTokenHash', v =>
      v.hashService.makeHash({
        input: v.tab.emailVerificationToken,
        hashSecret: v.hashSecret
      })
    ),
    Result.bind('passwordResetTokenHash', v =>
      v.hashService.makeHash({
        input: v.tab.passwordResetToken,
        hashSecret: v.hashSecret
      })
    ),
    Result.map(
      (v): UserEnt => ({
        userId: v.tab.userId,
        isEmailVerified: v.tab.isEmailVerified,
        jwtMinIat: v.tab.jwtMinIat,
        apiKeyPrefix: v.tab.apiKeyPrefix,
        codexAuthUpdateTs: v.tab.codexAuthUpdateTs,
        codexAuthExpiresTs: v.tab.codexAuthExpiresTs,
        emailHash: v.emailHash,
        aliasHash: v.aliasHash,
        emailVerificationTokenHash: v.emailVerificationTokenHash,
        passwordResetTokenHash: v.passwordResetTokenHash,
        serverTs: v.tab.serverTs,
        createdTs: v.tab.createdTs,
        ...getEntProps({
          dataSt: v.st,
          dataLt: v.lt,
          isMetadata: false,
          tabService: v.tabService,
          isEncryptDb: v.isEncryptDb,
          isEncryptMetadata: v.isEncryptMetadata
        })
      })
    )
  );
}
