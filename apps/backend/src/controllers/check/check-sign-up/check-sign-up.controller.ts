import { Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendCheckSignUpResponsePayload } from '#common/interfaces/to-backend/check/to-backend-check-sign-up';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, ValidateRequestGuard)
@Controller()
export class CheckSignUpController {
  constructor(private cs: ConfigService<BackendConfig>) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCheckSignUp)
  async completeUserRegistration() {
    let payload: ToBackendCheckSignUpResponsePayload = {
      isRegisterOnlyInvitedUsers:
        this.cs.get<BackendConfig['registerOnlyInvitedUsers']>(
          'registerOnlyInvitedUsers'
        ) === true
    };

    return payload;
  }
}
