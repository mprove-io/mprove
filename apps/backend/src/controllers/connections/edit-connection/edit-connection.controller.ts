import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
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
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditConnectionRequest = request.body;
    let {
      projectId,
      envId,
      connectionId,
      bigqueryCredentials,
      bigqueryQuerySizeLimitGb,
      account,
      warehouse,
      host,
      port,
      database,
      username,
      password,
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
      envId: envId,
      connectionId: connectionId
    });

    connection.account = account;
    connection.warehouse = warehouse;
    connection.host = host;
    connection.port = port;
    connection.database = database;
    connection.username = username;
    connection.password = password;
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
