import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ServerError } from '#common/classes/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import type { QueryOperation } from '#common/zod/backend/query-operation';
import type { Model } from '#common/zod/blockml/model';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import { makeMalloyConnections } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { makeMalloyQuery } from '#node-common/functions/malloy/make-malloy-query/make-malloy-query';
import { ConnectionsService } from './db/connections.service';
import { EnvsService } from './db/envs.service';
import { MconfigsService } from './db/mconfigs.service';
import { QueriesService } from './db/queries.service';
import { UsersService } from './db/users.service';

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async editMalloyQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    mconfigParentType: MconfigParentTypeEnum;
    mconfigParentId: string;
    user: UserTab;
    model: Model;
    mconfig: MconfigTab;
    queryOperations: QueryOperation[];
  }) {
    let {
      projectId,
      envId,
      structId,
      mconfigParentType,
      mconfigParentId,
      user,
      model,
      mconfig,
      queryOperations
    } = item;

    mconfig.parentType = mconfigParentType;
    mconfig.parentId = mconfigParentId;

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    let connection = connectionsWithFallback.find(
      x => x.connectionId === model.connectionId
    );

    let projectConnection = this.connectionsService.tabToApiProjectConnection({
      connection: connection,
      isIncludePasswords: true
    });

    let malloyConnections = makeMalloyConnections({
      connections: [projectConnection]
    });

    let selectedGivens = await this.usersService.getSelectedGivens({
      user: user,
      projectId: projectId
    });

    let { isError, errorMessage, apiNewMconfig, apiNewQuery } =
      await addTraceSpan({
        spanName: 'backend.makeMalloyQuery',
        fn: () =>
          makeMalloyQuery({
            projectId: projectId,
            envId: envId,
            structId: structId,
            mconfigParentType: mconfigParentType,
            mconfigParentId: mconfigParentId,
            model: model,
            mconfig: mconfig,
            queryOperations: queryOperations,
            malloyConnections: malloyConnections,
            selectedGivens: selectedGivens
          })
      });

    let newMconfig = this.mconfigsService.apiToTab({
      apiMconfig: apiNewMconfig
    });
    let newQuery = this.queriesService.apiToTab({ apiQuery: apiNewQuery });

    malloyConnections.forEach(connection =>
      connection.close().catch(er => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_MALLOY_CONNECTION_CLOSE_ERROR,
            originalError: er
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      })
    );

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
