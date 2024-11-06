import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';

@Injectable()
export class ConnectionsService {
  constructor(
    // private connectionsRepository: repositories.ConnectionsRepository,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async checkConnectionDoesNotExist(item: {
    projectId: string;
    envId: string;
    connectionId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.connectionId, connectionId),
        eq(connectionsTable.envId, envId),
        eq(connectionsTable.projectId, projectId)
      )
    });

    // let connection = await this.connectionsRepository.findOne({
    //   where: {
    //     connection_id: connectionId,
    //     env_id: envId,
    //     project_id: projectId
    //   }
    // });

    if (common.isDefined(connection)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CONNECTION_ALREADY_EXISTS
      });
    }
  }

  async getConnectionCheckExists(item: {
    connectionId: string;
    envId: string;
    projectId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.connectionId, connectionId),
        eq(connectionsTable.envId, envId),
        eq(connectionsTable.projectId, projectId)
      )
    });

    // let connection = await this.connectionsRepository.findOne({
    //   where: {
    //     connection_id: connectionId,
    //     env_id: envId,
    //     project_id: projectId
    //   }
    // });

    if (common.isUndefined(connection)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    return connection;
  }
}
