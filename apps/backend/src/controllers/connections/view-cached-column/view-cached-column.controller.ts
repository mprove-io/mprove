import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CachedColumnService } from '#backend/controllers/connections/cached-column/cached-column.service';
import {
  ToBackendViewCachedColumnRequestDto,
  ToBackendViewCachedColumnResponseDto
} from '#backend/controllers/connections/view-cached-column/view-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendViewCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-view-cached-column';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ViewCachedColumnController {
  constructor(private cachedColumnService: CachedColumnService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendViewCachedColumn)
  @ApiOperation({
    summary: 'ViewCachedColumn',
    description: 'View cached column'
  })
  @ApiOkResponse({ type: ToBackendViewCachedColumnResponseDto })
  async viewCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendViewCachedColumnRequestDto
  ): Promise<ToBackendViewCachedColumnResponse['payload']> {
    let { projectId, envId, connectionId, schemaName, tableName, columnName } =
      body.payload;

    return await this.cachedColumnService.viewCache({
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
