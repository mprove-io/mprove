import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, desc, eq } from 'drizzle-orm';
import {
  type ToBackendViewCachedColumnRequestDto,
  ToBackendViewCachedColumnResponseDto
} from '#backend/controllers/cached-columns/view-cached-column/view-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { cachedColumnsTable } from '#backend/drizzle/postgres/tables/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/tables/cached-parts';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { cachedColumnTabToApi } from '#backend/functions/db/cached-columns/cached-column-tab-to-api/cached-column-tab-to-api';
import { makeCachedColumnFullId } from '#backend/functions/db/cached-columns/make-cached-column-full-id/make-cached-column-full-id';
import { getCacheEnvId } from '#backend/functions/db/envs/get-cache-env-id/get-cache-env-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendWrongOffsetError } from '#common/types/backend/errors/backend-wrong-offset-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendViewCachedColumnOutput } from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ViewCachedColumnController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendViewCachedColumn' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ViewCachedColumn',
    description: 'View cached column'
  })
  @ApiOkResponse({ type: ToBackendViewCachedColumnResponseDto })
  async viewCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendViewCachedColumnRequestDto
  ): Promise<BackendResultForOperation<'viewCachedColumn'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        schemaName: body.input.schemaName,
        tableName: body.input.tableName,
        columnName: body.input.columnName,
        offset: body.input.offset,
        userId: user.userId
      }),
      Result.andThrough(v =>
        !Number.isInteger(v.offset) || v.offset < 0
          ? Result.fail({
              code: 'BACKEND_WRONG_OFFSET'
            } satisfies BackendWrongOffsetError)
          : Result.succeed()
      ),
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
      Result.bind('rows', v =>
        this.db.cachedParts.findMany({
          where: and(
            eq(cachedPartsTable.projectId, v.projectId),
            eq(cachedPartsTable.connectionId, v.connectionId),
            eq(cachedPartsTable.envId, v.cacheEnvId),
            eq(cachedPartsTable.schemaNameLc, v.schemaName.toLowerCase()),
            eq(cachedPartsTable.tableNameLc, v.tableName.toLowerCase()),
            eq(cachedPartsTable.columnNameLc, v.columnName.toLowerCase())
          ),
          orderBy: desc(cachedPartsTable.count),
          limit: 100,
          offset: v.offset
        })
      ),
      Result.bind('cachedColumn', v =>
        this.db.cachedColumns.findFirst({
          where: eq(
            cachedColumnsTable.cachedColumnFullId,
            makeCachedColumnFullId({
              projectId: v.projectId,
              connectionId: v.connectionId,
              envId: v.cacheEnvId,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName
            })
          )
        })
      ),
      Result.map(
        (v): ToBackendViewCachedColumnOutput => ({
          cachedColumn: isUndefined(v.cachedColumn)
            ? undefined
            : cachedColumnTabToApi({
                cachedColumn: v.cachedColumn
              }),
          columnNames: ['Value', 'Count'],
          rows: v.rows.map(row => [
            row.columnValue ?? '',
            row.count.toString()
          ]),
          errorMessage: v.cachedColumn?.errorMessage
        })
      )
    );
  }
}
