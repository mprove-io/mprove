import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendGetQueryRequestDto,
  ToBackendGetQueryResponseDto
} from '#backend/controllers/queries/get-query/get-query.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { checkParentAccess } from '#backend/functions/parent/check-parent-access/check-parent-access';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
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
  constructor(private db: DbService) {}

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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
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
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('mconfig', v =>
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
        checkParentAccess({
          parentId: v.mconfig.parentId,
          parentType: v.mconfig.parentType,
          modelId: v.mconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('query', v =>
        this.db.queries.findFirstCheckExists({
          where: and(
            eq(queriesTable.queryId, v.queryId),
            eq(queriesTable.projectId, v.projectId)
          )
        })
      ),
      Result.map(
        (v): ToBackendGetQueryOutput => ({
          query: queryTabToApi({
            query: v.query
          })
        })
      )
    );
  }
}
