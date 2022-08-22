import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class DeleteMemberController {
  constructor(
    private rabbitService: RabbitService,
    private membersRepository: repositories.MembersRepository,
    private branchesRepository: repositories.BranchesRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteMember)
  async deleteMember(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteMemberRequest)
    reqValid: apiToBackend.ToBackendDeleteMemberRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, memberId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    if (user.user_id === memberId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ADMIN_CAN_NOT_DELETE_HIMSELF
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    let devRepoId = member.member_id;

    let toDiskDeleteDevRepoRequest: apiToDisk.ToDiskDeleteDevRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        devRepoId: devRepoId
      }
    };

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteDevRepoResponse>({
      routingKey: helper.makeRoutingKeyToDisk({
        orgId: project.org_id,
        projectId: projectId
      }),
      message: toDiskDeleteDevRepoRequest,
      checkIsOk: true
    });

    await this.membersRepository.delete({
      project_id: projectId,
      member_id: memberId
    });

    await this.branchesRepository.delete({
      project_id: projectId,
      repo_id: devRepoId
    });

    let payload = {};

    return payload;
  }
}
