import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetConnectionSchemasRequestDto,
  ToBackendGetConnectionSchemasResponseDto
} from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.dto';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetConnectionSchemasResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-connection-schemas';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSchemasController {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas)
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
  ) {
    let { projectId, envId, repoId, branchId, isRefreshExistingCache } =
      body.payload;

    let payload: ToBackendGetConnectionSchemasResponsePayload =
      await this.getConnectionSchemasService.getConnectionSchemas({
        userId: user.userId,
        projectId: projectId,
        envId: envId,
        repoId: repoId,
        branchId: branchId,
        isRefreshExistingCache: isRefreshExistingCache
      });

    return payload;
  }
}
