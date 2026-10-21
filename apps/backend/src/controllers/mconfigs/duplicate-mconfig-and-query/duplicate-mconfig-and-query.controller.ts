import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendDuplicateMconfigAndQueryRequestDto,
  ToBackendDuplicateMconfigAndQueryResponseDto
} from '#backend/controllers/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ParentService } from '#backend/services/parent/parent.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  DEFAULT_PIVOT_COLUMNS_WIDTH,
  DEFAULT_PIVOT_FIRST_COLUMN_WIDTH
} from '#common/constants/mconfig-chart';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDuplicateMconfigAndQueryOutput } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-output';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import { makeQueryId } from '#node-common/functions/make-query-id/make-query-id';

type DuplicateMconfigAndQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

@ApiTags('Mconfigs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DuplicateMconfigAndQueryController {
  constructor(
    private parentService: ParentService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendDuplicateMconfigAndQuery' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DuplicateMconfigAndQuery',
    description: 'Duplicate an mconfig and its associated query'
  })
  @ApiOkResponse({
    type: ToBackendDuplicateMconfigAndQueryResponseDto
  })
  async duplicateMconfigAndQuery(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDuplicateMconfigAndQueryRequestDto
  ): Promise<BackendResultForOperation<'duplicateMconfigAndQuery'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        oldMconfigId: body.input.oldMconfigId,
        setPivotDefaults: body.input.setPivotDefaults,
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
      Result.bind('project', v =>
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
        this.envsService.getEnvCheckExistsAndAccess({
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
      Result.bind('oldMconfig', v =>
        this.db.mconfigs.findFirstCheckExists({
          where: and(
            eq(mconfigsTable.mconfigId, v.oldMconfigId),
            eq(mconfigsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.andThrough(v =>
        this.structsService.getStructCheckExistsAndNotChanged({
          projectId: v.projectId,
          bridgeStructId: v.bridge.structId,
          structId: v.oldMconfig.structId
        })
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccess({
          parentId: v.oldMconfig.parentId,
          parentType: v.oldMconfig.parentType,
          modelId: v.oldMconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      // Dashboard tiles and report metrics do not require model access here.
      Result.bind('model', v =>
        this.db.models.findFirstCheckExists({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            eq(modelsTable.modelId, v.oldMconfig.modelId)
          )
        })
      ),
      Result.bind('oldQuery', v =>
        this.db.queries.findFirst({
          where: and(
            eq(queriesTable.queryId, v.oldMconfig.queryId),
            eq(queriesTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('duplicateMconfigAndQueryPayload', v => {
        let newMconfigId: string = makeId();

        let newMconfigParentType: MconfigParentType =
          v.oldMconfig.parentType === 'Dashboard'
            ? 'ChartDialogDashboard'
            : v.oldMconfig.parentType === 'Report'
              ? 'ChartDialogReport'
              : v.oldMconfig.parentType;

        let newQueryId: string = makeQueryId({
          projectId: v.project.projectId,
          connectionId: v.model.connectionId,
          envId: v.envId,
          mconfigParentType: newMconfigParentType,
          mconfigParentId: v.oldMconfig.parentId,
          sql: v.oldQuery.sql,
          store: v.model.storeContent,
          storeTransformedRequestString: v.oldMconfig.storePart?.reqJsonParts
        });

        let chart: MconfigChart =
          v.setPivotDefaults === true
            ? {
                ...v.oldMconfig.chart,
                firstColumnWidth: DEFAULT_PIVOT_FIRST_COLUMN_WIDTH,
                valueColumnsWidth: DEFAULT_PIVOT_COLUMNS_WIDTH
              }
            : v.oldMconfig.chart;

        let newMconfig: MconfigTab = {
          ...v.oldMconfig,
          mconfigId: newMconfigId,
          queryId: newQueryId,
          parentType: newMconfigParentType,
          chart: chart
        };

        let newQuery: QueryTab = { ...v.oldQuery, queryId: newQueryId };

        let duplicateMconfigAndQueryPayload: DuplicateMconfigAndQueryPayload = {
          newMconfig: newMconfig,
          newQuery: newQuery
        };

        return Result.succeed(duplicateMconfigAndQueryPayload);
      }),
      Result.andThrough(v =>
        this.db.write({
          insert: {
            mconfigs: [v.duplicateMconfigAndQueryPayload.newMconfig]
          },
          insertOrUpdate: {
            queries: [v.duplicateMconfigAndQueryPayload.newQuery]
          }
        })
      ),
      Result.map(
        (v): ToBackendDuplicateMconfigAndQueryOutput => ({
          mconfig: this.mconfigsService.tabToApi({
            mconfig: v.duplicateMconfigAndQueryPayload.newMconfig,
            modelFields: v.model.fields
          }),
          query: this.queriesService.tabToApi({
            query: v.duplicateMconfigAndQueryPayload.newQuery
          })
        })
      )
    );
  }
}
