import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class EditConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private dbService: DbService
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
      bigqueryCredentials,
      bigqueryQuerySizeLimitGb,
      postgresHost,
      postgresPort,
      postgresDatabase,
      postgresUser,
      postgresPassword,
      isSSL
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let connection = await this.connectionsService.getConnectionCheckExists({
      projectId: projectId,
      connectionId: connectionId
    });

    connection.postgres_host = postgresHost;
    connection.postgres_port = postgresPort;
    connection.postgres_database = postgresDatabase;
    connection.postgres_user = postgresUser;
    connection.postgres_password = postgresPassword;
    connection.bigquery_credentials = bigqueryCredentials;
    connection.bigquery_project = bigqueryCredentials?.project_id;
    connection.bigquery_client_email = bigqueryCredentials?.client_email;
    connection.bigquery_query_size_limit_gb = bigqueryQuerySizeLimitGb;
    connection.is_ssl = common.booleanToEnum(isSSL);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        connections: [connection]
      }
    });

    let payload: apiToBackend.ToBackendEditConnectionResponsePayload = {
      connection: wrapper.wrapToApiConnection(connection)
    };

    return payload;
  }
}
