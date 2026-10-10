import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionSchemasRequestDto,
  ToBackendGetConnectionSchemasResponseDto
} from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.dto';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
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
export class GetConnectionSchemasController {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService
  ) {}

  @Post('api/ToBackendGetConnectionSchemas' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetConnectionSchemas',
    description: 'Get database schemas available through a SQL connection'
  })
  @ApiOkResponse({
    type: ToBackendGetConnectionSchemasResponseDto
  })
  async getConnectionSchemas(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetConnectionSchemasRequestDto
  ): Promise<BackendResultForOperation<'getConnectionSchemas'>> {
    return this.getConnectionSchemasService.getConnectionSchemasResult({
      ...body.input,
      userId: user.userId
    });
  }
}
