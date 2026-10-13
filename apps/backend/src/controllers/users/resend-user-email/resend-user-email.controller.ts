import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendResendUserEmailRequestDto,
  ToBackendResendUserEmailResponseDto
} from '#backend/controllers/users/resend-user-email/resend-user-email.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip/throttler-ip.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { EmailService } from '#backend/services/email/email.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendResendUserEmailOutput } from '#common/types/backend/routes/users/resend-user-email/resend-user-email-output';

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
export class ResendUserEmailController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private emailService: EmailService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendResendUserEmail' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ResendUserEmail',
    description: 'Resend the email verification message to the user'
  })
  @ApiOkResponse({
    type: ToBackendResendUserEmailResponseDto
  })
  async resendUserEmail(
    @Body() body: ToBackendResendUserEmailRequestDto
  ): Promise<BackendResultForOperation<'resendUserEmail'>> {
    return Result.pipe(
      Result.succeed({ userId: body.input.userId }),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, GetUserCheckExistsError> =>
          this.usersService.getUserCheckExistsResult({ userId: v.userId })
      ),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
      Result.andThrough(async v => {
        if (v.user.isEmailVerified === true) {
          return Result.succeed();
        }

        await this.emailService.sendVerification({
          email: v.user.email,
          emailVerificationToken: v.user.emailVerificationToken
        });

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendResendUserEmailOutput => ({
          isEmailVerified: v.user.isEmailVerified === true
        })
      )
    );
  }
}
