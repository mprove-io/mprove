import { BigQuery } from '@google-cloud/bigquery';
import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CancelQueriesController {
  constructor(
    private structsService: StructsService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private membersService: MembersService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  async cancelQueries(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCancelQueriesRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let mconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
      where: and(
        eq(mconfigsTable.structId, bridge.structId),
        inArray(mconfigsTable.mconfigId, mconfigIds)
      )
    });

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let projectConnectionsWithAnyEnvId =
      await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            queries.map(q => q.connectionId)
          )
        )
      });

    await asyncPool(
      8,
      queries.filter(q => q.status === QueryStatusEnum.Running),
      async (query: QueryEnt) => {
        let apiEnvs = await this.envsService.getApiEnvs({
          projectId: query.projectId
        });

        let apiEnv = apiEnvs.find(x => x.envId === query.envId);

        let connection = projectConnectionsWithAnyEnvId.find(
          x =>
            x.connectionId === query.connectionId &&
            x.envId ===
              (apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                ? PROJECT_ENV_PROD
                : query.envId)
        );

        if (isUndefined(connection)) {
          throw new ServerError({
            message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
          });
        }

        if (connection.type === ConnectionTypeEnum.BigQuery) {
          let bigquery = new BigQuery({
            projectId: connection.googleCloudProject,
            credentials: connection.serviceAccountCredentials
          });

          let bigqueryQueryJob = bigquery.job(query.bigqueryQueryJobId);

          // do not await
          bigqueryQueryJob.cancel().catch((e: any) => {
            logToConsoleBackend({
              log: new ServerError({
                message: ErEnum.BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL,
                originalError: e
              }),
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
        }

        query.status = QueryStatusEnum.Canceled;
        query.data = [];
        query.lastCancelTs = makeTsNumber();
        query.queryJobId = undefined; // null;
      }
    );

    let canceledQueries = queries.filter(
      x => x.status === QueryStatusEnum.Canceled
    );

    if (canceledQueries.length > 0) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  queries: canceledQueries
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let payload: ToBackendCancelQueriesResponsePayload = {
      queries: canceledQueries.map(x => this.wrapToApiService.wrapToApiQuery(x))
    };

    return payload;
  }
}
