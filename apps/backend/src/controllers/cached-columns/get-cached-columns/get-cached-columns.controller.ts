import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq, inArray } from 'drizzle-orm';
import {
  type ToBackendGetCachedColumnsRequestDto,
  ToBackendGetCachedColumnsResponseDto
} from '#backend/controllers/cached-columns/get-cached-columns/get-cached-columns.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { cachedColumnTabToApi } from '#backend/functions/db/cached-column/cached-column-tab-to-api/cached-column-tab-to-api';
import { getCacheEnvId } from '#backend/functions/db/cached-column/get-cache-env-id/get-cache-env-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { makeCachedColumnFullId } from '#backend/functions/hash/make-cached-column-full-id/make-cached-column-full-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetCachedColumnsOutput } from '#common/types/backend/routes/connections/get-cached-columns/get-cached-columns-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetCachedColumnsController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetCachedColumns' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetCachedColumns',
    description: 'Get cached columns'
  })
  @ApiOkResponse({ type: ToBackendGetCachedColumnsResponseDto })
  async getCachedColumns(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetCachedColumnsRequestDto
  ): Promise<BackendResultForOperation<'getCachedColumns'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        columns: body.input.columns,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('cacheEnvId', v =>
        getCacheEnvId({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind('cachedColumnFullIds', v =>
        Result.succeed(
          v.columns.map(column =>
            makeCachedColumnFullId({
              projectId: v.projectId,
              connectionId: column.connectionId,
              envId: v.cacheEnvId,
              schemaName: column.schemaName,
              tableName: column.tableName,
              columnName: column.columnName
            })
          )
        )
      ),
      Result.bind('cachedColumns', async v =>
        v.cachedColumnFullIds.length > 0
          ? this.db.cachedColumns.findMany({
              where: inArray(
                cachedColumnsTable.cachedColumnFullId,
                v.cachedColumnFullIds
              )
            })
          : Result.succeed([])
      ),
      Result.map(
        (v): ToBackendGetCachedColumnsOutput => ({
          cachedColumns: v.cachedColumns.map(cachedColumn =>
            cachedColumnTabToApi({
              cachedColumn: cachedColumn
            })
          )
        })
      )
    );
  }
}
