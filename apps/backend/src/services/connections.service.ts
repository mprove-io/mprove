import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class ConnectionsService {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  async checkConnectionDoesNotExist(item: {
    projectId: string;
    envId: string;
    connectionId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let connection = await this.connectionsRepository.findOne({
      connection_id: connectionId,
      env_id: envId,
      project_id: projectId
    });

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

    let connection = await this.connectionsRepository.findOne({
      connection_id: connectionId,
      env_id: envId,
      project_id: projectId
    });

    if (common.isUndefined(connection)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    return connection;
  }
}
