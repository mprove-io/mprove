import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
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
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMconfigCheckExistsResultError } from '#common/types/backend/function-errors/get-mconfig-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetQueryCheckExistsResultError } from '#common/types/backend/function-errors/get-query-check-exists-result-error';

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
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
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
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'mconfig',
        (v): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsResultError> =>
          this.mconfigsService.getMconfigCheckExistsResult({
            mconfigId: v.mconfigId,
            structId: v.bridge.structId
          })
      ),
      Result.andThrough(v =>
        v.mconfig.queryId !== v.queryId
          ? Result.fail({ code: 'BACKEND_MCONFIG_QUERY_ID_MISMATCH' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccessResult({
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
        (v): Result.ResultAsync<QueryTab, GetQueryCheckExistsResultError> =>
          this.queriesService.getQueryCheckExistsResult({
            queryId: v.queryId,
            projectId: v.projectId
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
