import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CachedColumnService } from '#backend/controllers/connections/cached-column/cached-column.service';
import {
  ToBackendRefreshCachedColumnRequestDto,
  ToBackendRefreshCachedColumnResponseDto
} from '#backend/controllers/connections/refresh-cached-column/refresh-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendRefreshCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-refresh-cached-column';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RefreshCachedColumnController {
  constructor(private cachedColumnService: CachedColumnService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRefreshCachedColumn)
  @ApiOperation({
    summary: 'RefreshCachedColumn',
    description: 'Refresh cached column'
  })
  @ApiOkResponse({ type: ToBackendRefreshCachedColumnResponseDto })
  async refreshCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRefreshCachedColumnRequestDto
  ): Promise<ToBackendRefreshCachedColumnResponse['payload']> {
    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      refreshType,
      sampleSize
    } = body.payload;

    return await this.cachedColumnService.refreshCache({
      userId: user.userId,
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName,
      refreshType: refreshType,
      sampleSize: sampleSize
    });
  }
}
