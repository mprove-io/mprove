import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendRegisterUserRequestDto,
  ToBackendRegisterUserResponseDto
} from '#backend/controllers/users/register-user/register-user.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { makeUserAlias } from '#backend/functions/db/users/make-user-alias/make-user-alias';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import {
  type CreateSaltAndHashOutput,
  createSaltAndHash
} from '#backend/functions/hash/create-salt-and-hash/create-salt-and-hash';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { EmailService } from '#backend/services/email/email.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import {
  DEFAULT_SRV_UI,
  THROTTLE_MULTIPLIER
} from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRegisterUserOutput } from '#common/types/backend/routes/users/register-user/register-user-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle({
  '1s': {
    limit: 2 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 3 * THROTTLE_MULTIPLIER
  },
  // '60s': {
  //   limit: 5 * THROTTLE_MULTIPLIER,
  //   blockDuration: seconds(1 * 60 * 60)
  // },
  '24h': {
    limit: 10 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(24 * 60 * 60)
  }
})
@Controller()
export class RegisterUserController {
  constructor(
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}

  @Post('api/ToBackendRegisterUser' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'RegisterUser',
    description: 'Register a new user and send an email verification'
  })
  @ApiOkResponse({
    type: ToBackendRegisterUserResponseDto
  })
  async registerUser(
    @Body() body: ToBackendRegisterUserRequestDto
  ): Promise<BackendResultForOperation<'registerUser'>> {
    return Result.pipe(
      Result.succeed({
        email: body.input.email,
        password: body.input.password
      }),
      Result.bind('passwordHS', async v => {
        let passwordHS: CreateSaltAndHashOutput = await createSaltAndHash({
          input: v.password
        });

        return Result.succeed(passwordHS);
      }),
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('emailHash', v =>
        makeHash({
          input: v.email,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('user', v =>
        this.db.users.findFirst({
          where: eq(usersTable.emailHash, v.emailHash)
        })
      ),
      Result.andThrough(v =>
        isDefined(v.user?.passwordHash) && v.user.isEmailVerified === true
          ? Result.fail({ code: 'BACKEND_USER_ALREADY_REGISTERED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.user) &&
        this.cs.get<BackendConfig['registerOnlyInvitedUsers']>(
          'registerOnlyInvitedUsers'
        ) === true
          ? Result.fail({ code: 'BACKEND_USER_IS_NOT_INVITED' })
          : Result.succeed()
      ),
      Result.bind('alias', async v =>
        isDefined(v.user)
          ? Result.succeed(undefined)
          : makeUserAlias({
              email: v.email,
              db: this.db
            })
      ),
      Result.andThrough(v =>
        isUndefined(v.user) && v.alias === RESTRICTED_USER_ALIAS
          ? Result.fail({ code: 'BACKEND_RESTRICTED_USER' })
          : Result.succeed()
      ),
      Result.bind('newUser', v => {
        if (isDefined(v.user)) {
          v.user.passwordHash = v.passwordHS.hash;

          v.user.passwordSalt = v.passwordHS.salt;

          return Result.succeed(v.user);
        }

        let newUser: UserTab = {
          userId: makeId(),
          email: v.email,
          passwordResetToken: undefined,
          passwordResetExpiresTs: undefined,
          isEmailVerified: false,
          emailVerificationToken: makeId(),
          passwordHash: v.passwordHS.hash,
          passwordSalt: v.passwordHS.salt,
          jwtMinIat: undefined,
          alias: v.alias,
          firstName: undefined,
          lastName: undefined,
          ui: makeCopy(DEFAULT_SRV_UI),
          emailHash: undefined, // tab-to-ent
          aliasHash: undefined, // tab-to-ent
          passwordResetTokenHash: undefined, // tab-to-ent
          emailVerificationTokenHash: undefined, // tab-to-ent
          apiKeyPrefix: undefined,
          codexAuthUpdateTs: undefined,
          codexAuthExpiresTs: undefined,
          keyTag: undefined,
          serverTs: undefined,
          createdTs: Date.now()
        };

        return Result.succeed(newUser);
      }),
      Result.andThrough(v =>
        this.db.write({
          insert: { users: isDefined(v.user) ? [] : [v.newUser] },
          insertOrUpdate: {
            users: isDefined(v.user) ? [v.newUser] : []
          }
        })
      ),
      Result.andThrough(async v => {
        await this.emailService.sendVerification({
          email: v.email,
          emailVerificationToken: v.newUser.emailVerificationToken
        });
        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendRegisterUserOutput => ({
          user: userTabToApi({
            user: v.newUser
          })
        })
      )
    );
  }
}
