import { Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackendConfig } from '#backend/config/backend-config';
import { ToBackendCheckSignUpResponseDto } from '#backend/controllers/check/check-sign-up/check-sign-up.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import type { ToBackendCheckSignUpOutput } from '#common/types/backend/routes/check/check-sign-up/check-sign-up-output';
import type { ToBackendRoute } from '#common/types/to-backend-route';

@ApiTags('Check')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Controller()
export class CheckSignUpController {
  constructor(private cs: ConfigService<BackendConfig>) {}

  @Post('api/ToBackendCheckSignUp' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CheckSignUp',
    description: 'Check whether sign-up is restricted to invited users only'
  })
  @ApiOkResponse({
    type: ToBackendCheckSignUpResponseDto
  })
  async completeUserRegistration() {
    let payload: ToBackendCheckSignUpOutput = {
      isRegisterOnlyInvitedUsers:
        this.cs.get<BackendConfig['registerOnlyInvitedUsers']>(
          'registerOnlyInvitedUsers'
        ) === true
    };

    return payload;
  }
}
