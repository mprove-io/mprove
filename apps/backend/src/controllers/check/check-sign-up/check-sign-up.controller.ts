import { Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackendConfig } from '#backend/config/backend-config';
import { ToBackendCheckSignUpResponseDto } from '#backend/controllers/check/check-sign-up/check-sign-up.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendCheckSignUpResponsePayload } from '#common/zod/to-backend/check/to-backend-check-sign-up';

@ApiTags('Check')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class CheckSignUpController {
  constructor(private cs: ConfigService<BackendConfig>) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCheckSignUp)
  @ApiOperation({
    summary: 'CheckSignUp',
    description: 'Check whether sign-up is restricted to invited users only'
  })
  @ApiOkResponse({
    type: ToBackendCheckSignUpResponseDto
  })
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
