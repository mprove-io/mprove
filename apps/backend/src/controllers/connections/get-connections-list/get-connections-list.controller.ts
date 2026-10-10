import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionsListRequestDto,
  ToBackendGetConnectionsListResponseDto
} from '#backend/controllers/connections/get-connections-list/get-connections-list.dto';
import { GetConnectionsListService } from '#backend/controllers/connections/get-connections-list/get-connections-list.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

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
  ): Promise<BackendResultForOperation<'getConnectionsList'>> {
    return this.getConnectionsListService.getConnectionsListResult({
      ...body.input,
      userId: user.userId
    });
  }
}
