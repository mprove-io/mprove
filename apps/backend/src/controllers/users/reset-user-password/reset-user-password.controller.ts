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
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendResetUserPasswordRequestDto,
  ToBackendResetUserPasswordResponseDto
} from '#backend/controllers/users/reset-user-password/reset-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsUsingOffsetFromNow } from '#backend/functions/make-ts-using-offset-from-now/make-ts-using-offset-from-now';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { EmailService } from '#backend/services/email/email.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PATH_UPDATE_PASSWORD } from '#common/constants/top';
import {
  PASSWORD_EXPIRES_OFFSET,
  THROTTLE_MULTIPLIER
} from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetUserByEmailCheckExistsError } from '#common/types/backend/function-errors/get-user-by-email-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

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
export class ResetUserPasswordController {
  constructor(
    private tabService: TabService,
    private emailService: EmailService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendResetUserPassword' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ResetUserPassword',
    description: 'Email a password reset link with a token'
  })
  @ApiOkResponse({
    type: ToBackendResetUserPasswordResponseDto
  })
  async resetUserPassword(
    @Body() body: ToBackendResetUserPasswordRequestDto
  ): Promise<BackendResultForOperation<'resetUserPassword'>> {
    return Result.pipe(
      Result.succeed({ email: body.input.email }),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, GetUserByEmailCheckExistsError> =>
          this.usersService.getUserByEmailCheckExistsResult({ email: v.email })
      ),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
      Result.andThrough(v =>
        this.usersService.checkUserPasswordHashIsDefinedResult({ user: v.user })
      ),
      Result.map(v => {
        v.user.passwordResetToken = makeId();

        v.user.passwordResetExpiresTs = makeTsUsingOffsetFromNow(
          PASSWORD_EXPIRES_OFFSET
        );

        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
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
      ),
      Result.andThrough(async v => {
        let hostUrl: string = this.cs
          .get<BackendConfig['hostUrl']>('hostUrl')
          .split(',')[0];

        let urlUpdatePassword: string = `${hostUrl}/${PATH_UPDATE_PASSWORD}?token=${v.user.passwordResetToken}`;

        await this.emailService.sendResetPassword({
          user: v.user,
          urlUpdatePassword: urlUpdatePassword
        });

        return Result.succeed();
      }),
      Result.map((v): Record<string, never> => ({}))
    );
  }
}
