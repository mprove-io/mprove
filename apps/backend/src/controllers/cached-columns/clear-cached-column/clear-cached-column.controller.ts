import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendClearCachedColumnRequestDto,
  ToBackendClearCachedColumnResponseDto
} from '#backend/controllers/cached-columns/clear-cached-column/clear-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
import { EnvsService } from '#backend/services/db/envs/envs.service.js';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetCacheEnvIdResultError } from '#common/types/backend/function-errors/get-cache-env-id-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendClearCachedColumnOutput } from '#common/types/backend/routes/connections/clear-cached-column/clear-cached-column-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ClearCachedColumnController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<
          MemberTab,
          GetMemberCheckIsEditorOrAdminResultError
        > =>
          this.membersService.getMemberCheckIsEditorOrAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'cacheEnvId',
        (v): Result.ResultAsync<string, GetCacheEnvIdResultError> =>
          this.cachedColumnService.getCacheEnvIdResult({
            projectId: v.projectId,
            envId: v.envId
          })
      ),
      Result.andThrough(v =>
        v.cacheEnvId === PROJECT_ENV_PROD
          ? this.membersService.getMemberCheckIsAdminResult({
              memberId: v.userId,
              projectId: v.projectId
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
              this.hashService.makeCachedColumnFullId({
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
