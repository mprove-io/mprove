import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CachedColumnService } from '#backend/controllers/connections/cached-column/cached-column.service';
import {
  ToBackendClearCachedColumnRequestDto,
  ToBackendClearCachedColumnResponseDto
} from '#backend/controllers/connections/clear-cached-column/clear-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendClearCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-clear-cached-column';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ClearCachedColumnController {
  constructor(private cachedColumnService: CachedColumnService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendClearCachedColumn)
  @ApiOperation({
    summary: 'ClearCachedColumn',
    description: 'Clear cached column'
  })
  @ApiOkResponse({ type: ToBackendClearCachedColumnResponseDto })
  async clearCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendClearCachedColumnRequestDto
  ): Promise<ToBackendClearCachedColumnResponse['payload']> {
    let { projectId, envId, connectionId, schemaName, tableName, columnName } =
      body.payload;

    return await this.cachedColumnService.clearCache({
      userId: user.userId,
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName
    });
  }
}
