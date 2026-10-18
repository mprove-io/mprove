import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendRegisterUserRequestDto,
  ToBackendRegisterUserResponseDto
} from '#backend/controllers/users/register-user/register-user.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { EmailService } from '#backend/services/email/email.service';
import {
  type CreateSaltAndHashOutput,
  HashService
} from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
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
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
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
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private usersService: UsersService,
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'passwordHS',
        async (v): Result.ResultAsync<CreateSaltAndHashOutput, never> => {
          let passwordHS: CreateSaltAndHashOutput =
            await this.hashService.createSaltAndHash({ input: v.password });

          return Result.succeed(passwordHS);
        }
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, UserEntToTabError> =>
          this.db.drizzle.query.usersTable
            .findFirst({ where: eq(usersTable.emailHash, v.emailHash) })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.userEntToTab({ userEnt: x })
            )
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
      Result.bind(
        'alias',
        async (v): Result.ResultAsync<string, MakeAliasError> =>
          isDefined(v.user)
            ? Result.succeed(undefined)
            : this.usersService.makeAlias({ email: v.email })
      ),
      Result.andThrough(v =>
        isUndefined(v.user) && v.alias === RESTRICTED_USER_ALIAS
          ? Result.fail({ code: 'BACKEND_RESTRICTED_USER' })
          : Result.succeed()
      ),
      Result.bind('newUser', (v): Result.Result<UserTab, never> => {
        if (isDefined(v.user)) {
          v.user.passwordHash = v.passwordHS.hash;

          v.user.passwordSalt = v.passwordHS.salt;

          return Result.succeed(v.user);
        }

        return Result.succeed({
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
        });
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.writeUnwrap({
                      tx: tx,
                      insert: { users: isDefined(v.user) ? [] : [v.newUser] },
                      insertOrUpdate: {
                        users: isDefined(v.user) ? [v.newUser] : []
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
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
          user: this.usersService.tabToApi({ user: v.newUser })
        })
      )
    );
  }
}
