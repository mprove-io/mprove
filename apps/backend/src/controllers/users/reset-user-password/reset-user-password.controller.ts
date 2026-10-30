import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendResetUserPasswordRequestDto,
  ToBackendResetUserPasswordResponseDto
} from '#backend/controllers/users/reset-user-password/reset-user-password.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { checkUserPasswordHashIsDefined } from '#backend/functions/db/users/check-user-password-hash-is-defined/check-user-password-hash-is-defined';
import { getUserByEmailCheckExists } from '#backend/functions/db/users/get-user-by-email-check-exists/get-user-by-email-check-exists';
import { makeTsUsingOffsetFromNow } from '#backend/functions/ts/make-ts-using-offset-from-now/make-ts-using-offset-from-now';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { DbService } from '#backend/services/db/db.service';
import { EmailService } from '#backend/services/email/email.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PATH_UPDATE_PASSWORD } from '#common/constants/top';
import {
  PASSWORD_EXPIRES_OFFSET,
  THROTTLE_MULTIPLIER
} from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
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
    private emailService: EmailService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
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
      Result.bind('user', v =>
        getUserByEmailCheckExists({
          email: v.email,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.andThrough(v =>
        checkUserPasswordHashIsDefined({
          user: v.user
        })
      ),
      Result.map(v => {
        v.user.passwordResetToken = makeId();

        v.user.passwordResetExpiresTs = makeTsUsingOffsetFromNow(
          PASSWORD_EXPIRES_OFFSET
        );

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            users: [v.user]
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
