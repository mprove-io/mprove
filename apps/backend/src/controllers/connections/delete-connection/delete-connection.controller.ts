import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsRepository: repositories.ConnectionsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private dbService: DbService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteConnection)
  async deleteConnection(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteConnectionRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, connectionId, envId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.connectionsRepository.delete({
      project_id: projectId,
      env_id: envId,
      connection_id: connectionId
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
      modify: true,
      records: {
        bridges: [...branchBridges]
      }
    });

    let payload = {};

    return payload;
  }
}
