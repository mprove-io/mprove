import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateEnvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private branchesRepository: repositories.BranchesRepository,
    private membersRepository: repositories.MembersRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  async createEnv(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateEnvRequest)
    reqValid: apiToBackend.ToBackendCreateEnvRequest
  ) {
    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.envsService.checkEnvDoesNotExist({
      projectId: projectId,
      envId: envId
    });

    let newEnv = maker.makeEnv({
      projectId: projectId,
      envId: envId
    });

    let branches = await this.branchesRepository.find({
      project_id: projectId
    });

    let newBridges: entities.BridgeEntity[] = [];

    branches.forEach(x => {
      let newBridge = maker.makeBridge({
        projectId: projectId,
        repoId: x.repo_id,
        branchId: x.branch_id,
        envId: envId,
        structId: common.EMPTY_STRUCT_ID,
        needValidate: common.BoolEnum.TRUE
      });

      newBridges.push(newBridge);
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        envs: [newEnv],
        bridges: newBridges
      }
    });

    let connections = await this.connectionsRepository.find({
      where: {
        project_id: projectId,
        env_id: newEnv.env_id
      }
    });

    let members = await this.membersRepository.find({
      project_id: projectId
    });

    let envConnectionIds = connections.map(x => x.connection_id);

    let payload: apiToBackend.ToBackendCreateEnvResponsePayload = {
      env: wrapper.wrapToApiEnv({
        env: newEnv,
        envConnectionIds: envConnectionIds,
        envMembers:
          newEnv.env_id === common.PROJECT_ENV_PROD
            ? members
            : members.filter(m => m.envs.indexOf(newEnv.env_id) > -1)
      })
    };

    return payload;
  }
}
