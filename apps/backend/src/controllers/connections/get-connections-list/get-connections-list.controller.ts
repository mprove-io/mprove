import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionsListRequestDto,
  ToBackendGetConnectionsListResponseDto
} from '#backend/controllers/connections/get-connections-list/get-connections-list.dto';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetConnectionsListResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-connections-list';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionsListController {
  constructor(private getConnectionsListService: GetConnectionsListService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionsList)
  @ApiOperation({
    summary: 'GetConnectionsList',
    description:
      'Get the list of connection identifiers for a project environment'
  })
  @ApiOkResponse({
    type: ToBackendGetConnectionsListResponseDto
  })
  async getConnectionsList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetConnectionsListRequestDto
  ) {
    let { projectId, envId } = body.payload;

    let payload: ToBackendGetConnectionsListResponsePayload =
      await this.getConnectionsListService.getConnectionsList({
        userId: user.userId,
        projectId: projectId,
        envId: envId
      });

    return payload;
  }
}
