import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetStateRequest,
  ToBackendGetStateResponsePayload
} from '#common/interfaces/to-backend/state/to-backend-get-state';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetStateController {
  constructor(private getStateService: GetStateService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetState)
  async getState(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetStateRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, isFetch } = reqValid.payload;

    let payload: ToBackendGetStateResponsePayload =
      await this.getStateService.getState({
        traceId: traceId,
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        isFetch: isFetch
      });

    return payload;
  }
}
