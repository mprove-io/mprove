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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetConnectionSampleResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-connection-sample';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSampleController {
  constructor(private connectionSampleService: GetConnectionSampleService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample)
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
    } = body.payload;

    let payload: ToBackendGetConnectionSampleResponsePayload =
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
