import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection)
  async createConnection(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateConnectionRequest)
    reqValid: apiToBackend.ToBackendCreateConnectionRequest
  ) {
    let {
      projectId,
      connectionId,
      type,
      bigqueryCredentials,
      bigqueryQuerySizeLimitGb,
      account,
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

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      connectionId: connectionId
    });

    let newConnection = maker.makeConnection({
      projectId: projectId,
      connectionId: connectionId,
      type: type,
      account: account,
      host: host,
      port: port,
      database: database,
      username: username,
      password: password,
      bigqueryCredentials: bigqueryCredentials,
      bigqueryQuerySizeLimitGb: bigqueryQuerySizeLimitGb,
      isSSL: isSSL
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        connections: [newConnection]
      }
    });

    let payload: apiToBackend.ToBackendCreateConnectionResponsePayload = {
      connection: wrapper.wrapToApiConnection(newConnection)
    };

    return payload;
  }
}
