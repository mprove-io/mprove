import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { EmailService } from '~backend/services/email.service';
import { RESTRICTED_USER_ALIAS } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendResendUserEmailRequest,
  ToBackendResendUserEmailResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-resend-user-email';
import { ServerError } from '~common/models/server-error';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
@Throttle({
  '1s': {
    limit: 2 * 2
  },
  '5s': {
    limit: 3 * 2
  },
  '60s': {
    limit: 10 * 2,
    blockDuration: seconds(24 * 60 * 60) // 24h
  },
  '600s': {
    limit: 30 * 2,
    blockDuration: seconds(24 * 60 * 60) // 24h
  }
})
@Controller()
export class ResendUserEmailController {
  constructor(
    private emailService: EmailService,
    private usersService: UsersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendResendUserEmail)
  async resendUserEmail(@Req() request: any) {
    let reqValid: ToBackendResendUserEmailRequest = request.body;

    let { userId } = reqValid.payload;

    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, userId)
      })
      .then(x => this.usersService.entToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

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
