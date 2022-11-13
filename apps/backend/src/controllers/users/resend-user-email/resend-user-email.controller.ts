import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EmailService } from '~backend/services/email.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class ResendUserEmailController {
  constructor(
    private emailService: EmailService,
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResendUserEmail)
  async resendUserEmail(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendResendUserEmailRequest = request.body;

    let { userId } = reqValid.payload;

    let user = await this.userRepository.findOne({
      where: { user_id: userId }
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    if (user.is_email_verified === common.BoolEnum.TRUE) {
      let payload: apiToBackend.ToBackendResendUserEmailResponsePayload = {
        isEmailVerified: true
      };
      return payload;
    }

    await this.emailService.sendEmailVerification({
      email: user.email,
      emailVerificationToken: user.email_verification_token
    });

    let payload: apiToBackend.ToBackendResendUserEmailResponsePayload = {
      isEmailVerified: false
    };

    return payload;
  }
}
