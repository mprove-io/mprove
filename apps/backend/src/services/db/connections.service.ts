import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class ConnectionsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

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

    if (isDefined(connection)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_ALREADY_EXISTS
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

    if (isUndefined(connection)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    return connection;
  }
}
