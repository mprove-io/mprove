import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import {
  ToBackendResendUserEmailRequestDto,
  ToBackendResendUserEmailResponseDto
} from '#backend/controllers/users/resend-user-email/resend-user-email.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { UsersService } from '#backend/services/db/users.service';
import { EmailService } from '#backend/services/email.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendResendUserEmailResponsePayload } from '#common/zod/to-backend/users/to-backend-resend-user-email';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendResendUserEmail)
  @ApiOperation({
    summary: 'ResendUserEmail',
    description: 'Resend the email verification message to the user'
  })
  @ApiOkResponse({
    type: ToBackendResendUserEmailResponseDto
  })
  async resendUserEmail(@Body() body: ToBackendResendUserEmailRequestDto) {
    let { userId } = body.payload;

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, userId)
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    this.usersService.checkUserIsNotRestricted({ user: user });

    if (user.isEmailVerified === true) {
      let payload: ToBackendResendUserEmailResponsePayload = {
        isEmailVerified: true
      };
      return payload;
    } else {
      await this.emailService.sendVerification({
        email: user.email,
        emailVerificationToken: user.emailVerificationToken
      });

      let payload: ToBackendResendUserEmailResponsePayload = {
        isEmailVerified: false
      };
      return payload;
    }
  }
}
