import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BigQueryService } from '~backend/services/bigquery.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';

@Controller()
export class RunQueriesDryController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private bigqueryService: BigQueryService,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry)
  async runQueriesDry(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendRunQueriesDryRequest)
    reqValid: apiToBackend.ToBackendRunQueriesDryRequest
  ) {
    let { dryId, queryIds } = reqValid.payload;

    let results: {
      validEstimate: common.QueryEstimate;
      errorQuery: entities.QueryEntity;
    }[] = await asyncPool(8, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExists({
        queryId: queryId
      });

      let member = await this.membersService.getMemberCheckExists({
        projectId: query.project_id,
        memberId: user.user_id
      });

      let connection = await this.connectionsService.getConnectionCheckExists({
        projectId: query.project_id,
        envId: query.env_id,
        connectionId: query.connection_id
      });

      let result = await this.bigqueryService.runQueryDry({
        query: query,
        connection: connection
      });

      return result;
    });

    let validEstimates = results
      .filter(result => common.isDefined(result.validEstimate))
      .map(x => x.validEstimate);

    let errorQueries = results
      .filter(result => common.isDefined(result.errorQuery))
      .map(x => x.errorQuery);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        queries: errorQueries
      }
    });

    let payload: apiToBackend.ToBackendRunQueriesDryResponsePayload = {
      dryId: dryId,
      errorQueries: errorQueries.map(x => wrapper.wrapToApiQuery(x)),
      validQueryEstimates: validEstimates
    };

    return payload;
  }
}
