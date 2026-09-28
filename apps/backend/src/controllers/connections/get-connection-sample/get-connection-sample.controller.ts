import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionSampleRequestDto,
  ToBackendGetConnectionSampleResponseDto
} from '#backend/controllers/connections/get-connection-sample/get-connection-sample.dto';
import { GetConnectionSampleService } from '#backend/controllers/connections/get-connection-sample/get-connection-sample.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendGetConnectionSampleOutput } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSampleController {
  constructor(private connectionSampleService: GetConnectionSampleService) {}

  @Post('api/ToBackendGetConnectionSample' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetConnectionSample',
    description: 'Get sample data'
  })
  @ApiOkResponse({
    type: ToBackendGetConnectionSampleResponseDto
  })
  async getConnectionSample(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetConnectionSampleRequestDto
  ) {
    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      offset
    } = body.input;

    let payload: ToBackendGetConnectionSampleOutput =
      await this.connectionSampleService.getConnectionSample({
        userId: user.userId,
        projectId: projectId,
        envId: envId,
        connectionId: connectionId,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });

    return payload;
  }
}
