import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, desc, eq } from 'drizzle-orm';
import {
  ToBackendViewCachedColumnRequestDto,
  ToBackendViewCachedColumnResponseDto
} from '#backend/controllers/cached-columns/view-cached-column/view-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  CachedColumnTab,
  CachedPartTab,
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
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendWrongOffsetError } from '#common/types/backend/errors/backend-wrong-offset-error';
import type { CachedColumnEntToTabResultError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import type { CachedPartEntToTabResultError } from '#common/types/backend/function-errors/cached-part-ent-to-tab-result-error';
import type { GetCacheEnvIdResultError } from '#common/types/backend/function-errors/get-cache-env-id-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendViewCachedColumnOutput } from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ViewCachedColumnController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private tabService: TabService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
        'rows',
        (
          v
        ): Result.ResultAsync<CachedPartTab[], CachedPartEntToTabResultError> =>
          this.db.drizzle.query.cachedPartsTable
            .findMany({
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
            .then(cachedPartEnts =>
              Result.sequence(cachedPartEnts, cachedPartEnt =>
                this.tabService.cachedPartEntToTabResult({
                  cachedPartEnt: cachedPartEnt
                })
              )
            )
      ),
      Result.bind(
        'cachedColumn',
        (
          v
        ): Result.ResultAsync<
          CachedColumnTab,
          CachedColumnEntToTabResultError
        > =>
          this.db.drizzle.query.cachedColumnsTable
            .findFirst({
              where: eq(
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
            })
            .then(cachedColumnEnt =>
              isUndefined(cachedColumnEnt)
                ? Result.succeed(undefined)
                : this.tabService.cachedColumnEntToTabResult({
                    cachedColumnEnt: cachedColumnEnt
                  })
            )
      ),
      Result.map(
        (v): ToBackendViewCachedColumnOutput => ({
          cachedColumn: isUndefined(v.cachedColumn)
            ? undefined
            : this.cachedColumnService.cachedColumnTabToApi({
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
