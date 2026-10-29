import { BigQuery, type Job } from '@google-cloud/bigquery';
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCancelQueriesRequestDto,
  ToBackendCancelQueriesResponseDto
} from '#backend/controllers/queries/cancel-queries/cancel-queries.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getQueriesCheckExistSkipSqlData } from '#backend/functions/db/queries/get-queries-check-exist-skip-sql-data/get-queries-check-exist-skip-sql-data';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { checkParentAccess } from '#backend/functions/parent/check-parent-access/check-parent-access';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CancelQueryError } from '#common/types/backend/function-errors/cancel-query-error';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCancelQueriesOutput } from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CancelQueriesController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendCancelQueries' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CancelQueries',
    description: 'Cancel running queries for specified mconfigs'
  })
  @ApiOkResponse({ type: ToBackendCancelQueriesResponseDto })
  async cancelQueries(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCancelQueriesRequestDto
  ): Promise<BackendResultForOperation<'cancelQueries'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigIds: body.input.mconfigIds,
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
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.queryId))])
      ),
      Result.bind('queries', v =>
        getQueriesCheckExistSkipSqlData({
          queryIds: v.queryIds,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('connectionsWithAnyEnvId', v =>
        this.db.connections.findMany({
          where: and(
            eq(connectionsTable.projectId, v.projectId),
            inArray(
              connectionsTable.connectionId,
              v.queries.map(q => q.connectionId)
            )
          )
        })
      ),
      Result.andThrough(v =>
        customAsyncPool({
          poolSize: 8,
          inputs: v.queries.filter(q => q.status === 'Running'),
          callback: query =>
            this.cancelQuery({
              query: query,
              connectionsWithAnyEnvId: v.connectionsWithAnyEnvId
            })
        })
      ),
      Result.bind('canceledQueries', v =>
        Result.succeed(v.queries.filter(x => x.status === 'Canceled'))
      ),
      Result.andThrough(v =>
        v.canceledQueries.length === 0
          ? Result.succeed()
          : this.db.write({
              insertOrUpdate: { queries: v.canceledQueries }
            })
      ),
      Result.map(
        (v): ToBackendCancelQueriesOutput => ({
          queries: v.canceledQueries.map(x =>
            queryTabToApi({
              query: x
            })
          )
        })
      )
    );
  }

  private async cancelQuery(item: {
    query: QueryTab;
    connectionsWithAnyEnvId: ConnectionTab[];
  }): Result.ResultAsync<void, CancelQueryError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.query.projectId })
      ),
      Result.bind('connection', v => {
        let apiEnv: Env = v.apiEnvs.find(x => x.envId === v.query.envId);

        let connection: ConnectionTab = v.connectionsWithAnyEnvId.find(
          x =>
            x.connectionId === v.query.connectionId &&
            x.envId ===
              (apiEnv.fallbackConnectionIds.includes(v.query.connectionId)
                ? PROJECT_ENV_PROD
                : v.query.envId)
        );

        return isUndefined(connection)
          ? Result.fail({ code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' })
          : Result.succeed(connection);
      }),
      Result.andThrough(v => {
        if (v.connection.type === 'BigQuery') {
          let bigquery: BigQuery = new BigQuery({
            projectId: v.connection.options.bigquery.googleCloudProject,
            credentials: v.connection.options.bigquery.serviceAccountCredentials
          });

          let bigqueryQueryJob: Job = bigquery.job(v.query.bigqueryQueryJobId);

          void bigqueryQueryJob.cancel().catch((e: unknown) => {
            logToConsoleBackend({
              log: new ServerError({
                message: 'BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL',
                originalError: e
              }),
              logLevel: 'Error',
              logger: this.logger,
              cs: this.cs
            });
          });
        }

        return Result.succeed();
      }),
      Result.map(v => {
        v.query.status = 'Canceled';

        v.query.data = [];

        v.query.lastCancelTs = makeTsNumber();

        v.query.queryJobId = undefined;

        return v;
      }),
      Result.map((v): void => undefined)
    );
  }
}
