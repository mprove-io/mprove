import { BigQuery } from '@google-cloud/bigquery';
import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CancelQueriesController {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository,
    private membersService: MembersService,
    private queriesService: QueriesService,
    private dbService: DbService,
    private logger: Logger,
    private cs: ConfigService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  async cancelQueries(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCancelQueriesRequest = request.body;

    let { queryIds, projectId } = reqValid.payload;

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let projectConnections = await this.connectionsRepository.find({
      where: {
        project_id: projectId,
        connection_id: In(queries.map(q => q.connection_id))
      }
    });

    await asyncPool(
      8,
      queries.filter(q => q.status === common.QueryStatusEnum.Running),
      async (query: entities.QueryEntity) => {
        let connection = projectConnections.find(
          x => x.connection_id === query.connection_id
        );

        if (common.isUndefined(connection)) {
          throw new common.ServerError({
            message: common.ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
          });
        }

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          let bigquery = new BigQuery({
            projectId: connection.bigquery_project,
            credentials: connection.bigquery_credentials
          });

          let bigqueryQueryJob = bigquery.job(query.bigquery_query_job_id);

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
        query.last_cancel_ts = helper.makeTs();
        query.query_job_id = null;
      }
    );

    let canceledQueries = queries.filter(
      x => x.status === common.QueryStatusEnum.Canceled
    );

    if (canceledQueries.length > 0) {
      await this.dbService.writeRecords({
        modify: true,
        records: {
          queries: canceledQueries
        }
      });
    }

    let payload: apiToBackend.ToBackendCancelQueriesResponsePayload = {
      queries: canceledQueries.map(x => wrapper.wrapToApiQuery(x))
    };

    return payload;
  }
}
