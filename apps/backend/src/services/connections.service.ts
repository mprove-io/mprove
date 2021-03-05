import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class ConnectionsService {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  async checkConnectionDoesNotExist(item: {
    connectionId: string;
    projectId: string;
  }) {
    let { projectId, connectionId } = item;

    let connection = await this.connectionsRepository.findOne({
      connection_id: connectionId,
      project_id: projectId
    });

    if (common.isDefined(connection)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_CONNECTION_ALREADY_EXISTS
      });
    }
  }

  async checkConnectionExists(item: {
    connectionId: string;
    projectId: string;
  }) {
    let { projectId, connectionId } = item;

    let connection = await this.connectionsRepository.findOne({
      connection_id: connectionId,
      project_id: projectId
    });

    if (common.isUndefined(connection)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }
  }
}