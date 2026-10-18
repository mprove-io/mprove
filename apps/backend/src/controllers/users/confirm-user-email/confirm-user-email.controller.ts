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
  ToBackendConfirmUserEmailRequestDto,
  ToBackendConfirmUserEmailResponseDto
} from '#backend/controllers/users/confirm-user-email/confirm-user-email.dto';
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
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
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
export class ConfirmUserEmailController {
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

  @Post('api/ToBackendConfirmUserEmail' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ConfirmUserEmail',
    description: "Verify the user's email using the verification token"
  })
  @ApiOkResponse({
    type: ToBackendConfirmUserEmailResponseDto
  })
  async confirmUserEmail(
    @Body() body: ToBackendConfirmUserEmailRequestDto
  ): Promise<BackendResultForOperation<'confirmUserEmail'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        emailVerificationToken: body.input.emailVerificationToken
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
        this.usersService.checkUserPasswordHashIsDefined({ user: v.user })
      ),
      Result.andThrough(v =>
        this.membersService.addMemberToDemoProject({
          traceId: v.traceId,
          user: v.user
        })
      ),
      Result.bind(
        'isVerifyEmail',
        (v): Result.Result<boolean, never> =>
          Result.succeed(v.user.isEmailVerified === false)
      ),
      Result.andThrough(v =>
        v.isVerifyEmail
          ? dbErrorToResult({
              action: async () => {
                v.user.isEmailVerified = true;

                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
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
          : Result.succeed()
      ),
      Result.map(
        (v): ToBackendConfirmUserEmailOutput =>
          v.isVerifyEmail
            ? {
                token: this.jwtService.sign({ userId: v.user.userId }),
                user: this.usersService.tabToApi({ user: v.user })
              }
            : {}
      )
    );
  }
}
