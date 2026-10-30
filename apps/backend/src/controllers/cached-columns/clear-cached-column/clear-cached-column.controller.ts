import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendClearCachedColumnRequestDto,
  ToBackendClearCachedColumnResponseDto
} from '#backend/controllers/cached-columns/clear-cached-column/clear-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { cachedColumnsTable } from '#backend/drizzle/postgres/tables/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/tables/cached-parts';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getCacheEnvId } from '#backend/functions/db/envs/get-cache-env-id/get-cache-env-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { makeCachedColumnFullId } from '#backend/functions/hash/make-cached-column-full-id/make-cached-column-full-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendClearCachedColumnOutput } from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ClearCachedColumnController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendClearCachedColumn' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ClearCachedColumn',
    description: 'Clear cached column'
  })
  @ApiOkResponse({ type: ToBackendClearCachedColumnResponseDto })
  async clearCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendClearCachedColumnRequestDto
  ): Promise<BackendResultForOperation<'clearCachedColumn'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        schemaName: body.input.schemaName,
        tableName: body.input.tableName,
        columnName: body.input.columnName,
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
      Result.andThrough(v =>
        v.cacheEnvId === PROJECT_ENV_PROD
          ? getMemberCheckIsAdmin({
              memberId: v.userId,
              projectId: v.projectId,
              db: this.db
            })
          : Result.succeed()
      ),
      Result.andThrough(async v => {
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(cachedPartsTable)
            .where(
              and(
                eq(cachedPartsTable.projectId, v.projectId),
                eq(cachedPartsTable.connectionId, v.connectionId),
                eq(cachedPartsTable.envId, v.cacheEnvId),
                eq(cachedPartsTable.schemaNameLc, v.schemaName.toLowerCase()),
                eq(cachedPartsTable.tableNameLc, v.tableName.toLowerCase()),
                eq(cachedPartsTable.columnNameLc, v.columnName.toLowerCase())
              )
            );

          await tx.delete(cachedColumnsTable).where(
            eq(
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
          );
        });

        return Result.succeed();
      }),
      Result.map((v): ToBackendClearCachedColumnOutput => ({}))
    );
  }
}
