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
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ConnectionTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendCancelQueriesRequest,
  ToBackendCancelQueriesResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-cancel-queries';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CancelQueriesController {
  constructor(
    private tabService: TabService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCancelQueries)
  async cancelQueries(@AttachUser() user: UserTab, @Req() request: any) {
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

    let connectionsWithAnyEnvId: ConnectionTab[] =
      await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              queries.map(q => q.connectionId)
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    await asyncPool(
      8,
      queries.filter(q => q.status === QueryStatusEnum.Running),
      async (query: QueryTab) => {
        let apiEnvs = await this.envsService.getApiEnvs({
          projectId: query.projectId
        });

        let apiEnv = apiEnvs.find(x => x.envId === query.envId);

        let connection: ConnectionTab = connectionsWithAnyEnvId.find(
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
            projectId: connection.options.bigquery.googleCloudProject,
            credentials: connection.options.bigquery.serviceAccountCredentials
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
      queries: canceledQueries.map(x =>
        this.queriesService.tabToApi({ query: x })
      )
    };

    return payload;
  }
}
