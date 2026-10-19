import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetQueryRequestDto,
  ToBackendGetQueryResponseDto
} from '#backend/controllers/queries/get-query/get-query.dto';
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
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMconfigCheckExistsError } from '#common/types/backend/function-errors/get-mconfig-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetQueryCheckExistsError } from '#common/types/backend/function-errors/get-query-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetQueryOutput } from '#common/types/backend/routes/queries/get-query/get-query-output';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
// chart-dialog.component.ts -> startCheckRunning()
// models.component.ts -> checkRunning$
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
export class GetQueryController {
  constructor(
    private tabService: TabService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private parentService: ParentService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetQuery' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetQuery',
    description: 'Get a query'
  })
  @ApiOkResponse({
    type: ToBackendGetQueryResponseDto
  })
  async getQuery(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetQueryRequestDto
  ): Promise<BackendResultForOperation<'getQuery'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigId: body.input.mconfigId,
        queryId: body.input.queryId,
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
      Result.bind(
        'mconfig',
        (v): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsError> =>
          this.db.mconfigs.findFirstCheckExists({
            where: and(
              eq(mconfigsTable.mconfigId, v.mconfigId),
              eq(mconfigsTable.structId, v.bridge.structId)
            )
          })
      ),
      Result.andThrough(v =>
        v.mconfig.queryId !== v.queryId
          ? Result.fail({ code: 'BACKEND_MCONFIG_QUERY_ID_MISMATCH' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccess({
          parentId: v.mconfig.parentId,
          parentType: v.mconfig.parentType,
          modelId: v.mconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, GetQueryCheckExistsError> =>
          this.db.queries.findFirstCheckExists({
            where: and(
              eq(queriesTable.queryId, v.queryId),
              eq(queriesTable.projectId, v.projectId)
            )
          })
      ),
      Result.map(
        (v): ToBackendGetQueryOutput => ({
          query: this.queriesService.tabToApi({ query: v.query })
        })
      )
    );
  }
}
