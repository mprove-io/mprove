import { Inject, Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { makeMalloyConnections } from '~node-common/functions/make-malloy-connections';
import { makeMalloyQuery } from '~node-common/functions/make-malloy-query';
import { EnvsService } from './envs.service';

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async editMalloyQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    model: common.Model;
    mconfig: common.Mconfig;
    queryOperations: common.QueryOperation[];
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

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
