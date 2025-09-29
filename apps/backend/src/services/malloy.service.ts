import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { ServerError } from '~common/models/server-error';
import { makeMalloyConnections } from '~node-common/functions/make-malloy-connections';
import { makeMalloyQuery } from '~node-common/functions/make-malloy-query';
import { EnvsService } from './envs.service';

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async editMalloyQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    model: Model;
    mconfig: Mconfig;
    queryOperations: QueryOperation[];
  }) {
    let { projectId, envId, structId, model, mconfig, queryOperations } = item;

    let startEditMalloyQuery = Date.now();

    let { apiEnv, connectionsWithFallback } =
      await this.envsService.getApiEnvConnectionsWithFallback({
        projectId: projectId,
        envId: envId
      });

    let connection = connectionsWithFallback.find(
      x => x.connectionId === model.connectionId
    );

    let malloyConnections = makeMalloyConnections({
      connections: [connection]
    });

    let { isError, errorMessage, newMconfig, newQuery } = await makeMalloyQuery(
      {
        projectId: projectId,
        envId: envId,
        structId: structId,
        model: model,
        mconfig: mconfig,
        queryOperations: queryOperations,
        malloyConnections: malloyConnections,
        projectConnection: connection
      }
    );

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
