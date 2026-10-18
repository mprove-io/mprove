import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCompleteUserRegistrationRequestDto,
  ToBackendCompleteUserRegistrationResponseDto
} from '#backend/controllers/users/complete-user-registration/complete-user-registration.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UsersService } from '#backend/services/db/users/users.service';
import {
  type CreateSaltAndHashOutput,
  HashService
} from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendConfirmUserEmailOutput } from '#common/types/backend/routes/users/confirm-user-email/confirm-user-email-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private jwtService: JwtService,
    private hashService: HashService,
    private usersService: UsersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCompleteUserRegistration' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CompleteUserRegistration',
    description: 'Verify email, set password and finish registration'
  })
  @ApiOkResponse({
    type: ToBackendCompleteUserRegistrationResponseDto
  })
  async completeUserRegistration(
    @Body() body: ToBackendCompleteUserRegistrationRequestDto
  ): Promise<BackendResultForOperation<'completeUserRegistration'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        emailVerificationToken: body.input.emailVerificationToken,
        newPassword: body.input.newPassword
      }),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'emailVerificationTokenHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.emailVerificationToken,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, GetUserCheckExistsError> =>
          this.db.drizzle.query.usersTable
            .findFirst({
              where: eq(
                usersTable.emailVerificationTokenHash,
                v.emailVerificationTokenHash
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.fail({ code: 'BACKEND_USER_DOES_NOT_EXIST' })
                : this.tabService.userEntToTab({ userEnt: x })
            )
      ),
      Result.andThrough(v =>
        isDefined(v.user.passwordHash) || v.user.isEmailVerified === true
          ? Result.fail({ code: 'BACKEND_USER_ALREADY_REGISTERED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.membersService.addMemberToDemoProject({
          traceId: v.traceId,
          user: v.user
        })
      ),
      Result.map(v => {
        v.user.isEmailVerified = true;

        return v;
      }),
      Result.bind(
        'newPasswordHS',
        async (v): Result.ResultAsync<CreateSaltAndHashOutput, never> => {
          let newPasswordHS: CreateSaltAndHashOutput =
            await this.hashService.createSaltAndHash({ input: v.newPassword });

          return Result.succeed(newPasswordHS);
        }
      ),
      Result.map(v => {
        v.user.passwordHash = v.newPasswordHS.hash;
        v.user.passwordSalt = v.newPasswordHS.salt;
        v.user.passwordResetExpiresTs = 1;

        return v;
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
                      insertOrUpdate: {
                        users: [v.user]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendConfirmUserEmailOutput => ({
          token: this.jwtService.sign({ userId: v.user.userId }),
          user: this.usersService.tabToApi({ user: v.user })
        })
      )
    );
  }
}
