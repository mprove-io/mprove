import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private connection: Connection
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

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      connectionId: connectionId
    });

    let newConnection = maker.makeConnection({
      projectId: projectId,
      connectionId: connectionId,
      type: type,
      postgresHost: postgresHost,
      postgresPort: postgresPort,
      postgresDatabase: postgresDatabase,
      postgresUser: postgresUser,
      postgresPassword: postgresPassword,
      bigqueryCredentials: bigqueryCredentials,
      bigqueryQuerySizeLimit: bigqueryQuerySizeLimit
    });

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.addRecords({
        manager: manager,
        records: {
          connections: [newConnection]
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateConnectionResponsePayload = {
      connection: wrapper.wrapToApiConnection(records.connections[0])
    };

    return payload;
  }
}
