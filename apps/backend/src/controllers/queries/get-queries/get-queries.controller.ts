import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetQueriesRequestDto,
  ToBackendGetQueriesResponseDto
} from '#backend/controllers/queries/get-queries/get-queries.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MconfigTab,
  MemberTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ParentService } from '#backend/services/parent/parent.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetQueriesCheckExistError } from '#common/types/backend/function-errors/get-queries-check-exist-error';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetQueriesOutput } from '#common/types/backend/routes/queries/get-queries/get-queries-output';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
// dashboards.component.ts -> startCheckRunning()
@Throttle({
  '1s': {
    limit: 3 * THROTTLE_MULTIPLIER * 1.5
  },
  '5s': {
    limit: 5 * THROTTLE_MULTIPLIER * 1.5
  },
  '60s': {
    limit: (60 / 3) * THROTTLE_MULTIPLIER * 1.5
  },
  '600s': {
    limit: 10 * (60 / 3) * THROTTLE_MULTIPLIER * 1.5,
    blockDuration: seconds(12 * 60 * 60)
  }
})
@Controller()
export class GetQueriesController {
  constructor(
    private parentService: ParentService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetQueries' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetQueries',
    description: 'Get queries for specified mconfigs'
  })
  @ApiOkResponse({
    type: ToBackendGetQueriesResponseDto
  })
  async getQueries(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetQueriesRequestDto
  ): Promise<BackendResultForOperation<'getQueries'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigIds: body.input.mconfigIds,
        skipData: body.input.skipData,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.db.bridges.findFirstCheckExists({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.andThrough(v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'mconfigs',
        (v): Result.ResultAsync<MconfigTab[], MconfigEntToTabError> =>
          this.db.mconfigs.findMany({
            where: and(
              eq(mconfigsTable.structId, v.bridge.structId),
              inArray(mconfigsTable.mconfigId, v.mconfigIds)
            )
          })
      ),
      Result.bind(
        'uniqueParentIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            ...new Set(v.mconfigs.map(mconfig => mconfig.parentId))
          ])
      ),
      Result.andThrough(v =>
        Result.sequence(v.uniqueParentIds, parentId => {
          let mconfig: MconfigTab = v.mconfigs.find(
            mconfig => mconfig.parentId === parentId
          );

          return this.parentService.checkParentAccess({
            parentId: mconfig.parentId,
            parentType: mconfig.parentType,
            modelId: mconfig.modelId,
            user: v.user,
            userMember: v.userMember,
            structId: v.bridge.structId,
            projectId: v.projectId
          });
        })
      ),
      Result.bind(
        'queryIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            ...new Set(v.mconfigs.map(mconfig => mconfig.queryId))
          ])
      ),
      Result.bind(
        'queries',
        (
          v
        ): Result.ResultAsync<
          QueryTab[],
          GetQueriesCheckExistError | GetQueriesCheckExistSkipSqlDataError
        > =>
          v.skipData === true
            ? this.queriesService.getQueriesCheckExistSkipSqlData({
                queryIds: v.queryIds,
                projectId: v.projectId
              })
            : this.queriesService.getQueriesCheckExist({
                queryIds: v.queryIds,
                projectId: v.projectId
              })
      ),
      Result.map(
        (v): ToBackendGetQueriesOutput => ({
          queries: v.queries.map(query =>
            this.queriesService.tabToApi({ query: query })
          )
        })
      )
    );
  }
}
