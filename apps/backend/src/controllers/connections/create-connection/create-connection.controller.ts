import { Controller, Post } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
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
    private bridgesRepository: repositories.BridgesRepository,
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

    let member = await this.membersService.getMemberCheckExists({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
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

    let branchBridges = await this.bridgesRepository.find({
      where: {
        project_id: projectId,
        env_id: envId
      }
    });

    await forEachSeries(branchBridges, async x => {
      x.need_validate = common.BoolEnum.TRUE;
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        connections: [newConnection]
      }
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        bridges: [...branchBridges]
      }
    });

    let payload: apiToBackend.ToBackendCreateConnectionResponsePayload = {
      connection: wrapper.wrapToApiConnection(newConnection)
    };

    return payload;
  }
}
