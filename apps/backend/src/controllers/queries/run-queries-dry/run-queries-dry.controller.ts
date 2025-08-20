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
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { QueriesService } from '~backend/services/queries.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/_index';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesDryController {
  constructor(
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private bigqueryService: BigQueryService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry)
  async runQueriesDry(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendRunQueriesDryRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds, dryId } =
      reqValid.payload;

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
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

    let results: {
      validEstimate: QueryEstimate;
      errorQuery: QueryEnt;
    }[] = await asyncPool(8, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExistsSkipData({
        projectId: projectId,
        queryId: queryId
      });

      let member = await this.membersService.getMemberCheckExists({
        projectId: query.projectId,
        memberId: user.userId
      });

      let apiEnvs = await this.envsService.getApiEnvs({
        projectId: projectId
      });

      let apiEnv = apiEnvs.find(x => x.envId === query.envId);

      let connection = await this.connectionsService.getConnectionCheckExists({
        projectId: query.projectId,
        envId:
          apiEnv.isFallbackToProdConnections === true &&
          apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
            ? PROJECT_ENV_PROD
            : query.envId,
        connectionId: query.connectionId
      });

      let result = await this.bigqueryService.runQueryDry({
        query: query,
        connection: connection
      });

      return result;
    });

    let validEstimates = results
      .filter(result => isDefined(result.validEstimate))
      .map(x => x.validEstimate);

    let errorQueries = results
      .filter(result => isDefined(result.errorQuery))
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

    let payload: ToBackendRunQueriesDryResponsePayload = {
      dryId: dryId,
      errorQueries: errorQueries.map(x =>
        this.wrapToApiService.wrapToApiQuery(x)
      ),
      validQueryEstimates: validEstimates
    };

    return payload;
  }
}
