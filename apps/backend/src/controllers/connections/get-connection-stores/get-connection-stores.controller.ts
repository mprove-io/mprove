import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetConnectionStoresService } from '#backend/controllers/connections/get-connection-stores/get-connection-stores.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetConnectionStoresRequest,
  ToBackendGetConnectionStoresResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-stores';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionStoresController {
  constructor(private getConnectionStoresService: GetConnectionStoresService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionStores)
  async getConnectionStores(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionStoresRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    let payload: ToBackendGetConnectionStoresResponsePayload =
      await this.getConnectionStoresService.getConnectionStores({
        userId: user.userId,
        projectId: projectId,
        envId: envId
      });

    return payload;
  }
}
