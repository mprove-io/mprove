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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CancelQueriesController {
  constructor(
    private membersService: MembersService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  async cancelQueries(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCancelQueriesRequest = request.body;

    let { queryIds, projectId } = reqValid.payload;

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

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
      queries.filter(q => q.status === common.QueryStatusEnum.Running),
      async (query: schemaPostgres.QueryEnt) => {
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

        if (common.isUndefined(connection)) {
          throw new common.ServerError({
            message: common.ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
          });
        }

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          let bigquery = new BigQuery({
            projectId: connection.googleCloudProject,
            credentials: connection.serviceAccountCredentials
          });

          let bigqueryQueryJob = bigquery.job(query.bigqueryQueryJobId);

          // do not await
          bigqueryQueryJob.cancel().catch((e: any) => {
            logToConsoleBackend({
              log: new common.ServerError({
                message: common.ErEnum.BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL,
                originalError: e
              }),
              logLevel: common.LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
        }

        query.status = common.QueryStatusEnum.Canceled;
        query.data = [];
        query.lastCancelTs = makeTsNumber();
        query.queryJobId = undefined; // null;
      }
    );

    let canceledQueries = queries.filter(
      x => x.status === common.QueryStatusEnum.Canceled
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

    let payload: apiToBackend.ToBackendCancelQueriesResponsePayload = {
      queries: canceledQueries.map(x => this.wrapToApiService.wrapToApiQuery(x))
    };

    return payload;
  }
}
