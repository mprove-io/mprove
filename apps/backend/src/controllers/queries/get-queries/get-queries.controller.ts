import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetQueriesRequestDto,
  ToBackendGetQueriesResponseDto
} from '#backend/controllers/queries/get-queries/get-queries.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { checkParentMemberAccess } from '#backend/functions/db/members/check-parent-member-access/check-parent-member-access';
import { getQueriesCheckExist } from '#backend/functions/db/queries/get-queries-check-exist/get-queries-check-exist';
import { getQueriesCheckExistSkipSqlData } from '#backend/functions/db/queries/get-queries-check-exist-skip-sql-data/get-queries-check-exist-skip-sql-data';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
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
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
      Result.andThrough(v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('mconfigs', v =>
        this.db.mconfigs.findMany({
          where: and(
            eq(mconfigsTable.structId, v.bridge.structId),
            inArray(mconfigsTable.mconfigId, v.mconfigIds)
          )
        })
      ),
      Result.bind('uniqueParentIds', v =>
        Result.succeed<string[]>([
          ...new Set(v.mconfigs.map(mconfig => mconfig.parentId))
        ])
      ),
      Result.andThrough(v =>
        Result.sequence(v.uniqueParentIds, parentId => {
          let mconfig: MconfigTab = v.mconfigs.find(
            mconfig => mconfig.parentId === parentId
          );

          return checkParentMemberAccess({
            parentId: mconfig.parentId,
            parentType: mconfig.parentType,
            modelId: mconfig.modelId,
            user: v.user,
            userMember: v.userMember,
            structId: v.bridge.structId,
            projectId: v.projectId,
            db: this.db
          });
        })
      ),
      Result.bind('queryIds', v =>
        Result.succeed<string[]>([
          ...new Set(v.mconfigs.map(mconfig => mconfig.queryId))
        ])
      ),
      Result.bind('queries', v =>
        v.skipData === true
          ? getQueriesCheckExistSkipSqlData({
              queryIds: v.queryIds,
              projectId: v.projectId,
              db: this.db
            })
          : getQueriesCheckExist({
              queryIds: v.queryIds,
              projectId: v.projectId,
              db: this.db
            })
      ),
      Result.map(
        (v): ToBackendGetQueriesOutput => ({
          queries: v.queries.map(query =>
            queryTabToApi({
              query: query
            })
          )
        })
      )
    );
  }
}
