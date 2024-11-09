import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesDryController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private bigqueryService: BigQueryService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry)
  async runQueriesDry(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendRunQueriesDryRequest = request.body;

    let { projectId, dryId, queryIds } = reqValid.payload;

    let results: {
      validEstimate: common.QueryEstimate;
      errorQuery: schemaPostgres.QueryEnt;
    }[] = await asyncPool(8, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExistsSkipData({
        projectId: projectId,
        queryId: queryId
      });

      let member = await this.membersService.getMemberCheckExists({
        projectId: query.projectId,
        memberId: user.userId
      });

      let connection = await this.connectionsService.getConnectionCheckExists({
        projectId: query.projectId,
        envId: query.envId,
        connectionId: query.connectionId
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

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                queries: errorQueries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // await this.dbService.writeRecords({
    //   modify: true,
    //   records: {
    //     queries: errorQueries
    //   }
    // });

    let payload: apiToBackend.ToBackendRunQueriesDryResponsePayload = {
      dryId: dryId,
      errorQueries: errorQueries.map(x =>
        this.wrapToApiService.wrapToApiQuery(x)
      ),
      validQueryEstimates: validEstimates
    };

    return payload;
  }
}
