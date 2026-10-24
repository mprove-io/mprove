import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendRunQueriesDryRequestDto,
  ToBackendRunQueriesDryResponseDto
} from '#backend/controllers/queries/run-queries-dry/run-queries-dry.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getQueryCheckExistsSkipData } from '#backend/functions/db/queries/get-query-check-exists-skip-data/get-query-check-exists-skip-data';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { checkParentAccess } from '#backend/functions/parent/check-parent-access/check-parent-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { RunQueryDryError } from '#common/types/backend/function-errors/run-query-dry-error';
import type { Env } from '#common/types/backend/parts/env';
import type { QueryEstimate } from '#common/types/backend/parts/query-estimate';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRunQueriesDryOutput } from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

type RunQueryDryOutput = {
  validEstimate?: QueryEstimate;
  errorQuery?: QueryTab;
};

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesDryController {
  constructor(
    private bigqueryService: BigQueryService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendRunQueriesDry' satisfies ToBackendRoute)
  @ApiOperation({ summary: 'RunQueriesDry', description: 'Dry-run queries' })
  @ApiOkResponse({ type: ToBackendRunQueriesDryResponseDto })
  async runQueriesDry(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRunQueriesDryRequestDto
  ): Promise<BackendResultForOperation<'runQueriesDry'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigIds: body.input.mconfigIds,
        dryId: body.input.dryId,
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
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.parentId))])
      ),
      Result.andThrough(v =>
        Result.sequence(v.uniqueParentIds, parentId => {
          let mconfig: MconfigTab = v.mconfigs.find(
            x => x.parentId === parentId
          );

          return checkParentAccess({
            parentId: mconfig.parentId,
            parentType: mconfig.parentType,
            modelId: mconfig.modelId, // for chart as parent
            user: v.user,
            userMember: v.userMember,
            structId: v.bridge.structId,
            projectId: v.projectId,
            db: this.db
          });
        })
      ),
      Result.bind('queryIds', v =>
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.queryId))])
      ),
      Result.bind('runQueryDryOutputs', v =>
        customAsyncPool({
          poolSize: 8,
          inputs: v.queryIds,
          callback: queryId =>
            this.runQueryDry({
              projectId: v.projectId,
              queryId: queryId
            })
        })
      ),
      Result.bind('validEstimates', v =>
        Result.succeed(
          v.runQueryDryOutputs
            .filter(x => isDefined(x.validEstimate))
            .map(x => x.validEstimate)
        )
      ),
      Result.bind('errorQueries', v =>
        Result.succeed(
          v.runQueryDryOutputs
            .filter(x => isDefined(x.errorQuery))
            .map(x => x.errorQuery)
        )
      ),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { queries: v.errorQueries } })
      ),
      Result.map(
        (v): ToBackendRunQueriesDryOutput => ({
          dryId: v.dryId,
          errorQueries: v.errorQueries.map(x =>
            queryTabToApi({
              query: x
            })
          ),
          validQueryEstimates: v.validEstimates
        })
      )
    );
  }

  private async runQueryDry(item: {
    projectId: string;
    queryId: string;
  }): Result.ResultAsync<RunQueryDryOutput, RunQueryDryError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('query', v =>
        getQueryCheckExistsSkipData({
          projectId: v.projectId,
          queryId: v.queryId,
          db: this.db
        })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.bind('connection', async v => {
        let apiEnv: Env = v.apiEnvs.find(x => x.envId === v.query.envId);

        let isFallbackConnection: boolean =
          apiEnv.isFallbackToProdConnections === true &&
          apiEnv.fallbackConnectionIds.includes(v.query.connectionId);

        return this.db.connections.findFirstCheckExists({
          where: and(
            eq(connectionsTable.connectionId, v.query.connectionId),
            eq(
              connectionsTable.envId,
              isFallbackConnection ? PROJECT_ENV_PROD : v.query.envId
            ),
            eq(connectionsTable.projectId, v.query.projectId)
          )
        });
      }),
      Result.andThen(v =>
        this.bigqueryService
          .runQueryDry({ query: v.query, connection: v.connection })
          .then(x => Result.succeed(x))
      )
    );
  }
}
