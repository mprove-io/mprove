import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EmailService } from '~backend/services/email.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class ResendUserEmailController {
  constructor(
    private emailService: EmailService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail)
  async resendUserEmail(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendResendUserEmailRequest = request.body;

    let { userId } = reqValid.payload;

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.userId, userId)
    });

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
      let payload: apiToBackend.ToBackendResendUserEmailResponsePayload = {
        isEmailVerified: true
      };
      return payload;
    }

    await this.emailService.sendEmailVerification({
      email: user.email,
      emailVerificationToken: user.emailVerificationToken
    });

    let payload: apiToBackend.ToBackendResendUserEmailResponsePayload = {
      isEmailVerified: false
    };

    return payload;
  }
}
