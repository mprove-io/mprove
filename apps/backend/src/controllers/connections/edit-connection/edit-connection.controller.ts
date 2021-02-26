import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class EditConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private connectionsRepository: repositories.ConnectionsRepository,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection)
  async editConnection(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendEditConnectionRequest)
    reqValid: apiToBackend.ToBackendEditConnectionRequest
  ) {
    let {
      projectId,
      connectionId,
      type,
      bigqueryCredentials,
      bigqueryQuerySizeLimit,
      postgresHost,
      postgresPort,
      postgresDatabase,
      postgresUser,
      postgresPassword
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.connectionsService.checkConnectionExists({
      projectId: projectId,
      connectionId: connectionId
    });

    let connection = await this.connectionsRepository.findOne({
      connection_id: connectionId,
      project_id: projectId
    });

    connection.type = type;
    connection.postgres_host = postgresHost;
    connection.postgres_port = postgresPort;
    connection.postgres_database = postgresDatabase;
    connection.postgres_user = postgresUser;
    connection.postgres_password = postgresPassword;
    connection.bigquery_credentials = bigqueryCredentials;
    connection.bigquery_query_size_limit = bigqueryQuerySizeLimit;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          connections: [connection]
        }
      });
    });

    let payload: apiToBackend.ToBackendEditConnectionResponsePayload = {
      connection: wrapper.wrapToApiConnection(connection)
    };

    return payload;
  }
}
