import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private envsService: EnvsService,
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
      envId,
      connectionId,
      type,
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

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      connectionId: connectionId
    });

    await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId
    });

    let newConnection = maker.makeConnection({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      account: account,
      warehouse: warehouse,
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
