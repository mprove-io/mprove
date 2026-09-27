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
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendGetConnectionsListOutput } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-response';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionsListController {
  constructor(private getConnectionsListService: GetConnectionsListService) {}

  @Post('api/ToBackendGetConnectionsList' satisfies ToBackendRoute)
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
    let { projectId, envId } = body.input;

    let payload: ToBackendGetConnectionsListOutput =
      await this.getConnectionsListService.getConnectionsList({
        userId: user.userId,
        projectId: projectId,
        envId: envId
      });

    return payload;
  }
}
