import { BigQuery } from '@google-cloud/bigquery';
import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';

@Controller()
export class CancelQueriesController {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  async cancelQueries(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCancelQueriesRequest)
    reqValid: apiToBackend.ToBackendCancelQueriesRequest
  ) {
    let { queryIds } = reqValid.payload;

    let queries =
      queryIds.length === 0
        ? []
        : await this.queriesRepository.find({
            query_id: In(queryIds)
          });

    let projectIdsWithDuplicates = queries.map(q => q.project_id);
    let uniqueProjectIds = [...new Set(projectIdsWithDuplicates)];

    let projectId = uniqueProjectIds[0];

    if (uniqueProjectIds.length > 1) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MORE_THAN_ONE_PROJECT_ID
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let projectConnections =
      queries.length === 0
        ? []
        : await this.connectionsRepository.find({
            project_id: projectId,
            connection_id: In(queries.map(q => q.connection_id))
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
            let serverError = new common.ServerError({
              message: common.ErEnum.BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL,
              originalError: e
            });

            common.logToConsole(serverError);
          });
        }

        query.status = common.QueryStatusEnum.Canceled;
        query.data = [];
        query.last_cancel_ts = helper.makeTs();
        query.query_job_id = null;
      }
    );

    await this.dbService.writeRecords({
      modify: true,
      records: {
        queries: queries
      }
    });

    let payload: apiToBackend.ToBackendCancelQueriesResponsePayload = {
      queries: queries.map(x => wrapper.wrapToApiQuery(x))
    };

    return payload;
  }
}
