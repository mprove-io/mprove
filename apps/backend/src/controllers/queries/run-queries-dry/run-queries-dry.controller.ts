import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { QueryTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ConnectionsService } from '~backend/services/db/connections.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { BigQueryService } from '~backend/services/dwh/bigquery.service';
import { ParentService } from '~backend/services/parent.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { QueryEstimate } from '~common/interfaces/backend/query-estimate';
import {
  ToBackendRunQueriesDryRequest,
  ToBackendRunQueriesDryResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-run-queries-dry';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesDryController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private bigqueryService: BigQueryService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRunQueriesDry)
  async runQueriesDry(@AttachUser() user: UserTab, @Req() request: any) {
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

    await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let mconfigs = await this.db.drizzle.query.mconfigsTable
      .findMany({
        where: and(
          eq(mconfigsTable.structId, bridge.structId),
          inArray(mconfigsTable.mconfigId, mconfigIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.mconfigEntToTab(x)));

    let uniqueParentIds = [...new Set(mconfigs.map(x => x.parentId))];

    await forEachSeries(uniqueParentIds, async parentId => {
      let mconfig = mconfigs.find(x => x.parentId === parentId); // any mconfig

      await this.parentService.checkAccess({
        parentId: mconfig.parentId,
        parentType: mconfig.parentType,
        modelId: mconfig.modelId, // for chart as parent
        user: user,
        userMember: userMember,
        structId: bridge.structId,
        projectId: projectId
      });
    });

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let results: {
      validEstimate: QueryEstimate;
      errorQuery: QueryTab;
    }[] = await asyncPool(8, queryIds, async queryId => {
      let query = await this.queriesService.getQueryCheckExistsSkipData({
        projectId: projectId,
        queryId: queryId
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
        this.queriesService.tabToApi({ query: x })
      ),
      validQueryEstimates: validEstimates
    };

    return payload;
  }
}
