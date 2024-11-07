import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';

@UseGuards(ValidateRequestGuard)
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
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendRunQueriesDryRequest = request.body;

    let { projectId, dryId, queryIds } = reqValid.payload;

    let results: {
      validEstimate: common.QueryEstimate;
      errorQuery: schemaPostgres.QueryEntity;
    }[] = await asyncPool(8, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExistsSkipData({
        projectId: projectId,
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
