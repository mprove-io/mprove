import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { inArray } from 'drizzle-orm';
import {
  ToBackendGetCachedColumnsRequestDto,
  ToBackendGetCachedColumnsResponseDto
} from '#backend/controllers/cached-columns/get-cached-columns/get-cached-columns.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  CachedColumnTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
import { EnvsService } from '#backend/services/db/envs/envs.service.js';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { CachedColumnEntToTabResultError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import type { GetCacheEnvIdResultError } from '#common/types/backend/function-errors/get-cache-env-id-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetCachedColumnsOutput } from '#common/types/backend/routes/connections/get-cached-columns/get-cached-columns-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetCachedColumnsController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private tabService: TabService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
      Result.bind(
        'cachedColumnFullIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.columns.map(column =>
              this.hashService.makeCachedColumnFullId({
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
      Result.bind(
        'cachedColumns',
        async (
          v
        ): Result.ResultAsync<
          CachedColumnTab[],
          CachedColumnEntToTabResultError
        > =>
          v.cachedColumnFullIds.length > 0
            ? this.db.drizzle.query.cachedColumnsTable
                .findMany({
                  where: inArray(
                    cachedColumnsTable.cachedColumnFullId,
                    v.cachedColumnFullIds
                  )
                })
                .then(cachedColumnEnts =>
                  Result.sequence(cachedColumnEnts, cachedColumnEnt =>
                    this.tabService.cachedColumnEntToTabResult({
                      cachedColumnEnt: cachedColumnEnt
                    })
                  )
                )
            : Result.succeed([])
      ),
      Result.map(
        (v): ToBackendGetCachedColumnsOutput => ({
          cachedColumns: v.cachedColumns.map(cachedColumn =>
            this.cachedColumnService.cachedColumnTabToApi({
              cachedColumn: cachedColumn
            })
          )
        })
      )
    );
  }
}
