import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetConnectionsListRequest,
  ToBackendGetConnectionsListResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connections-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionsListController {
  constructor(private getConnectionsListService: GetConnectionsListService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList)
  async getConnectionsList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionsListRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    let payload: ToBackendGetConnectionsListResponsePayload =
      await this.getConnectionsListService.getConnectionsList({
        userId: user.userId,
        projectId: projectId,
        envId: envId
      });

    return payload;
  }
}
